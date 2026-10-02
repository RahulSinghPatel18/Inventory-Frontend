import { useEffect, useState } from "react";
import { Description, Field, Label, Switch } from "@headlessui/react";
import {
  ArrowLeft,
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
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Layout from "../components/layout/Layout";
import Select from "../components/common/Select";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";
import useUiStore from "../store/uiStore";

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
  const { user, getProfile, logout } = useAuth();
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(readSettings);
  const [passwordStep, setPasswordStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;

    getProfile()
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load account details");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getProfile]);

  const organization = user?.organizationId;
  const organizationId = typeof organization === "string" ? organization : organization?._id;
  const organizationName = user?.organizationName || (typeof organization === "object" ? organization?.name : "");

  const updateNotification = (key, value) => {
    setSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: value }
    }));
  };

  const updatePreference = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const savePreferences = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      toast.success("Preferences saved on this device");
    } catch {
      toast.error("Preferences could not be saved");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const continuePasswordSetup = () => {
    if (!currentPassword.trim()) return;
    setCurrentPassword("");
    setPasswordStep(2);
  };

  const returnToCurrentPassword = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordStep(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[500px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

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
            {settingsSections.map(({ id, label, icon: Icon }) => (
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
                  <img src={user.profileImage} alt={`${user?.name || "User"} profile`} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold theme-text-primary">{user?.name || "User"}</h3>
                <p className="mt-1 truncate text-sm theme-text-muted">{user?.email || "Email unavailable"}</p>
                <span className="mt-3 inline-flex rounded-full theme-success-soft px-2.5 py-1 text-xs font-semibold capitalize theme-success">
                  {user?.role || "Role unavailable"}
                </span>
              </div>
            </div>
          </Section>

          <Section id="security" icon={KeyRound} title="Security" description="Manage your password">
            <div className="mb-5 flex items-center gap-3" aria-live="polite">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full theme-primary-bg text-sm font-semibold text-white">
                {passwordStep}
              </span>
              <div>
                <p className="text-sm font-semibold theme-text-primary">
                  {passwordStep === 1 ? "Confirm it’s you" : "Choose a new password"}
                </p>
                <p className="text-xs theme-text-muted">Step {passwordStep} of 2</p>
              </div>
              <div className="ml-auto flex gap-1.5" aria-hidden="true">
                <span className="h-1.5 w-8 rounded-full theme-primary-bg" />
                <span className={`h-1.5 w-8 rounded-full ${passwordStep === 2 ? "theme-primary-bg" : "theme-neutral-soft"}`} />
              </div>
            </div>

            <div className="rounded-xl border theme-border-subtle theme-background p-4 sm:p-5">
              {passwordStep === 1 ? (
                <div className="max-w-md">
                  <p className="mb-4 text-sm theme-text-secondary">Enter your current password to continue.</p>
                  <Input
                    label="Current password"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter current password"
                    required
                    showPasswordToggle
                  />
                  <div className="mt-5 flex justify-end">
                    <Button onClick={continuePasswordSetup} disabled={!currentPassword.trim()}>
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="New password"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter new password"
                      required
                      showPasswordToggle
                    />
                    <Input
                      label="Confirm new password"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter new password"
                      required
                      showPasswordToggle
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-3 border-t theme-border-subtle pt-4">
                    <Button variant="outline" onClick={returnToCurrentPassword}>
                      <ArrowLeft size={16} />
                      Back
                    </Button>
                    <Button disabled>Update password</Button>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs theme-text-muted">Password verification and updates are not connected yet. This screen will not change your account password.</p>
          </Section>

          <Section id="organization" icon={Building2} title="Organization" description="Your workspace and access">
            <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs theme-text-muted">Organization name</dt>
                <dd className="mt-1 break-words text-sm font-medium theme-text-primary">{organizationName || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs theme-text-muted">Organization ID</dt>
                <dd className="mt-1 break-all text-sm font-medium theme-text-primary">{organizationId || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs theme-text-muted">Your role</dt>
                <dd className="mt-1 text-sm font-medium capitalize theme-text-primary">{user?.role || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs theme-text-muted">Members</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm font-medium theme-text-primary"><Users size={15} /> Not available</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs theme-text-muted">Organization details and member counts are not provided by the current account API.</p>
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
            <p className="mt-4 text-xs theme-text-muted">These preferences are stored on this device; alert delivery is not connected.</p>
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
          </Section>

          <Section id="preferences" icon={IndianRupee} title="Preferences" description="Set your default display options">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Currency"
                name="currency"
                value={settings.currency}
                onChange={(event) => updatePreference("currency", event.target.value)}
                options={[
                  { value: "INR", label: "INR (₹) - Indian Rupee" },
                  { value: "USD", label: "USD ($) - US Dollar" },
                  { value: "EUR", label: "EUR (€) - Euro" },
                  { value: "GBP", label: "GBP (£) - Pound Sterling" }
                ]}
              />
              <Select
                label="Date format"
                name="dateFormat"
                value={settings.dateFormat}
                onChange={(event) => updatePreference("dateFormat", event.target.value)}
                options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
                ]}
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={savePreferences}>Save preferences</Button>
            </div>
          </Section>

          <Section id="account" icon={LogOut} title="Account" description="Sign out of your StockPro account">
            <p className="text-sm theme-text-secondary">You can sign back in at any time with your account credentials.</p>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              <LogOut size={16} />
              Log out
            </Button>
          </Section>

          <Section id="danger-zone" icon={Trash2} title="Danger zone" description="Permanently remove your account and its data" className="border-[var(--theme-danger)]/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm theme-text-secondary">Account deletion is not available through the current account API.</p>
              <Button variant="danger" disabled className="shrink-0">
                <Trash2 size={16} />
                Delete account
              </Button>
            </div>
          </Section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;