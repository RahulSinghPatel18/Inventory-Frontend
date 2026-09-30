import { useEffect, useRef, useState } from "react";
import { Camera, Mail, Shield, CalendarDays, UserCircle, Building2 } from "lucide-react";
import { toast } from "react-toastify";

import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

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
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const imageInputRef = useRef(null);
  const organizationId = typeof user?.organizationId === "string"
    ? user.organizationId
    : user?.organizationId?._id || "";

  useEffect(() => {
    setName(user?.name || "");
    setProfileImage(user?.profileImage || "");
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [getProfile]);

  const handleImageChange = async (event) => {
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

    try {
      const compressedImage = await compressProfileImage(file);
      setProfileImage(compressedImage);
    } catch {
      toast.error("Failed to compress image");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedName = name.trim();

    if (!updatedName) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const data = await updateProfile({
        name: updatedName,
        profileImage: profileImage.trim()
      });
      toast.success(data.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
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

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border theme-primary-border theme-primary-soft theme-primary-text shadow-sm transition-transform duration-200 hover:scale-105">
            <UserCircle
              size={25}
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight theme-text-primary sm:text-2xl">
              Profile
            </h1>

            <p className="mt-1 text-sm theme-text-muted">
              View your account information
            </p>
          </div>

        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* Profile Card */}
          <div className="rounded-2xl border theme-border theme-surface p-6 shadow-sm transition hover:shadow-md">

            <div className="flex flex-col items-center text-center">

              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full theme-primary-bg text-3xl font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  name?.charAt(0)?.toUpperCase() || "U"
                )}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  aria-label="Upload profile picture"
                  title="Upload profile picture"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full theme-primary-action-bg text-white shadow-md"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  tabIndex={-1}
                />
              </div>

              <h2 className="mt-4 text-xl font-bold theme-text-primary">
                {name || "User"}
              </h2>

              <p className="mt-1 text-sm theme-text-muted">
                {user?.email || "No email available"}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full theme-success-soft px-3 py-1.5 text-xs font-semibold capitalize theme-success">
                <Shield size={13} />
                {user?.role || "user"}
              </div>

            </div>

          </div>

          {/* Account Information */}
          <div className="rounded-2xl border theme-border theme-surface p-6 shadow-sm lg:col-span-2">

            <div className="mb-6">

              <h2 className="text-lg font-semibold theme-text-primary">
                Account Information
              </h2>

              <p className="mt-1 text-sm theme-text-muted">
                Your registered account details
              </p>

            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">

              {/* Full Name */}
              <div>
                <Input
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email */}
              <div className="theme-profile-field theme-profile-field-info rounded-xl p-4 transition">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-info-soft theme-info">
                    <Mail size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">
                      Email Address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold theme-text-primary">
                      {user?.email || "Not available"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Role */}
              <div className="theme-profile-field rounded-xl p-4 transition">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-neutral-soft theme-text-secondary">
                    <Shield size={18} />
                  </div>

                  <div>
                    <p className="text-xs theme-text-muted">
                      Account Role
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize theme-text-primary">
                      {user?.role || "user"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Status */}
              <div className="theme-profile-field rounded-xl p-4 transition">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-success-soft theme-success">
                    <CalendarDays size={18} />
                  </div>

                  <div>
                    <p className="text-xs theme-text-muted">
                      Account Status
                    </p>

                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold theme-text-primary">
                      <span className="h-2 w-2 rounded-full theme-primary-bg" />
                      Active
                    </p>
                  </div>

                </div>

              </div>

              {/* Organization */}
              <div className="theme-profile-field rounded-xl p-4 transition">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl theme-primary-soft theme-primary-text">
                    <Building2 size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">
                      Organization ID
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold theme-text-primary">
                      {organizationId || "Not available"}
                    </p>
                  </div>

                </div>

              </div>

              </div>

              <div className="mt-6 flex justify-end">
                <Button type="submit" loading={saving}>
                  Save 
                </Button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Profile;