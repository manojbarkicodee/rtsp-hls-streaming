const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const port = 3000;
const baseHlsDirectory = path.join(__dirname, "hls");

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use("/hls", express.static(baseHlsDirectory));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const streams = [
  {
    id: "stream1",
    url: "rtsp://user1:P@ssw0rd@localhost:554/profile1/media.smp",
  },
];

streams.forEach((stream) => {
  const hlsDir = path.join(baseHlsDirectory, stream.id);

  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  let segmentStartTime;

  const ffmpeg = spawn("ffmpeg", [
    "-rtsp_transport",
    "tcp",
    "-stimeout",
    "10000000",
    "-analyzeduration",
    "500000",
    "-probesize",
    "3000000",
    "-i",
    stream.url,
    "-vf",
    "scale=480:270",
    "-c:v",
    "libx264",
    "-preset",
    "superfast",
    "-tune", "zerolatency",
    "-crf",
    "28",
    "-c:a",
    "aac",
    "-max_muxing_queue_size",
    "1024",
    "-f",
    "hls",
    "-hls_time",
    "1", // Adjust segment duration
    "-hls_list_size",
    "2", // Adjust playlist size
    "-hls_flags",
    "delete_segments+append_list+omit_endlist",
    "-hls_wrap",
    "10",
    "-hls_segment_type",
    "fmp4", // Use fragmented MP4
    "-hls_segment_filename",
    `${hlsDir}/segment_%03d.m4s`, // Use .m4s for fMP4
    "-hls_playlist_type",
    "event", // Ensure live streaming
    "-fflags",
    "+genpts+discardcorrupt",
    "-max_interleave_delta",
    "1000",
    "-g",
    "50", // Keyframe interval
    `${hlsDir}/stream.m3u8`,
  ]);

  ffmpeg.stderr.on("data", (data) => {
    const log = data.toString();

    // Capture log when segment processing starts
    if (log.includes("Opening")) {
      segmentStartTime = new Date();
      console.log(`Segment processing started at: ${segmentStartTime}`);
    }

    // Capture log when a segment is completed
    if (log.includes("frame=") && segmentStartTime) {
      const segmentEndTime = new Date();
      const timeTaken = segmentEndTime - segmentStartTime;
      console.log(`Segment completed at: ${segmentEndTime}`);
      console.log(`Time taken for segment: ${timeTaken} ms`);

      // Reset start time for next segment
      segmentStartTime = null;
    }

    console.log(`stderr: ${log}`);
  });

  ffmpeg.stdout.on("data", (data) => {
    const log = data.toString();
    console.log(`stdout: ${log}`);
  });

  ffmpeg.on("close", (code) => {
    console.log(`FFmpeg exited with code ${code}`);
  });
});
