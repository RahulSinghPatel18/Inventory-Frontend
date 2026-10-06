import { useRef, useState } from "react";
import { Building2, Camera, Mail, Shield, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import FeedbackModal from "../components/common/FeedbackModal";
import Input from "../components/common/Input";
import useAuth from "../hooks/useAuth";
import { isRequired } from "../utils/validators";
import { hasPermission } from "../utils/permissions";
import compressImageToDataUrl from "../utils/compressImage";

const MAX_PROFILE_IMAGE_DATA_URL_SIZE = 300 * 1024;

const Profile = () => {
  const { user, updateProfile, updateOrganization } = useAuth();
  const canEditProfile = hasPermission(user, "profile.update");
  const canUpdateOrganization = hasPermission(user, "organization.update") &&
    String(user?.role || "").toLowerCase() === "admin";
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [organizationName, setOrganizationName] = useState(user?.organizationName || "");
  const [organizationDraft, setOrganizationDraft] = useState(user?.organizationName || "");
  const [organizationEditing, setOrganizationEditing] = useState(false);
  const [organizationSaving, setOrganizationSaving] = useState(false);
  const imageInputRef = useRef(null);

  const handleOrganizationUpdate = async (event) => {
    event.preventDefault();
    const nextName = organizationDraft.trim();
    if (!nextName || nextName.length > 120) {
      toast.error("Organization name is required and must be at most 120 characters.");
      return;
    }
    setOrganizationSaving(true);
    try {
      await updateOrganization(nextName);
      setOrganizationName(nextName);
      setOrganizationDraft(nextName);
      setOrganizationEditing(false);
      toast.success("Organization name updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update organization name.");
    } finally {
      setOrganizationSaving(false);
    }
  };

  const handleImageChange = async (event) => {
    if (!isEditing || saving || isUploading) return;

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    setIsUploading(true);
    try {
      const compressedImage = await compressImageToDataUrl(file, {
        maxDataUrlLength: MAX_PROFILE_IMAGE_DATA_URL_SIZE,
        sizeError: "Image could not be compressed below 300 KB"
      });
      setProfileImage(compressedImage);
      toast.success("Image ready to save");
    } catch (error) {
      toast.error(error.message || "Failed to prepare image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEditing) return;

    const updatedName = name.trim();

    if (!isRequired(updatedName)) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const data = await updateProfile({
        name: updatedName,
        profileImage: profileImage.trim()
      });
      setName(data.user?.name || updatedName);
      setProfileImage(data.user?.profileImage || profileImage.trim());
      setIsEditing(false);
      setFeedback({
        type: "success",
        title: "Profile updated",
        message: data.message || "Your profile changes have been saved."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        title: "Profile update failed",
        message: error.response?.data?.message || "Failed to update profile"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setProfileImage(user?.profileImage || "");
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <form onSubmit={handleSubmit}>
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight theme-text-primary">Profile</h1>
              <p className="mt-1 text-sm theme-text-muted">Manage your personal and account details</p>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving || isUploading}
                >
                  <X size={16} />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={saving || isUploading}
                  loadingText={isUploading ? "Preparing image..." : "Updating profile..."}
                >
                  <Save size={16} />
                  Save 
                </Button>
              </div>
            ) : canEditProfile ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Pencil size={16} />
                Edit 
              </Button>
            ) : null}
          </header>

          <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
            <div className="h-24 theme-decoration-muted sm:h-32" aria-hidden="true" />
            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4  theme-primary-bg text-3xl font-bold text-white shadow-md sm:h-28 sm:w-28">
                  {profileImage ? (
                    <img src={profileImage} alt={`${name || "Member"} profile`} className="h-full w-full object-cover" />
                  ) : (
                    name?.charAt(0)?.toUpperCase() || "U"
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    tabIndex={-1}
                    disabled={!isEditing || saving || isUploading}
                  />
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-wider theme-primary-text">Account profile</p>
                  <h2 className="mt-1 truncate text-xl font-bold theme-text-primary sm:text-2xl">{name || "Member"}</h2>
                  <p className="mt-1 truncate text-sm theme-text-muted">{user?.email || "No email available"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={saving || isUploading}
                      loading={isUploading}
                      loadingText="Preparing..."
                    >
                      <Camera size={16} />
                      Change photo
                    </Button>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full theme-success-soft px-3 py-2 text-xs font-semibold capitalize theme-success">
                    <Shield size={14} />
                    {user?.role?.toLowerCase() === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold theme-text-primary">Account details</h2>
              <p className="mt-1 text-sm theme-text-muted">Information associated with your account</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
                disabled={!isEditing || saving}
              />

              <div className="flex min-h-[76px] items-center gap-3 rounded-xl border theme-border-subtle theme-background p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-info-soft theme-info">
                  <Mail size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">Email address</p>
                  <p className="mt-1 truncate text-sm font-semibold theme-text-primary">{user?.email || "Not available"}</p>
                </div>
              </div>

              <div className="flex min-h-[76px] items-center gap-3 rounded-xl border theme-border-subtle theme-background p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-neutral-soft theme-text-secondary">
                  <Shield size={18} />
                </span>
                <div>
                  <p className="text-xs theme-text-muted">Account role</p>
                  <p className="mt-1 text-sm font-semibold theme-text-primary">
                    {user?.role?.toLowerCase() === "admin" ? "Admin" : "Member"}
                  </p>
                </div>
              </div>

            </div>
          </section>
        </form>
        <section className="mt-5 rounded-2xl border theme-border theme-surface p-5 shadow-sm sm:p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-info-soft theme-info"><Building2 size={18} /></span>
              <div><h2 className="font-semibold theme-text-primary">Organization</h2><p className="mt-1 text-sm theme-text-muted">Your account and inventory are scoped to this organization.</p></div>
            </div>
            {canUpdateOrganization && !organizationEditing && <Button type="button" variant="outline" onClick={() => { setOrganizationDraft(organizationName); setOrganizationEditing(true); }}><Pencil size={16} />Edit </Button>}
          </div>
          {organizationEditing ? <form onSubmit={handleOrganizationUpdate} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <Input label="Organization name" name="organizationName" value={organizationDraft} onChange={(event) => setOrganizationDraft(event.target.value)} required maxLength={120} disabled={organizationSaving} />
            <Button type="button" variant="outline" disabled={organizationSaving} onClick={() => { setOrganizationDraft(organizationName); setOrganizationEditing(false); }}><X size={16} />Cancel</Button>
            <Button type="submit" loading={organizationSaving}><Save size={16} />Save </Button>
          </form> : <p className="rounded-xl border theme-border-subtle theme-background px-4 py-3 text-sm font-semibold theme-text-primary">{organizationName || "Organization name unavailable"}</p>}
        </section>
        <FeedbackModal
          isOpen={!!feedback}
          onClose={() => setFeedback(null)}
          type={feedback?.type}
          title={feedback?.title}
          message={feedback?.message}
        />
      </div>
    </Layout>
  );
};

export default Profile;