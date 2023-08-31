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
// #endregion

// #region lifecycle
onMounted(() => {
  registerSocketEvent()
})
// #endregion

// #region browser event handler
// 投稿メッセージをサーバに送信する
const onPublish = () => {
  let msg = { 
    name: userName,
    content: chatContent.value
  }
  socket.emit("publishEvent", msg);
  // 入力欄を初期化
  chatContent.value = ""
  console.log(msg)
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
    content: chatContent.value
  }

  memoList.unshift(msg);
  // 入力欄を初期化
  chatContent.value = ""
}
// #endregion

// #region socket event handler
// サーバから受信した入室メッセージ画面上に表示する
const onReceiveEnter = (data) => {
  let msg = {
    name: "sys",
    content: `${userName}が入室しました`
  }
  chatList.push(msg)
}

// サーバから受信した退室メッセージを受け取り画面上に表示する
const onReceiveExit = (data) => {
  chatList.push()
}

// サーバから受信した投稿メッセージを画面上に表示する
const onReceivePublish = (data) => {
  chatList.push()
}
// #endregion

// #region local methods
// イベント登録をまとめる
const registerSocketEvent = () => {
  // 入室イベントを受け取ったら実行

  socket.on("enterEvent", (data) => {
    chatList.unshift(data)
  })

  // 退室イベントを受け取ったら実行
  socket.on("exitEvent", (data) => {

    chatList.unshift(data)
  })

  // 投稿イベントを受け取ったら実行
  socket.on("publishEvent", (data) => {
    chatList.unshift(data)
  })
}
// #endregion
</script>

<template>
  <div class="mx-auto my-5 px-4">
    <h1 class="text-h3 font-weight-medium">Vue.js Chat チャットルーム</h1>
    <div class="mt-10">
      <p>ログインユーザ：{{ userName }}さん</p>
      <textarea variant="outlined" placeholder="投稿文を入力してください" rows="4" class="area" type="text" v-model="chatContent"></textarea>
      <div class="mt-5">
        <button class="button-normal" type="button" @click="onPublish">投稿</button>
        <button class="button-normal util-ml-8px" type="button" @click="onMemo">メモ</button>
      </div>
      <div class="mt-5" v-if="chatList.length !== 0">
        <ul>
          <li class="item mt-4" v-for="(chat, i) in chatList" :key="i">{{ chat.name }}さん: {{ chat.content }}</li>
        </ul>
        <ul>
          <li class="item mt-4" v-for="(msg, i) in memoList" :key="i">{{ msg.name }}: {{ msg.content }}</li>
        </ul>
      </div>
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
}

.util-ml-8px {
  margin-left: 8px;
}

.button-exit {
  color: #000;
  margin-top: 8px;
}
</style>