import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";
import { join } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", join(__dirname, "/views"));
app.use("/public", express.static(join(__dirname, "/public")));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter-room", (roomName, done) => {
    socket.join(roomName);
    done();
  });
});

// const wss = new WebSocket.Server({ server });

// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("Connected to Browser ✅");
//   socket.on("close", () => console.log("Disconnected from Browser ⛔️"));
//   socket.on("message", (data, isBinary) => {
//     const message = isBinary ? data : JSON.parse(data.toString());

//     switch (message.type) {
//       case "new_message":
//         sockets.forEach(
//           (aSocket) =>
//             aSocket !== socket &&
//             aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

httpServer.listen(3000, () =>
  console.log("Listening on http://localhost:3000")
);
