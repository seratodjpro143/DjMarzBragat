// DJMARZ website settings
// Change this to the email address where you want booking requests sent.
const BOOKING_EMAIL = "your-email@example.com";

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

document.getElementById("year").textContent = new Date().getFullYear();

const audio = document.getElementById("audioPlayer");
const filePicker = document.getElementById("audioFiles");
const trackList = document.getElementById("trackList");
const title = document.getElementById("trackTitle");
const subtitle = document.getElementById("trackSubtitle");
const playButton = document.getElementById("playButton");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const equalizer = document.getElementById("equalizer");
const volume = document.getElementById("volume");
let tracks = [];
let currentTrack = -1;
let activeObjectUrl = null;

function timeString(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}
function renderTracks() {
  trackList.innerHTML = "";
  if (!tracks.length) {
    trackList.innerHTML = '<p class="empty-tracks">No tracks added yet. Choose MP3 files below to get started.</p>';
    return;
  }
  tracks.forEach((track, index) => {
    const row = document.createElement("div");
    row.className = "track-row" + (index === currentTrack ? " active" : "");
    const number = document.createElement("small");
    number.textContent = String(index + 1).padStart(2, "0");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = track.name.replace(/\.[^/.]+$/, "");
    button.title = track.name;
    button.addEventListener("click", () => loadTrack(index, true));
    const label = document.createElement("small");
    label.textContent = index === currentTrack && !audio.paused ? "PLAYING" : "TRACK";
    row.append(number, button, label);
    trackList.appendChild(row);
  });
}
function loadTrack(index, autoplay = false) {
  if (index < 0 || index >= tracks.length) return;
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  currentTrack = index;
  activeObjectUrl = URL.createObjectURL(tracks[index].file);
  audio.src = activeObjectUrl;
  title.textContent = tracks[index].name.replace(/\.[^/.]+$/, "");
  subtitle.textContent = "Local track • DJMARZ player";
  progress.value = 0;
  if (autoplay) audio.play().catch(() => {});
  renderTracks();
}
filePicker.addEventListener("change", event => {
  const files = Array.from(event.target.files || []);
  const audioFiles = files.filter(file => file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name));
  tracks = tracks.concat(audioFiles.map(file => ({ name: file.name, file })));
  if (currentTrack === -1 && tracks.length) loadTrack(0, false);
  else renderTracks();
  filePicker.value = "";
});
playButton.addEventListener("click", () => {
  if (currentTrack === -1) {
    if (tracks.length) loadTrack(0, true);
    else filePicker.click();
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});
audio.addEventListener("play", () => { playButton.textContent = "Ⅱ"; equalizer.classList.add("playing"); renderTracks(); });
audio.addEventListener("pause", () => { playButton.textContent = "▶"; equalizer.classList.remove("playing"); renderTracks(); });
audio.addEventListener("ended", () => { if (currentTrack < tracks.length - 1) loadTrack(currentTrack + 1, true); else renderTracks(); });
audio.addEventListener("timeupdate", () => {
  currentTime.textContent = timeString(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) progress.value = (audio.currentTime / audio.duration) * 100;
});
audio.addEventListener("loadedmetadata", () => { duration.textContent = timeString(audio.duration); });
progress.addEventListener("input", () => { if (Number.isFinite(audio.duration)) audio.currentTime = (Number(progress.value) / 100) * audio.duration; });
volume.addEventListener("input", () => { audio.volume = Number(volume.value); });
audio.volume = Number(volume.value);
document.getElementById("prevTrack").addEventListener("click", () => {
  if (tracks.length) loadTrack(Math.max(0, currentTrack - 1), true);
});
document.getElementById("nextTrack").addEventListener("click", () => {
  if (tracks.length) loadTrack(Math.min(tracks.length - 1, currentTrack + 1), true);
});

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();
  if (BOOKING_EMAIL === "your-email@example.com") {
    alert("Before using the booking form, open script.js and replace your-email@example.com with your real booking email address.");
    return;
  }
  const subject = encodeURIComponent(`DJMARZ Booking Inquiry — ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nReply email: ${email}\n\nEvent details:\n${message}`);
  window.location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`;
});
