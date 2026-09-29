import { useEffect, useRef, useState } from "react";
import { Camera, Mail, Shield, CalendarDays, UserCircle } from "lucide-react";
import { toast } from "react-toastify";

import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Spinner from "../components/common/Spinner";
import useAuth from "../hooks/useAuth";

const Profile = () => {
  const { user, getProfile, updateProfile, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const imageInputRef = useRef(null);

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

  const handleImageChange = (event) => {
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

    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result);
    reader.onerror = () => toast.error("Failed to read image");
    reader.readAsDataURL(file);
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