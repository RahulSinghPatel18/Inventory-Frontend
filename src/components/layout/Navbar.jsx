import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bell, CheckCheck, Menu, MessageSquareText, Moon, Sun, X } from "lucide-react";
import { toast } from "../../utils/appToast";
import { playSoundEffect } from "../../utils/soundEffects";

import BrandLogo from "../common/BrandLogo";
import FeedbackReportModal from "../common/FeedbackReportModal";
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLimit, setNotificationLimit] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches ? 5 : 3
  );
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [clearingNotifications, setClearingNotifications] = useState(false);
  const [dismissingIds, setDismissingIds] = useState([]);
  const notificationRef = useRef(null);
  const notificationTypes = useRef(getNotificationTypes());
  const toastedNotificationIds = useRef(new Set());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateLimit = (event) => {
      setNotificationLimit(event.matches ? 5 : 3);
      setShowAllNotifications(false);
    };
    mediaQuery.addEventListener("change", updateLimit);
    return () => mediaQuery.removeEventListener("change", updateLimit);
  }, []);

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
              if (!toastedNotificationIds.current.has(incoming._id)) {
                toastedNotificationIds.current.add(incoming._id);
                const description = incoming.message || undefined;
                const isStockAlert = incoming.type === "stock-out" || incoming.type === "stock-low";
                playSoundEffect(isStockAlert ? "warning-error" : "notification");
                if (incoming.type === "stock-out") {
                  toast.error(incoming.title || "Out of Stock Alert", {
                    description,
                    duration: Infinity,
                    sound: false
                  });
                } else if (incoming.type === "stock-low") {
                  toast.warning(incoming.title || "Low Stock Warning", {
                    description,
                    duration: 5000,
                    sound: false
                  });
                }
              }
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

  const dismissNotification = async (notification) => {
    setDismissingIds((current) => [...current, notification._id]);
    try {
      await notificationService.dismiss(notification._id);
      setNotifications((current) => current.filter((item) => item._id !== notification._id));
      if (!notification.isRead) setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(error.response?.data?.message || "Unable to dismiss notification.");
    } finally {
      setDismissingIds((current) => current.filter((id) => id !== notification._id));
    }
  };

  const clearAllNotifications = async () => {
    setClearingNotifications(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      setShowAllNotifications(false);
      setNotificationError("");
    } catch (error) {
      setNotificationError(error.response?.data?.message || "Unable to clear notifications.");
    } finally {
      setClearingNotifications(false);
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
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl theme-text-secondary theme-hover-neutral lg:hidden"
          >
            <Menu size={21} />
          </button>
          <BrandLogo size="sm" showMark={false} className="sm:text-[1.3rem]" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-label="Send feedback or report a bug"
            title="Send feedback"
            className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-2.5 theme-text-muted transition theme-hover-neutral theme-hover-text-primary sm:px-3"
          >
            <MessageSquareText size={18} aria-hidden="true" />
            <span className="hidden text-sm font-medium sm:inline">Feedback</span>
          </button>

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
            {notificationsOpen && <section className="fixed inset-x-3 top-[4.25rem] z-50 flex max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-2xl border theme-border theme-surface shadow-xl sm:inset-x-auto sm:right-4 sm:w-[min(24rem,calc(100vw-2rem))] lg:absolute lg:right-0 lg:top-full lg:mt-2" role="dialog" aria-label="Notifications">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b theme-border-subtle px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold theme-text-primary">Notifications</h2>
                  <p className="mt-0.5 text-xs theme-text-muted">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && <button
                    type="button"
                    onClick={clearAllNotifications}
                    disabled={clearingNotifications}
                    className="min-h-11 rounded-lg px-2 text-xs font-semibold theme-danger transition theme-hover-danger disabled:opacity-60"
                  >
                    {clearingNotifications ? "Clearing…" : "Clear all"}
                  </button>}
                  {unreadCount > 0 && <button type="button" onClick={markAllRead} className="rounded-lg p-2 text-xs font-medium theme-primary-text theme-hover-neutral" aria-label="Mark all notifications as read" title="Mark all as read"><CheckCheck size={17} /></button>}
                  {canViewNotificationSettings && <Link to="/settings#notifications" onClick={() => setNotificationsOpen(false)} className="rounded-lg p-2 theme-text-muted theme-hover-neutral" aria-label="Notification preferences"><ArrowUpRight size={16} /></Link>}
                </div>
              </div>
              {notificationsLoading ? <p className="p-4 text-sm theme-text-muted">Loading notifications…</p> : notificationError ? <p role="alert" className="p-4 text-sm theme-danger">{notificationError}</p> : <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y theme-border-subtle sm:max-h-[min(70vh,24rem)]">
                  {notifications.slice(0, showAllNotifications ? notifications.length : notificationLimit).map((notification) => {
                    const destination = destinationFor(notification);
                    const content = (
                      <>
                        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? "theme-neutral-soft" : "theme-primary-bg"}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block break-words text-sm font-medium theme-text-primary [overflow-wrap:anywhere]">{notification.title}</span>
                          <span className="mt-0.5 block break-words text-xs theme-text-secondary [overflow-wrap:anywhere]">{notification.message}</span>
                          <span className="mt-1 block text-xs theme-text-muted">{new Date(notification.createdAt).toLocaleString()}</span>
                        </span>
                      </>
                    );
                    const rowClass = `flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left transition theme-hover-surface ${notification.isRead ? "opacity-75" : ""}`;
                    return (
                      <div key={notification._id} className="flex items-start gap-1">
                        {destination
                          ? <Link to={destination} onClick={() => { void markRead(notification); setNotificationsOpen(false); }} className={rowClass}>{content}</Link>
                          : <button type="button" onClick={() => markRead(notification)} className={rowClass}>{content}</button>}
                        <button
                          type="button"
                          onClick={() => dismissNotification(notification)}
                          disabled={dismissingIds.includes(notification._id)}
                          aria-label={`Dismiss ${notification.title}`}
                          title="Dismiss notification"
                          className="mt-1 mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg theme-text-muted transition theme-hover-neutral theme-hover-text-primary disabled:opacity-50"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                  {!notifications.length && <p className="p-5 text-center text-sm theme-text-muted">No new notifications.</p>}
                  {notifications.length > notificationLimit && <button
                    type="button"
                    onClick={() => setShowAllNotifications((showing) => !showing)}
                    className="min-h-11 w-full px-4 text-sm font-semibold theme-primary-text theme-hover-surface"
                  >
                    {showAllNotifications ? "Show less" : `View more (${notifications.length - notificationLimit})`}
                  </button>}
                </div>
                {hasPermission(user, "stock.view") && <div className="shrink-0 border-t theme-border-subtle px-4 py-3"><Link to="/stock" onClick={() => setNotificationsOpen(false)} className="text-sm font-medium theme-primary-text">View stock <span aria-hidden="true">→</span></Link></div>}
              </>}
            </section>}
          </div>}

          <UserMenu />
        </div>
      </div>
      <FeedbackReportModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </header>
  );
};

export default Navbar;
