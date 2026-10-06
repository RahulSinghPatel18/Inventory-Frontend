import { useState } from "react";
import { Description, Field, Label, Switch } from "@headlessui/react";
import {
  Bell,
  Building2,
  CircleUserRound,
  IndianRupee,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  SlidersHorizontal,
  Sun,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import Layout from "../components/layout/Layout";
import OrganizationDangerZone from "../components/settings/OrganizationDangerZone";
import useAuth from "../hooks/useAuth";
import useUiStore from "../store/uiStore";
import { hasPermission } from "../utils/permissions";

const SETTINGS_STORAGE_KEY = "stockpro-settings";

const defaultSettings = {
  notifications: {
    lowStock: true,
    outOfStock: true,
    stockActivity: false
  },
  currency: "INR",
  dateFormat: "DD/MM/YYYY"
};

const readSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY));
    return {
      ...defaultSettings,
      ...saved,
      notifications: {
        ...defaultSettings.notifications,
        ...saved?.notifications
      }
    };
  } catch {
    return defaultSettings;
  }
};

const settingsSections = [
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Sun },
  { id: "preferences", label: "Preferences", icon: IndianRupee },
  { id: "account", label: "Account", icon: LogOut },
  { id: "danger-zone", label: "Danger zone", icon: Trash2 }
];

const Section = ({ id, icon: Icon, title, description, children, className = "" }) => (
  <section id={id} className={`scroll-mt-6 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:p-6 ${className}`}>
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg theme-primary-soft theme-primary-text">
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold theme-text-primary">{title}</h2>
        <p className="mt-1 text-sm theme-text-muted">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const PreferenceToggle = ({ label, description, checked, onChange }) => (
  <Field as="div" className="flex items-center justify-between gap-4 border-b theme-border-subtle py-4 last:border-b-0 last:pb-0 first:pt-0">
    <div className="min-w-0">
      <Label className="text-sm font-medium theme-text-primary">{label}</Label>
      <Description className="mt-1 text-xs theme-text-muted">{description}</Description>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      className="group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full theme-neutral-soft transition-colors data-[checked]:theme-primary-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus-ring)] focus-visible:ring-offset-2"
    >
      <span className="pointer-events-none inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-data-[checked]:translate-x-5" />
    </Switch>
  </Field>
);

const Settings = () => {
  const { user, logout, updateTwoFactor } = useAuth();
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const navigate = useNavigate();
  const [settings, setSettings] = useState(readSettings);
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);

  const organization = user?.organizationId;
  const organizationName = user?.organizationName || (typeof organization === "object" ? organization?.name : "");
  const isAdmin = user?.role === "admin" || user?.role === "Admin";
  const canChangePassword = hasPermission(user, "profile.change-password");
  const canManageTwoFactor = hasPermission(user, "profile.two-factor");

  const updateNotification = (key, value) => {
    setSettings((current) => {
      const next = {
        ...current,
        notifications: { ...current.notifications, [key]: value }
      };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        toast.error("Notification preference could not be saved on this device.");
      }
      return next;
    });
  };

  const handleTwoFactorChange = async (enabled) => {
    setIsUpdatingTwoFactor(true);
    try {
      await updateTwoFactor(enabled);
      toast.success(`Two-factor authentication ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Two-factor settings could not be updated");
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center gap-4 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:p-7">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
            <SlidersHorizontal size={22} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider theme-primary-text">Workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text-primary">Settings</h1>
            <p className="mt-1 text-sm theme-text-muted">Manage your account, alerts, appearance, and preferences</p>
          </div>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
          <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-5 lg:flex-col lg:overflow-visible">
            {settingsSections.filter(({ id }) => id !== "danger-zone" || isAdmin).map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium theme-text-secondary transition theme-hover-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-focus-ring)]"
              >
                <Icon size={17} className="shrink-0 theme-text-muted" />
                {label}
              </a>
            ))}
          </nav>

          <div className="min-w-0 space-y-5">
          <Section id="profile" icon={CircleUserRound} title="Profile" description="Your StockPro account details">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full theme-primary-bg text-2xl font-semibold text-white">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={`${user?.name || "Member"} profile`} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "M"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold theme-text-primary">{user?.name || "Member"}</h3>
                <p className="mt-1 truncate text-sm theme-text-muted">{user?.email || "Email unavailable"}</p>
                <span className="mt-3 inline-flex rounded-full theme-success-soft px-2.5 py-1 text-xs font-semibold capitalize theme-success">
                  {user?.role?.toLowerCase() === "admin" ? "Admin" : "Member"}
                </span>
              </div>
            </div>
          </Section>

          <Section id="security" icon={KeyRound} title="Security" description="Manage your password and sign-in verification">
            <p className="mb-4 text-sm theme-text-secondary">
              Change your password with your current password or temporary sign-in password.
            </p>
            {canChangePassword && <Link
              to="/change-password"
              className="inline-flex items-center rounded-xl theme-primary-action-bg px-4 py-2.5 text-sm font-semibold text-white"
            >
              Change password
            </Link>}
            {canManageTwoFactor && <div className="mt-5 border-t theme-border-subtle pt-4">
              <Field as="div" className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Label className="text-sm font-medium theme-text-primary">Email two-factor authentication</Label>
                  <Description className="mt-1 text-xs theme-text-muted">
                    {isAdmin
                      ? "Recommended for administrators. A code is required after each sign-in."
                      : "When enabled, a code is required after each sign-in."}
                  </Description>
                </div>
                <Switch
                  checked={Boolean(user?.twoFactorEnabled)}
                  onChange={handleTwoFactorChange}
                  disabled={isUpdatingTwoFactor}
                  aria-label="Email two-factor authentication"
                  className="group relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full theme-neutral-soft transition-colors data-[checked]:theme-primary-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-focus-ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-data-[checked]:translate-x-5" />
                </Switch>
              </Field>
            </div>}
          </Section>

          <Section id="organization" icon={Building2} title="Organization" description="Your workspace and access">
            <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs theme-text-muted">Organization name</dt>
                <dd className="mt-1 break-words text-sm font-medium theme-text-primary">{organizationName || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs theme-text-muted">Your role</dt>
                <dd className="mt-1 text-sm font-medium theme-text-primary">
                  {user?.role?.toLowerCase() === "admin" ? "Admin" : "Member"}
                </dd>
              </div>
            </dl>
            {isAdmin && (
              <Link
                to="/members"
                className="mt-6 inline-flex items-center gap-2 rounded-xl theme-primary-action-bg px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Users size={17} />
                Manage organization members
              </Link>
            )}
          </Section>

          <Section id="notifications" icon={Bell} title="Notifications" description="Choose the inventory alerts you want to track">
            <PreferenceToggle
              label="Low stock"
              description="When an item falls below its reorder level"
              checked={settings.notifications.lowStock}
              onChange={(value) => updateNotification("lowStock", value)}
            />
            <PreferenceToggle
              label="Out of stock"
              description="When an item has no available units"
              checked={settings.notifications.outOfStock}
              onChange={(value) => updateNotification("outOfStock", value)}
            />
            <PreferenceToggle
              label="Stock activity"
              description="When stock quantities are adjusted"
              checked={settings.notifications.stockActivity}
              onChange={(value) => updateNotification("stockActivity", value)}
            />
            <p className="mt-4 text-xs theme-text-muted">The navbar notification menu uses these preferences to show live inventory alerts.</p>
          </Section>

          <Section id="appearance" icon={Sun} title="Appearance" description="Choose how StockPro looks on this device">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Appearance theme">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                  className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border px-2 py-3 text-sm font-medium transition ${theme === value ? "border-[var(--theme-primary)] theme-primary-soft theme-primary-text" : "theme-border theme-text-secondary theme-hover-neutral"}`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs theme-text-muted">
              System automatically follows your device’s light or dark appearance.
            </p>
          </Section>

       

          <Section id="account" icon={LogOut} title="Account" description="Sign out of your StockPro account">
            <p className="text-sm theme-text-secondary">You can sign back in at any time with your account credentials.</p>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              <LogOut size={16} />
              Log out
            </Button>
          </Section>

          {isAdmin && <OrganizationDangerZone />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;