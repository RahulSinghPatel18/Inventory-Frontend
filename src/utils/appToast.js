import { toast as sonnerToast } from "sonner";
import { playSoundEffect } from "./soundEffects";

const notify = (method, defaultSound) => (...args) => {
  const [message, options] = args;
  const hasSoundOverride = options && Object.hasOwn(options, "sound");
  const sound = hasSoundOverride ? options.sound : defaultSound;
  if (sound) playSoundEffect(sound);

  if (!hasSoundOverride) return sonnerToast[method](...args);

  const forwardedOptions = { ...options };
  delete forwardedOptions.sound;
  return sonnerToast[method](message, forwardedOptions);
};

const toast = Object.assign(
  notify("message", "notification"),
  sonnerToast,
  {
    success: notify("success", "action-success"),
    error: notify("error", "warning-error"),
    warning: notify("warning", "warning-error"),
    info: notify("info", "notification"),
    message: notify("message", "notification"),
    loading: notify("loading", null)
  }
);

export { toast };
