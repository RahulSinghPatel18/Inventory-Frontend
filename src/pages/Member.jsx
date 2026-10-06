import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  KeyRound,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  Users as UsersIcon
} from "lucide-react";
import { toast } from "sonner";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Layout from "../components/layout/Layout";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import PageHeader from "../components/common/PageHeader";
import SortableHeader from "../components/common/SortableHeader";
import authService from "../services/authService";
import { isRequired, isStrongPassword, isValidEmail } from "../utils/validators";
import { normalizePermissions, permissionGroups } from "../utils/permissions";

const permissionLabels = new Map(permissionGroups.flatMap(({ items }) => items));

const randomIndex = (max) => {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % max;
};

const generatePassword = () => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*+-=?";
  const alphabet = uppercase + lowercase + digits + symbols;
  const password = [
    uppercase[randomIndex(uppercase.length)],
    lowercase[randomIndex(lowercase.length)],
    digits[randomIndex(digits.length)],
    symbols[randomIndex(symbols.length)]
  ];

  while (password.length < 16) password.push(alphabet[randomIndex(alphabet.length)]);
  for (let index = password.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [password[index], password[swapIndex]] = [password[swapIndex], password[index]];
  }
  return password.join("");
};

const Users = () => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [oneTimePassword, setOneTimePassword] = useState("");
  const [copyingPassword, setCopyingPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [permissionTarget, setPermissionTarget] = useState(null);
  const [permissionDraft, setPermissionDraft] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState("");

  const loadMembers = useCallback(async (requestedPage, isActive = () => true) => {
    if (!isActive()) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await authService.getOrganizationUsers({
        page: requestedPage, limit: 10, sortBy, sortOrder
      });
      if (isActive()) {
        setMembers(data.users);
        setPagination(data);
      }
    } catch (requestError) {
      if (isActive()) {
        setError(requestError.response?.data?.message || "Unable to load organization members.");
      }
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => loadMembers(page, () => active));
    return () => {
      active = false;
    };
  }, [loadMembers, page]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!isRequired(createForm.name)) {
      toast.error("Name is required");
      return;
    }
    if (!isValidEmail(createForm.email)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!isStrongPassword(createForm.password)) {
      toast.error("Use a strong password with 8+ characters, uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsCreating(true);
    setOneTimePassword("");
    try {
      await authService.createOrganizationUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password
      });
      setOneTimePassword(createForm.password);
      setCreateForm({ name: "", email: "", password: "", confirmPassword: "" });
      toast.success("Member created successfully.");
      if (page === 1) await loadMembers(1);
      else setPage(1);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to create member.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editingUser || !isRequired(editingUser.name) || !isValidEmail(editingUser.email)) {
      toast.error("Enter a name and valid email address.");
      return;
    }

    setIsSavingEdit(true);
    try {
      await authService.updateOrganizationUser(editingUser._id, {
        name: editingUser.name.trim(),
        email: editingUser.email.trim()
      });
      toast.success("Member updated");
      setEditingUser(null);
      await loadMembers(page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update member.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openPermissions = (member) => {
    setPermissionTarget(member);
    setPermissionDraft(normalizePermissions(member.permissions));
  };

  const savePermissions = async (event) => {
    event.preventDefault();
    if (!permissionTarget) return;
    setIsSavingPermissions(true);
    try {
      await authService.updateOrganizationUser(permissionTarget._id, {
        permissions: permissionDraft
      });
      toast.success("Member permissions saved.");
      setPermissionTarget(null);
      await loadMembers(page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to save member permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (!isStrongPassword(resetForm.password)) {
      toast.error("Enter a strong password with 8+ characters, uppercase, lowercase, a number, and a symbol.");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsResetting(true);
    try {
      await authService.resetOrganizationUserPassword(resetTarget._id, resetForm.password);
      setOneTimePassword(resetForm.password);
      setResetForm({ password: "", confirmPassword: "" });
      toast.success("Password reset successfully.");
      setResetTarget(null);
      await loadMembers(page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to reset member password.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyPassword = async (password) => {
    setCopyingPassword(true);
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied");
    } catch {
      toast.error("Could not copy the password. Select and copy it manually.");
    } finally {
      setCopyingPassword(false);
    }
  };

  const handleToggleStatus = async (member) => {
    setUpdatingUserId(member._id);
    try {
      await authService.updateOrganizationUser(member._id, { isActive: !member.isActive });
      toast.success(member.isActive ? "Member deactivated" : "Member activated");
      await loadMembers(page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to update member status.");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await authService.deleteOrganizationUser(deleteTarget._id);
      toast.success("Member deleted");
      setDeleteTarget(null);
      await loadMembers(page);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to delete member.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Organization members"
          description="Create and manage members in your organization."
        />

        <section className="mb-6 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-base font-semibold theme-text-primary">Create a member</h2>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Name"
              name="newUserName"
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              required
              disabled={isCreating}
            />
            <Input
              label="Email"
              name="newUserEmail"
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
              required
              disabled={isCreating}
            />
            <Input
              label="Password"
              name="newUserPassword"
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
              required
              disabled={isCreating}
              showPasswordToggle
            />
            <Input
              label="Confirm password"
              name="confirmUserPassword"
              type="password"
              value={createForm.confirmPassword}
              onChange={(event) => setCreateForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              required
              disabled={isCreating}
              showPasswordToggle
            />
            <div className="flex flex-wrap items-end gap-2">
              <Button
                type="submit"
                loading={isCreating}
                loadingText="Creating member"
                disabled={createForm.password !== createForm.confirmPassword}
                className="flex-1"
              >
                Create 
              </Button>
              <Button
                variant="outline"
                disabled={isCreating}
                onClick={() => setCreateForm((current) => {
                  const password = generatePassword();
                  return { ...current, password, confirmPassword: password };
                })}
              >
                <RefreshCw size={15} /> Generate
              </Button>
              <button
                type="button"
                disabled={!createForm.password || copyingPassword}
                onClick={() => handleCopyPassword(createForm.password)}
                aria-label="Copy password"
                title="Copy password"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border theme-border theme-surface theme-text-secondary theme-hover-neutral disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy size={17} aria-hidden="true" />
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs theme-text-muted">
            New members receive member access automatically. Share passwords securely; existing passwords cannot be viewed later.
          </p>
          {oneTimePassword && (
            <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl theme-success-soft p-4">
              <p className="flex min-w-0 items-center gap-2 text-sm theme-success">
                <span>New password (shown once):</span>
                <code className="break-all font-semibold">{oneTimePassword}</code>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Copy new password"
                  title="Copy new password"
                  disabled={copyingPassword}
                  onClick={() => handleCopyPassword(oneTimePassword)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border theme-border theme-surface theme-text-secondary theme-hover-neutral disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Copy size={17} aria-hidden="true" />
                </button>
                <Button variant="outline" onClick={() => setOneTimePassword("")}>Dismiss</Button>
              </div>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
          <div className="flex items-center justify-between border-b theme-border-subtle px-5 py-4">
            <div>
              <h2 className="font-semibold theme-text-primary">Members</h2>
              <p className="mt-1 text-xs theme-text-muted">
                {pagination ? `${pagination.totalUsers} members in this organization` : "Members in this organization"}
              </p>
            </div>
            <UsersIcon size={20} className="theme-primary-text" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b theme-border-subtle px-5 py-3 text-xs font-semibold uppercase tracking-wide theme-text-muted" aria-label="Sort members">
            <span>Sort:</span>
            {[
              ["name", "Name"],
              ["email", "Email"],
              ["status", "Status"]
            ].map(([field, label]) => (
              <SortableHeader
                key={field}
                field={field}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={(nextField, nextOrder) => {
                  setPage(1);
                  setSortBy(nextField);
                  setSortOrder(nextOrder);
                }}
              >{label}</SortableHeader>
            ))}
          </div>
          {isLoading ? (
            <div className="p-6 text-sm theme-text-muted" role="status">Loading members...</div>
          ) : error ? (
            <div className="p-5">
              <ErrorState message={error} onRetry={() => loadMembers(page)} />
            </div>
          ) : members.length === 0 ? (
            <EmptyState title="No members yet" message="Create a member to add someone to this organization." />
          ) : (
            <div className="divide-y theme-border-subtle">
              {members.map((member) => (
                <div key={member._id} className="px-5 py-4">
                  {editingUser?._id === member._id ? (
                    <form onSubmit={handleSaveEdit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
                      <Input
                        label="Name"
                        name={`editName-${member._id}`}
                        value={editingUser.name}
                        onChange={(event) => setEditingUser((current) => ({ ...current, name: event.target.value }))}
                        disabled={isSavingEdit}
                        required
                      />
                      <Input
                        label="Email"
                        name={`editEmail-${member._id}`}
                        type="email"
                        value={editingUser.email}
                        onChange={(event) => setEditingUser((current) => ({ ...current, email: event.target.value }))}
                        disabled={isSavingEdit}
                        required
                      />
                      <Button type="submit" loading={isSavingEdit} loadingText="Saving">Save</Button>
                      <Button variant="outline" disabled={isSavingEdit} onClick={() => setEditingUser(null)}>Cancel</Button>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold theme-text-primary">{member.name}</p>
                        <p className="truncate text-sm theme-text-muted">{member.email}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs theme-text-muted">
                          <span className="capitalize">{member.role}</span>
                          <span className={member.isActive === false ? "theme-danger" : "theme-success"}>
                            {member.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </div>
                       
                      </div>
                      {member.role === "user" && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOneTimePassword("");
                              setEditingUser({ _id: member._id, name: member.name, email: member.email });
                            }}
                          >
                            <Pencil size={15} /> Edit
                          </Button>
                          <Button variant="outline" onClick={() => openPermissions(member)}>
                            <ShieldCheck size={15} /> Permissions
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setOneTimePassword("");
                              setResetTarget(member);
                              setResetForm({ password: "", confirmPassword: "" });
                            }}
                          >
                            <KeyRound size={15} /> Reset password
                          </Button>
                          <Button
                            variant="outline"
                            loading={updatingUserId === member._id}
                            loadingText="Updating"
                            disabled={Boolean(updatingUserId) && updatingUserId !== member._id}
                            onClick={() => handleToggleStatus(member)}
                          >
                            {member.isActive === false
                              ? <UserRoundCheck size={15} />
                              : <UserRoundX size={15} />}
                            {member.isActive === false ? "Activate" : "Deactivate"}
                          </Button>
                          <Button
                            variant="danger"
                            disabled={Boolean(updatingUserId)}
                            onClick={() => setDeleteTarget(member)}
                          >
                            <Trash2 size={15} /> Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {pagination && (
                <Pagination {...pagination} onPageChange={setPage} />
              )}
            </div>
          )}
        </section>
        <Modal
          isOpen={Boolean(permissionTarget)}
          onClose={() => !isSavingPermissions && setPermissionTarget(null)}
          title={`Permissions${permissionTarget ? ` · ${permissionTarget.name}` : ""}`}
          size="xl"
        >
          <form onSubmit={savePermissions} className="space-y-5">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingPermissions}
                onClick={() => setPermissionDraft(permissionGroups.flatMap(({ items }) => items.map(([key]) => key)))}
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSavingPermissions}
                onClick={() => setPermissionDraft([])}
              >
                Clear all
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {permissionGroups.map((group) => (
                <fieldset key={group.label} className="rounded-xl border theme-border p-4">
                  <legend className="px-1 text-sm font-semibold theme-text-primary">{group.label}</legend>
                  <div className="mt-2 space-y-2">
                    {group.items.map(([permission, label]) => (
                      <label key={permission} className="flex items-start gap-2 text-sm theme-text-secondary">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[var(--color-primary)]"
                          checked={permissionDraft.includes(permission)}
                          onChange={(event) => setPermissionDraft((current) => (
                            event.target.checked
                              ? [...new Set([...current, permission])]
                              : current.filter((value) => value !== permission)
                          ))}
                          disabled={isSavingPermissions}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t theme-border-subtle pt-4">
              <Button type="button" variant="outline" disabled={isSavingPermissions} onClick={() => setPermissionTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={isSavingPermissions} loadingText="Saving permissions">
                Save permissions
              </Button>
            </div>
          </form>
        </Modal>
      </div>
      <ConfirmDialog
        isOpen={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        onConfirm={handleResetPassword}
        title="Reset member password?"
        message={`Set a new password for ${resetTarget?.name || "this member"}. The old password cannot be viewed or recovered.`}
        confirmText="Set new password"
        loadingText="Resetting password..."
        loading={isResetting}
      >
        <div className="mt-4 space-y-3">
          <Input
            label="New password"
            name="resetUserPassword"
            type="password"
            value={resetForm.password}
            onChange={(event) => setResetForm((current) => ({ ...current, password: event.target.value }))}
            disabled={isResetting}
            required
            showPasswordToggle
          />
          <Input
            label="Confirm new password"
            name="confirmResetUserPassword"
            type="password"
            value={resetForm.confirmPassword}
            onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            disabled={isResetting}
            required
            showPasswordToggle
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={isResetting}
              onClick={() => setResetForm(() => {
                const password = generatePassword();
                return { password, confirmPassword: password };
              })}
            >
              <RefreshCw size={15} /> Generate
            </Button>
            <Button
              variant="outline"
              disabled={!resetForm.password || copyingPassword}
              onClick={() => handleCopyPassword(resetForm.password)}
            >
              <Copy size={15} /> Copy
            </Button>
          </div>
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete organization member?"
        message={`This permanently deletes ${deleteTarget?.name || "this member"} and removes their access. This action cannot be undone.`}
        confirmText="Delete member"
        loadingText="Deleting member..."
        loading={isDeleting}
      />
    </Layout>
  );
};

export default Users;
