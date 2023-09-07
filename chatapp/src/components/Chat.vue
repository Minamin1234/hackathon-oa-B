<script setup>
import { inject, ref, reactive, onMounted } from "vue"
import io from "socket.io-client"

// #region global state
const userName = inject("userName")
// const userName = "Rakus"
// #endregion

// #region local variable
const socket = io()
// #endregion

// #region reactive variable
const chatContent = ref("")
const chatList = reactive([])
const memoList = reactive([])

var Passsec = 0
var PassageID = null

const TimeCount = ()=>{
  Passsec++;
  //console.log(Passsec);
  if(Passsec == 10){
    //console.log("3!!");
    TimerStop(PassageID);
  }
}

const TimerStart = () =>{
  PassageID = setInterval(TimeCount, 1000);
  document.getElementById("postbutton").disabled = true;
  //console.log("TimerStart");
}

const TimerStop = () =>{
  Passsec = 0;
  //console.log("Stop!!");
  clearInterval(PassageID);
  document.getElementById("postbutton").disabled = false;
}

const RealTime = ()=>{
  var NowTime = new Date()
  var Year = NowTime.getFullYear()
  var Month = NowTime.getMonth()
  var date = NowTime.getDate()
  var hour = NowTime.getHours()
  var min = ("0"+NowTime.getMinutes()).slice(-2)

  return `${Year}/${Month + 1}/${date} ${hour}:${min}`
};

// #endregion

// #region lifecycle
onMounted(() => {
  registerSocketEvent()
})
// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  // 投稿内容が空でないかを確認
  if(0 < Passsec) return
  if (chatContent.value.trim() !== "") {
    let msg = { 
      name: userName.value,
      content: chatContent.value,
      time : RealTime(),
    };
    socket.emit("publishEvent", msg);
    // 入力欄を初期化
    chatContent.value = ""
    //console.log(msg)
    TimerStart();
  } else {
    // Display an alert if the message is empty
    alert("メッセージを入力してください。");
  }
}

// 退室メッセージをサーバに送信する
const onExit = () => {
  socket.emit("exitEvent", userName.value)
}

// メモを画面上に表示する
const onMemo = () => {
  // メモの内容を表示
  let msg = {
    name: "自分",
    content: chatContent.value,
    time : RealTime(),
  };

  memoList.unshift(msg);
  // 入力欄を初期化
  chatContent.value = ""
}
// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  chatList.push(data);
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.push(data);
}

// サーバから受信した投稿メッセージを画面上に表示する
const onReceivePublish = (data) => {
  chatList.unshift(data);
}
// #endregion

// #region local methods
// イベント登録をまとめる
const registerSocketEvent = () => {
  // 入室イベントを受け取ったら実行
  socket.on("enterEvent", (data) => {
    console.log(data)
    let msg = {
      name: "システム",
      content: `${data}さんが入室しました。`,
      time: RealTime(),
    }
    chatList.unshift(msg)
  })

  // 退室イベントを受け取ったら実行
  socket.on("exitEvent", (data) => {
    let msg = {
      name: "システム",
      content: `${data}さんが退室しました。`,
      time : RealTime(),
    }
    chatList.unshift(msg)
  })

  // 投稿イベントを受け取ったら実行
  socket.on("publishEvent", (data) => {
    onReceivePublish(data);
  })
}

// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Vue.js Chat チャットルーム</h1>
    <div class="mt-10">
      <p>ログインユーザ：{{ userName }}さん</p>
      <textarea variant="outlined" 
      placeholder="投稿文を入力してください" 
      rows="4" class="area" 
      type="text" 
      v-model="chatContent"
      @keydown.enter.exact="onPublish">
      </textarea>
      <div class="mt-5">
        <button class="button-normal" type="button"  id = "postbutton" @click="onPublish">投稿</button>
        <button class="button-normal util-ml-8px" type="button" @click="onMemo">メモ</button>
      </div>
      <ul>
        <li
          class="item mt-4"
          v-for="(chat, i) in chatList"
          :key="i"
          :class="{'my-post': chat.name === userName && chat.name !== 'システム','other-user-post': chat.name !== userName && chat.name !== 'システム'}"
        >
        {{ userName !== 'システム' && chat.name === 'システム' ? '' : chat.name + 'さん:' }} {{ chat.content }} ({{ chat.time }})
        </li>
      </ul>
      <ul>
        <li
          class="item mt-4"
          v-for="(msg, i) in memoList"
          :key="i"
        >
          {{ msg.name }}: {{ msg.content }}
        </li>
      </ul>
    </div>
    <router-link to="/" class="link">
      <button type="button" class="button-normal button-exit" @click="onExit">退室する</button>
    </router-link>
  </div>
</template>

<style scoped>
.link {
  text-decoration: none;
}

.area {
  width: 500px;
  border: 1px solid #000;
  margin-top: 8px;
}

.item {
  display: block;
  white-space: pre-wrap;
}

.my-post {
  background-color: rgba(255, 255, 0, 0.427); /* 自分の投稿の背景色 */
  border: 2px solid orange; /* 2ピクセル幅のオレンジのボーダーを追加 */
  border-radius: 8px;
  padding: 8px;
}

.other-user-post {
  background-color: rgba(195, 222, 233, 0.577); /* 相手の投稿の背景色 */
  border: 2px solid blue; /* 2ピクセル幅のブルーのボーダーを追加 */
  border-radius: 8px;
  padding: 8px;
}

.util-ml-8px {
  margin-left: 8px;
}

.button-exit {
  color: #000;
  margin-top: 8px;
}
</style>