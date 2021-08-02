import http from "http";
import WebSocket from "ws";
import express from "express";
import { join } from "path";

const app = express();

app.set("view engine", "pug");
app.set("views", join(__dirname, "/views"));
app.use("/public", express.static(join(__dirname, "/public")));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  socket.on("close", () => console.log("Disconnected from Browser ⛔️"));
  socket.on("message", (message) =>
    console.log("New message:", message.toString())
  );
  socket.send("hello, world!!!");
});

server.listen(3000, () => console.log("Listening on http://localhost:3000"));
