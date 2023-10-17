// TODO:
// - Improve play button
// - Fullscreen option
// - Add error handling
// - Improve subtitle pull in/out

import data from "./assets/data.json";
import { configure } from "queryparams";

const DOM = {
  stage: document.getElementById("stage")!,
  videos: document.getElementById("videos")!,
  subtitles: document.getElementById("subtitles")!,
  overlay: document.getElementById("overlay")!,
  spinner: document.getElementById("spinner")!,
};

const { params } = configure({ invert: true, rotate: false });

if (params.invert) {
  DOM.stage.classList.add("Stage--invert");
}

if (params.rotate) {
  DOM.stage.classList.add("Stage--rotate");
}

const shuffle = <T>(array: T[]) => {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MAX_RETRIES = 5;

const STATE = {
  playing: false,
  queue: shuffle(data),
  retries: 0,
};

const next = () => {
  if (STATE.queue.length === 0) {
    STATE.queue = shuffle(data);
  }

  return STATE.queue.shift()!;
};

const peek = () => {
  if (STATE.queue.length === 0) {
    STATE.queue = shuffle(data);
  }

  return STATE.queue[0];
};

// @ts-ignore
window.STATE = STATE;

const init = () => {
  // Reset
  DOM.subtitles.innerHTML = "";

  // If not playing, show play button
  if (!STATE.playing) {
    const button = document.createElement("button");
    button.textContent = "Play";
    button.className = "Button";

    button.addEventListener("click", () => {
      STATE.playing = true;
      button.remove();
      init();
    });

    DOM.stage.appendChild(button);

    return;
  }

  DOM.spinner.style.opacity = "1";

  // Get a random video + caption
  const entry = next();

  // Create new video element
  const video = document.createElement("video");
  video.className = "Video";
  video.controls = false;
  video.playsInline = true;
  video.autoplay = true;
  video.muted = false;
  video.src = entry.filename;

  video.load();

  // Set up subtitles
  const duration = entry.duration.split(":").reduce((acc, curr, i) => {
    const multiplier = [3600, 60, 1][i];
    return acc + parseInt(curr) * multiplier * 1000;
  }, 0);

  const pause = duration / 2;
  const subtitles = entry.title.split("...").map((text) => text.trim());

  DOM.subtitles.innerHTML = subtitles[0];

  // Locate any previous video
  const existingVideos = document.querySelectorAll("video");

  // Add the new video
  DOM.videos.appendChild(video);

  // Fade in new video, remove the exisitng videos, if any
  video.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100 }).onfinish =
    () => {
      if (existingVideos.length > 0) {
        existingVideos.forEach((video) => video.remove());
      }
    };

  video.addEventListener(
    "canplaythrough",
    () => {
      DOM.spinner.style.opacity = "0";

      video.play();

      setTimeout(() => {
        DOM.subtitles.innerHTML = subtitles[1];
      }, pause);
    },
    { once: true }
  );

  video.addEventListener(
    "ended",
    () => {
      DOM.spinner.style.opacity = "1";

      // Preload next video
      const preload = document.createElement("video");
      const queued = peek();

      preload.src = queued.filename;
      preload.preload = "auto";
      preload.muted = true;

      preload.load();

      preload.addEventListener("canplaythrough", init, { once: true });
    },
    { once: true }
  );

  video.addEventListener("error", (err) => {
    console.error(err);
    setTimeout(() => {
      init(); // Re-initialize
    }, 1000);
  });

  video.addEventListener("stalled", () => {
    if (STATE.retries < MAX_RETRIES) {
      setTimeout(() => {
        video.load();
        video.play();
        STATE.retries++;
      }, 1000);

      return;
    }

    STATE.retries = 0;

    setTimeout(() => {
      init(); // Re-initialize
    }, 1000);
  });
};

init();
