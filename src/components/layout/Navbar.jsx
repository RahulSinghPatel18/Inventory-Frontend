import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Bell, Menu, Moon, Sun } from "lucide-react";

import BrandLogo from "../common/BrandLogo";
import ProductImage from "../products/ProductImage";
import UserMenu from "./UserMenu";
import stockService from "../../services/stockService";
import useUiStore from "../../store/uiStore";
import useAuth from "../../hooks/useAuth";
import { hasPermission } from "../../utils/permissions";

const SETTINGS_STORAGE_KEY = "stockpro-settings";

const getNotificationPreferences = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    return {
      lowStock: saved?.notifications?.lowStock !== false,
      outOfStock: saved?.notifications?.outOfStock !== false,
      stockActivity: saved?.notifications?.stockActivity === true
    };
  } catch {
    return { lowStock: true, outOfStock: true, stockActivity: false };
  }
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useUiStore();
  const canViewLowStock = hasPermission(user, "stock.low-stock");
  const canViewOutOfStock = hasPermission(user, "stock.out-of-stock");
  const canViewHistory = hasPermission(user, ["stock.history", "reports.stock"]);
  const canViewProductDetails = hasPermission(user, "products.details");
  const canViewNotifications = canViewLowStock || canViewOutOfStock || canViewHistory;
  const canViewNotificationSettings = hasPermission(user, "profile.view");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notifications, setNotifications] = useState({ low: [], out: [], activity: [], count: 0 });
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!notificationsOpen || !canViewNotifications) return undefined;
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
  }, [notificationsOpen, canViewNotifications]);

  useEffect(() => {
    if (!notificationsOpen) return undefined;
    let active = true;
    const preferences = getNotificationPreferences();
    const requests = [
      ...(preferences.lowStock && canViewLowStock ? [["low", stockService.getLowStock({ page: 1, limit: 5 })]] : []),
      ...(preferences.outOfStock && canViewOutOfStock ? [["out", stockService.getOutOfStock({ page: 1, limit: 5 })]] : []),
      ...(preferences.stockActivity && canViewHistory ? [["activity", stockService.getHistory({ page: 1, limit: 5 })]] : [])
    ];

    Promise.all(requests.map(async ([key, request]) => [key, await request])).then((results) => {
      if (!active) return;
      const next = { low: [], out: [], activity: [], count: 0 };
      for (const [key, data] of results) {
        next[key] = key === "activity" ? data.history || [] : data.products || [];
        next.count += key === "activity"
          ? next[key].length
          : (data.count ?? data.totalProducts ?? next[key].length);
      }
      setNotifications(next);
      setNotificationError("");
    }).catch((error) => {
      if (active) setNotificationError(error.response?.data?.message || "Unable to load inventory notifications.");
    }).finally(() => {
      if (active) setNotificationsLoading(false);
    });
    return () => { active = false; };
  }, [notificationsOpen, canViewNotifications, canViewLowStock, canViewOutOfStock, canViewHistory]);

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
              aria-label={`Notifications${notifications.count ? `, ${notifications.count} alerts` : ""}`}
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setNotificationsLoading(!notificationsOpen);
                setNotificationError("");
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl theme-text-muted theme-hover-neutral theme-hover-text-primary"
            >
              <Bell size={19} />
              {notifications.count > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full theme-danger-bg px-1 text-[10px] font-bold text-white">{notifications.count > 99 ? "99+" : notifications.count}</span>}
            </button>
            {notificationsOpen && <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border theme-border theme-surface shadow-xl" role="dialog" aria-label="Inventory notifications">
              <div className="flex items-center justify-between border-b theme-border-subtle px-4 py-3">
                <div><h2 className="text-sm font-semibold theme-text-primary">Notifications</h2><p className="mt-0.5 text-xs theme-text-muted">Inventory alerts from your organization</p></div>
                {canViewNotificationSettings && <Link to="/settings#notifications" onClick={() => setNotificationsOpen(false)} className="rounded-lg p-2 theme-text-muted theme-hover-neutral" aria-label="Notification preferences"><ArrowUpRight size={16} /></Link>}
              </div>
              {notificationsLoading ? <p className="p-4 text-sm theme-text-muted">Loading notifications…</p> : notificationError ? <p role="alert" className="p-4 text-sm theme-danger">{notificationError}</p> : <>
                <div className="max-h-80 overflow-y-auto divide-y theme-border-subtle">
                  {notifications.out.map((product) => {
                    const content = <span className="flex items-center gap-3">
                      <ProductImage src={product.image} alt={product.name} className="h-10 w-10 rounded-lg" />
                      <span><span className="block text-sm font-medium theme-text-primary">{product.name}</span><span className="mt-1 block text-xs theme-danger">Out of stock</span></span>
                    </span>;
                    return canViewProductDetails
                      ? <Link key={`out-${product._id}`} to={`/products/${product._id}`} onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 theme-hover-surface">{content}</Link>
                      : <div key={`out-${product._id}`} className="px-4 py-3">{content}</div>;
                  })}
                  {notifications.low.map((product) => {
                    const content = <span className="flex items-center gap-3">
                      <ProductImage src={product.image} alt={product.name} className="h-10 w-10 rounded-lg" />
                      <span><span className="block text-sm font-medium theme-text-primary">{product.name}</span><span className="mt-1 block text-xs theme-warning">Low stock · {product.quantity} remaining</span></span>
                    </span>;
                    return canViewProductDetails
                      ? <Link key={`low-${product._id}`} to={`/products/${product._id}`} onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 theme-hover-surface">{content}</Link>
                      : <div key={`low-${product._id}`} className="px-4 py-3">{content}</div>;
                  })}
                  {notifications.activity.map((entry) => canViewProductDetails && entry.productId?._id ? <Link key={`activity-${entry._id}`} to={`/products/${entry.productId._id}`} onClick={() => setNotificationsOpen(false)} className="flex items-start gap-3 px-4 py-3 theme-hover-surface">
                    <ProductImage src={entry.productId?.image} alt={entry.productId?.name} className="h-10 w-10 rounded-lg" /><span><span className="block text-sm font-medium theme-text-primary">{entry.productId?.name || "Stock movement"} · {entry.type} {entry.quantity}</span><span className="mt-1 block text-xs theme-text-muted">{new Date(entry.createdAt).toLocaleString()}</span></span>
                  </Link> : canViewHistory ? <Link key={`activity-${entry._id}`} to="/stock" onClick={() => setNotificationsOpen(false)} className="flex items-start gap-3 px-4 py-3 theme-hover-surface">
                    <ProductImage src={entry.productId?.image} alt={entry.productId?.name} className="h-10 w-10 rounded-lg" /><span><span className="block text-sm font-medium theme-text-primary">{entry.productId?.name || "Stock movement"} · {entry.type} {entry.quantity}</span><span className="mt-1 block text-xs theme-text-muted">{new Date(entry.createdAt).toLocaleString()}</span></span>
                  </Link> : <div key={`activity-${entry._id}`} className="flex items-start gap-3 px-4 py-3">
                    <ProductImage src={entry.productId?.image} alt={entry.productId?.name} className="h-10 w-10 rounded-lg" /><span><span className="block text-sm font-medium theme-text-primary">{entry.productId?.name || "Stock movement"} · {entry.type} {entry.quantity}</span><span className="mt-1 block text-xs theme-text-muted">{new Date(entry.createdAt).toLocaleString()}</span></span>
                  </div>)}
                  {!notifications.out.length && !notifications.low.length && !notifications.activity.length && <p className="p-5 text-center text-sm theme-text-muted">No current inventory notifications.</p>}
                </div>
                {(canViewLowStock || canViewOutOfStock || canViewHistory || hasPermission(user, "stock.view")) && <div className="border-t theme-border-subtle px-4 py-3"><Link to="/stock" onClick={() => setNotificationsOpen(false)} className="text-sm font-medium theme-primary-text">View stock <span aria-hidden="true">→</span></Link></div>}
              </>}
            </div>}
          </div>}

          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
