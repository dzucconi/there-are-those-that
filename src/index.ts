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
  spinner: document.getElementById("spinner")!,
};

const random = () => {
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
};

const STATE = {
  playing: false,
  queued: random(),
};

const color = () => {
  return Math.floor(Math.random() * 16777215).toString(16);
};

const init = () => {
  // Reset
  DOM.spinner.style.opacity = "0";
  DOM.subtitles.innerHTML = "";
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
  const entry = STATE.queued;

  // Create new video element
  const video = document.createElement("video");
  video.className = "Video";
  video.src = entry.filename;
  video.controls = false;

  // Set up subtitles
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

  // Locate any previous video
  const existingVideo = document.querySelector("video");

  // Add the new video
  DOM.video.appendChild(video);

  // Fade in new video, remove the exisitng video, if any
  video.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100 }).onfinish =
    () => {
      if (existingVideo) {
        existingVideo.remove();
      }
    };

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
      DOM.spinner.style.opacity = "1";

      // Preload next video
      const preload = document.createElement("video");
      const queued = random();
      STATE.queued = queued;
      preload.src = queued.filename;

      preload.addEventListener("loadeddata", init, { once: true });
    },
    { once: true }
  );
};

init();
