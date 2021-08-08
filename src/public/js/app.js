const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const sendMessage = (event) => {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new-message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const saveNickname = (event) => {
  event.preventDefault();
  const input = room.querySelector("#nickname input");
  socket.emit("nickname", input.value, roomName);
};
const showRoom = (userCount) => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${userCount})`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", sendMessage);
  const nameForm = room.querySelector("#nickname");
  nameForm.addEventListener("submit", saveNickname);
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter-room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
});

function addMessage(text) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = text;
  ul.appendChild(li);
}

socket.on("welcome", (nickname, userCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${userCount})`;
  addMessage(`${nickname} joined.`);
});

socket.on("bye", (nickname, userCount) => {
  h3.innerText = `Room: ${roomName} (${userCount})`;
  addMessage(`${nickname} left.`);
});

socket.on("new-message", (msg, nickname) => addMessage(`${nickname}: ${msg}`));

socket.on("nickname", (newNickname, oldNickname) =>
  addMessage(`${oldNickname} => ${newNickname}`)
);

socket.on("room-change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
