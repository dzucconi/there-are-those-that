// TODO:
// - Improve play button
// - Fullscreen option
// - Preload next video
// - Add loading indicator
// - Add error handling
// - Improve subtitle pull in/out
// - Shuffle and only reset once all videos have been played

import data from "./assets/data.json";

const DOM = {
  video: document.getElementById("video")!,
  subtitles: document.getElementById("subtitles")!,
  display: document.getElementById("display")!,
  overlay: document.getElementById("overlay")!,
};

const STATE = {
  playing: false,
};

const random = () => {
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
};

const color = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const init = () => {
  DOM.video.innerHTML = "";
  DOM.subtitles.innerHTML = "";

  // Set random colors
  DOM.display.style.backgroundColor = `#${color()}`;

  // If not playing, show play button
  if (!STATE.playing) {
    const button = document.createElement("button");
    button.textContent = "Play";
    button.className = "Button";

    button.addEventListener("click", () => {
      STATE.playing = true;
      init();
    });

    DOM.video.appendChild(button);

    return;
  }

  // Get a random video + caption
  const entry = random();

  const video = document.createElement("video");
  video.className = "Video";
  video.src = entry.filename;
  video.controls = false;

  const duration = entry.duration.split(":").reduce((acc, curr, i) => {
    const multiplier = [3600, 60, 1][i];
    return acc + parseInt(curr) * multiplier * 1000;
  }, 0);

  const pause = duration / 2;
  const subtitles = entry.title.split("...").map((text) => text.trim());

  DOM.subtitles.innerHTML = subtitles[0];

  setTimeout(() => {
    DOM.subtitles.innerHTML = subtitles[1];
  }, pause);

  DOM.video.appendChild(video);

  video.addEventListener(
    "loadeddata",
    () => {
      video.play();
    },
    { once: true }
  );

  video.addEventListener(
    "ended",
    () => {
      // TODO: Preload next video, when it's ready; play it
      init();
    },
    { once: true }
  );
};

init();
