import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });
  const [initialProfile, setInitialProfile] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch user profile on mount
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setProfile({
        name: user.name || "",
        email: user.email || "",
      });
      setInitialProfile({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShow({ ...show, [field]: !show[field] });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");

      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Update initial profile to match new details (disable button)
      setInitialProfile({ ...profile });

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setError("All password fields are required");
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setError("New password and confirm password do not match");
      return;
    }

    if (passwords.newPass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPass,
          confirmPassword: passwords.confirm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setSuccess(data.message);
      setPasswords({
        current: "",
        newPass: "",
        confirm: "",
      });
    } catch (err) {
      setError("Server error, please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 grid gap-6">

        {/* ---------------- PROFILE INFO ---------------- */}
        <div className="border rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={profile.name}
                onChange={handleProfileChange}
                className="border p-2 rounded-lg w-full"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={profile.email}
                onChange={handleProfileChange}
                className="border p-2 rounded-lg w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading || (profile.name === initialProfile.name && profile.email === initialProfile.email)}
              className={`mt-4 px-4 py-2 rounded-lg text-white 
                ${loading || (profile.name === initialProfile.name && profile.email === initialProfile.email)
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* ---------------- CHANGE PASSWORD FORM ---------------- */}
        <form
          onSubmit={handleChangePasswordSubmit}
          className="border rounded-xl p-4"
        >
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                name="current"
                placeholder="Current Password"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="border p-2 rounded-lg w-full pr-10"
              />
              <span
                onClick={() => toggleShow("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="relative">
              <input
                type={show.newPass ? "text" : "password"}
                name="newPass"
                placeholder="New Password"
                value={passwords.newPass}
                onChange={handlePasswordChange}
                className="border p-2 rounded-lg w-full pr-10"
              />
              <span
                onClick={() => toggleShow("newPass")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {show.newPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="relative">
              <input
                type={show.confirm ? "text" : "password"}
                name="confirm"
                placeholder="Confirm Password"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="border p-2 rounded-lg w-full pr-10"
              />
              <span
                onClick={() => toggleShow("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`mt-5 px-4 py-2 rounded-lg flex items-center justify-center gap-2 
              ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600"}
              text-white`}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}


































