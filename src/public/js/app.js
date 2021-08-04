const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => JSON.stringify({ type, payload });
const paintMessage = (text) => {
  const li = document.createElement("li");
  li.innerText = text;
  messageList.append(li);
};

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  paintMessage(message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ⛔️");
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  paintMessage(`You: ${input.value}`);
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
});

nicknameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
});
