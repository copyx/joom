const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraOffBtn = document.getElementById("cameraOff");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = true;
let cameraOff = false;
let roomName;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((devices) => devices.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.error(e);
  }
}

async function getMedia(deviceId) {
  const initalConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initalConstraints
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }

    muteAudio(muted);
    turnOffCamera(cameraOff);
  } catch (e) {
    console.error(e);
  }
}

getMedia();

muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteAudio(muted);
});
cameraOffBtn.addEventListener("click", () => {
  cameraOff = !cameraOff;
  turnOffCamera(cameraOff);
});

cameraSelect.addEventListener("input", () => {
  getMedia(cameraSelect.value);
});

function turnOffCamera(cameraOff) {
  myStream.getVideoTracks().forEach((track) => (track.enabled = !cameraOff));
  cameraOffBtn.innerText = cameraOff ? "Turn Camera On" : "Turn Camera Off";
}

function muteAudio(muted) {
  myStream.getAudioTracks().forEach((track) => (track.enabled = !muted));
  muteBtn.innerText = muted ? "Unmute" : "Mute";
}

// Welcome
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

welcomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  input.value;
  socket.emit("join-room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
});

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

// Socket Code
socket.on("welcome", () => {
  console.log("someone joined");
});
