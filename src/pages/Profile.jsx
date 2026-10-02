import { useEffect, useRef, useState } from "react";
import { Camera, Mail, Shield, Building2, Pencil, Save, X } from "lucide-react";
import { toast } from "react-toastify";

import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";
import { isRequired } from "../utils/validators";

const MAX_PROFILE_IMAGE_DATA_URL_SIZE = 300 * 1024;

const compressProfileImage = async (file) => {
  const imageUrl = URL.createObjectURL(file);
  const image = await new Promise((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = () => reject(new Error("Failed to load image"));
    imageElement.src = imageUrl;
  }).finally(() => URL.revokeObjectURL(imageUrl));

  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  let width = Math.max(1, Math.round(image.naturalWidth * scale));
  let height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Failed to process image");

  let quality = 0.82;
  while (true) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.type !== "image/webp") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    }
    if (!blob) throw new Error("Failed to process image");

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });

    if (dataUrl.length <= MAX_PROFILE_IMAGE_DATA_URL_SIZE) return dataUrl;

    if (quality > 0.34) {
      quality = Math.max(0.3, quality - 0.12);
    } else {
      const nextWidth = Math.max(1, Math.floor(width * 0.8));
      const nextHeight = Math.max(1, Math.floor(height * 0.8));
      if (nextWidth === width && nextHeight === height) {
        throw new Error("Image could not be compressed below 300 KB");
      }
      width = nextWidth;
      height = nextHeight;
      quality = 0.82;
    }
  }
};

const Profile = () => {
  const { user, getProfile, updateProfile, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const imageInputRef = useRef(null);
  const organizationId = typeof user?.organizationId === "string"
    ? user.organizationId
    : user?.organizationId?._id || "";

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (active) {
          setName(data.user?.name || "");
          setProfileImage(data.user?.profileImage || "");
        }
      } catch (error) {
        if (active) {
          toast.error(
            error.response?.data?.message ||
            "Failed to load profile"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [getProfile]);

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
      const compressedImage = await compressProfileImage(file);
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
      toast.success(data.message || "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setProfileImage(user?.profileImage || "");
    setIsEditing(false);
  };

  if (loading || isLoading) {
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
                  Save changes
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                <Pencil size={16} />
                Edit profile
              </Button>
            )}
          </header>

          <section className="overflow-hidden rounded-2xl border theme-border theme-surface shadow-sm">
            <div className="h-24 theme-decoration-muted sm:h-32" aria-hidden="true" />
            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4  theme-primary-bg text-3xl font-bold text-white shadow-md sm:h-28 sm:w-28">
                  {profileImage ? (
                    <img src={profileImage} alt={`${name || "User"} profile`} className="h-full w-full object-cover" />
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
                  <h2 className="mt-1 truncate text-xl font-bold theme-text-primary sm:text-2xl">{name || "User"}</h2>
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
                    {user?.role || "user"}
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
                  <p className="mt-1 text-sm font-semibold capitalize theme-text-primary">{user?.role || "user"}</p>
                </div>
              </div>

              <div className="flex min-h-[76px] items-center gap-3 rounded-xl border theme-border-subtle theme-background p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
                  <Building2 size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs theme-text-muted">Organization ID</p>
                  <p className="mt-1 break-all text-sm font-semibold theme-text-primary">{organizationId || "Not available"}</p>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;