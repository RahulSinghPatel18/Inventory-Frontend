const SOUND_FILES = {
  notification: "/sounds/notification.mp3",
  "login-success": "/sounds/login-success.mp3",
  "action-success": "/sounds/action-success.mp3",
  "warning-error": "/sounds/warning-error.mp3"
};

const audioByEffect = new Map();

export const isSoundEnabled = () => {
  try {
    return window.localStorage.getItem("soundEnabled") !== "false";
  } catch {
    return false;
  }
};

export const playSoundEffect = (effect) => {
  const source = SOUND_FILES[effect];
  if (!source || !isSoundEnabled() || typeof Audio === "undefined") return;

  try {
    let audio = audioByEffect.get(effect);
    if (!audio) {
      audio = new Audio(source);
      audioByEffect.set(effect, audio);
    }

    audio.currentTime = 0;
    const playback = audio.play();
    playback?.catch(() => {});
  } catch {
    // Audio playback is optional and may be unavailable in restricted browser contexts.
  }
};
