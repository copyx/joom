import http from "http";
// import WebSocket from "ws";
import SocketIO, { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";
import { join } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", join(__dirname, "/views"));
app.use("/public", express.static(join(__dirname, "/public")));

app.get("/", (req, res) => res.render("home"));
app.get("/chat", (req, res) => res.render("chat"));
app.get("/video-call", (req, res) => res.render("video-call"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function getPublicRooms() {
  const { sids, rooms } = wsServer.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

const countUsersInRoom = (roomName) =>
  wsServer.sockets.adapter.rooms.get(roomName)?.size;

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  wsServer.sockets.emit("room-change", getPublicRooms());

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter-room", (roomName, done) => {
    socket.join(roomName);
    done(countUsersInRoom(roomName));
    socket
      .to(roomName)
      .emit("welcome", socket.nickname, countUsersInRoom(roomName));
    wsServer.sockets.emit("room-change", getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countUsersInRoom(room) - 1)
    );
  });
  socket.on("disconnect", () =>
    wsServer.sockets.emit("room-change", getPublicRooms())
  );
  socket.on("new-message", (msg, roomName, done) => {
    socket.to(roomName).emit("new-message", msg, socket.nickname);
    done();
  });
  socket.on("nickname", (nickname, roomName) => {
    const oldNickname = socket.nickname;
    socket["nickname"] = nickname;
    socket.to(roomName).emit("nickname", socket.nickname, oldNickname);
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
