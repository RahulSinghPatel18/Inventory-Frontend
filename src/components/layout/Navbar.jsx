import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bell, CheckCheck, Menu, Moon, Sun } from "lucide-react";

import BrandLogo from "../common/BrandLogo";
import UserMenu from "./UserMenu";
import notificationService from "../../services/notificationService";
import useUiStore from "../../store/uiStore";
import useAuth from "../../hooks/useAuth";
import { hasPermission } from "../../utils/permissions";

const SETTINGS_STORAGE_KEY = "stockpro-settings";

const getNotificationTypes = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    return [
      ...(saved?.notifications?.lowStock === false ? [] : ["stock-low"]),
      ...(saved?.notifications?.outOfStock === false ? [] : ["stock-out"]),
      ...(saved?.notifications?.stockActivity === true ? ["stock-activity"] : []),
      "sale-created"
    ];
  } catch {
    return ["stock-low", "stock-out", "sale-created"];
  }
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useUiStore();
  const canViewNotifications = hasPermission(user, "notifications.view");
  const canViewProducts = hasPermission(user, "products.details");
  const canViewSales = hasPermission(user, "sales.details");
  const canViewNotificationSettings = hasPermission(user, "profile.view");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const notificationTypes = useRef(getNotificationTypes());

  const refreshNotifications = useCallback(async () => {
    const data = await notificationService.list(notificationTypes.current);
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
    setNotificationError("");
  }, []);

  useEffect(() => {
    if (!canViewNotifications) return undefined;
    let active = true;
    let retryDelay = 1000;

    refreshNotifications()
      .catch((error) => {
        if (active) setNotificationError(error.response?.data?.message || "Unable to load notifications.");
      })
      .finally(() => {
        if (active) setNotificationsLoading(false);
      });

    const controller = new AbortController();
    const refreshPreferences = () => {
      notificationTypes.current = getNotificationTypes();
      setNotificationsLoading(true);
      refreshNotifications()
        .catch((error) => setNotificationError(error.response?.data?.message || "Unable to load notifications."))
        .finally(() => setNotificationsLoading(false));
    };
    window.addEventListener("notifications-preferences-updated", refreshPreferences);
    const connect = async () => {
      while (active) {
        try {
          await notificationService.stream(
            (incoming) => {
              if (!notificationTypes.current.includes(incoming.type)) return;
              setNotifications((current) => {
                if (current.some((notification) => notification._id === incoming._id)) return current;
                setUnreadCount((count) => count + 1);
                return [{ ...incoming, isRead: false }, ...current].slice(0, 20);
              });
              setNotificationError("");
            },
            controller.signal,
            () => { void refreshNotifications(); }
          );
          if (active) throw new Error("Notification stream closed");
        } catch (error) {
          if (!active || error.name === "AbortError") return;
          if (error.status && error.status < 500 && error.status !== 429) {
            setNotificationError("Live notifications are unavailable for this account.");
            return;
          }
          await new Promise((resolve) => window.setTimeout(resolve, retryDelay));
          retryDelay = Math.min(retryDelay * 2, 30_000);
        }
      }
    };

    connect();
    return () => {
      active = false;
      controller.abort();
      window.removeEventListener("notifications-preferences-updated", refreshPreferences);
    };
  }, [canViewNotifications, refreshNotifications]);

  useEffect(() => {
    if (!canViewNotifications) return undefined;
    const refreshIfVisible = () => {
      if (document.visibilityState !== "visible") return;
      refreshNotifications().catch((error) => {
        setNotificationError(error.response?.data?.message || "Unable to refresh notifications.");
      });
    };
    const interval = window.setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [canViewNotifications, refreshNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  const markRead = async (notification) => {
    if (notification.isRead) return;
    try {
      const data = await notificationService.markRead(notification._id);
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? data.notification : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(error.response?.data?.message || "Unable to mark notification as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      setNotificationError(error.response?.data?.message || "Unable to mark notifications as read.");
    }
  };

  const destinationFor = (notification) => {
    if (notification.entityType === "product" && canViewProducts) {
      return `/products/${notification.entityId}`;
    }
    if (notification.entityType === "sale" && canViewSales) {
      return `/sales/${notification.entityId}`;
    }
    return "";
  };

  return (
    <header className="sticky top-0 z-40 border-b theme-border theme-surface-glass">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl theme-text-secondary theme-hover-neutral lg:hidden"
          >
            <Menu size={21} />
          </button>
          <BrandLogo size="md" showMark={false} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-11 w-11 items-center justify-center rounded-xl theme-text-muted transition theme-hover-neutral theme-hover-text-primary"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {canViewNotifications && <div className="relative" ref={notificationRef}>
            <button
              type="button"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl theme-text-muted theme-hover-neutral theme-hover-text-primary"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full theme-danger-bg px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            {notificationsOpen && <section className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border theme-border theme-surface shadow-xl" role="dialog" aria-label="Notifications">
              <div className="flex items-center justify-between gap-3 border-b theme-border-subtle px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold theme-text-primary">Notifications</h2>
                  <p className="mt-0.5 text-xs theme-text-muted">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && <button type="button" onClick={markAllRead} className="rounded-lg p-2 text-xs font-medium theme-primary-text theme-hover-neutral" aria-label="Mark all notifications as read" title="Mark all as read"><CheckCheck size={17} /></button>}
                  {canViewNotificationSettings && <Link to="/settings#notifications" onClick={() => setNotificationsOpen(false)} className="rounded-lg p-2 theme-text-muted theme-hover-neutral" aria-label="Notification preferences"><ArrowUpRight size={16} /></Link>}
                </div>
              </div>
              {notificationsLoading ? <p className="p-4 text-sm theme-text-muted">Loading notifications…</p> : notificationError ? <p role="alert" className="p-4 text-sm theme-danger">{notificationError}</p> : <>
                <div className="max-h-[min(70vh,24rem)] overflow-y-auto divide-y theme-border-subtle">
                  {notifications.map((notification) => {
                    const destination = destinationFor(notification);
                    const content = (
                      <>
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "theme-neutral-soft" : "theme-primary-bg"}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium theme-text-primary">{notification.title}</span>
                          <span className="mt-0.5 block text-xs theme-text-secondary">{notification.message}</span>
                          <span className="mt-1 block text-xs theme-text-muted">{new Date(notification.createdAt).toLocaleString()}</span>
                        </span>
                      </>
                    );
                    const rowClass = `flex w-full items-start gap-3 px-4 py-3 text-left transition theme-hover-surface ${notification.isRead ? "opacity-75" : ""}`;
                    return destination
                      ? <Link key={notification._id} to={destination} onClick={() => { void markRead(notification); setNotificationsOpen(false); }} className={rowClass}>{content}</Link>
                      : <button key={notification._id} type="button" onClick={() => markRead(notification)} className={rowClass}>{content}</button>;
                  })}
                  {!notifications.length && <p className="p-5 text-center text-sm theme-text-muted">You’re all caught up.</p>}
                </div>
                {hasPermission(user, "stock.view") && <div className="border-t theme-border-subtle px-4 py-3"><Link to="/stock" onClick={() => setNotificationsOpen(false)} className="text-sm font-medium theme-primary-text">View stock <span aria-hidden="true">→</span></Link></div>}
              </>}
            </section>}
          </div>}

          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
