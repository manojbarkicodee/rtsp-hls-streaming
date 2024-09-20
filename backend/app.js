const express = require("express");
const WebSocket = require("ws");
const ffmpeg = require("fluent-ffmpeg");
const http = require("http");

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const stream = ffmpeg(
    "rtsp://rtspstream:f545d33c023641a93bd13ac5b59af83a@zephyr.rtsp.stream/pattern"
  )
    .addOptions([
      "-f mpegts",
      "-codec:v mpeg1video",
      "-b:v 1000k",
      "-r 30",
      "-s 640x480",
      "-codec:a mp2",
      "-ar 44100",
      "-ac 1",
      "-b:a 128k",
    ])
    .on("start", () => console.log("Stream started"))
    .on("end", () => console.log("Stream ended"))
    .on("error", (err) => {
      console.error("Error: ", err.message);
      ws.close();
    });

  stream.pipe(ws, { end: true });

  ws.on("close", () => {
    console.log("Client disconnected");
    stream.kill("SIGINT");
  });
});

app.use(express.static("public"));

server.listen(port, () => console.log(`Server running on port ${port}`));