import api, { get } from "./api";
import { storage } from "../utils/storage";

const notificationService = {
  list: async (types) => {
    const response = await get("/notifications", {
      params: types?.length ? { types: types.join(",") } : {}
    });
    return response.data;
  },

  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  stream: async (onNotification, signal, onReady) => {
    const response = await fetch(api.getUri({ url: "/notifications/stream" }), {
      headers: { Authorization: `Bearer ${storage.getToken() || ""}` },
      signal
    });
    if (!response.ok || !response.body) {
      if (response.status === 401) {
        storage.removeToken();
        window.location.assign("/login");
      }
      throw Object.assign(
        new Error(`Notification stream failed (${response.status})`),
        { status: response.status }
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";
      for (const event of events) {
        const eventName = event.match(/^event:\s*(.+)$/m)?.[1];
        const data = event.match(/^data:\s*(.+)$/m)?.[1];
        if (eventName === "notification" && data) onNotification(JSON.parse(data));
        if (eventName === "ready") onReady?.();
      }
    }
  }
};

export default notificationService;
