export default (io, socket) => {
  // 入室メッセージをクライアントに送信する
  socket.on("enterEvent", (data) => {
    // console.log("名前")
    socket.broadcast.emit("enterEvent", `${data}さんが入室しました`)
  })

  // 退室メッセージをクライアントに送信する
  socket.on("exitEvent", (data) => {
    socket.broadcast.emit("exitEvent", `${data}さんが退出しました`)
  })

  // 投稿メッセージを送信する
  socket.on("publishEvent", (data) => {
    if (!data) {
      return
    }
    io.sockets.emit("publishEvent", data)
  })
}