import React, { useState } from "react";
import { Save, Lock, Key, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import axiosInstance from "@/Api/axiosInstance";

const PasswordInput = ({
  label,
  name,
  value,
  icon,
  showKey,
  show,
  setShow,
  onChange,
  error,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>

    <div className="relative">
      <input
        type={show[showKey] ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 pr-24 border rounded-md transition-all duration-200 outline-none focus:ring-2 
          ${error
            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"}`}
      />

      {/* Small left icon */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </div>

      {/* Eye icon */}
      <div
        onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-blue-500"
      >
        {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
      </div>
    </div>
    {error && (
      <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
        <AlertCircle size={14} />
        {error}
      </div>
    )}
  </div>
);

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    // Clear error for this field as user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    setFieldErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });

    const errors = {};
    if (!passwords.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwords.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "New passwords do not match";
    }

    if (passwords.currentPassword && passwords.newPassword &&
      passwords.currentPassword === passwords.newPassword) {
      errors.newPassword = "New password cannot be same as current password";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put("/admin/change-password", passwords);
      setMessage({
        type: "success",
        text: "Password changed successfully!",
      });
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 max-w-md">
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={passwords.currentPassword}
          showKey="current"
          show={show}
          setShow={setShow}
          onChange={handleChange}
          error={fieldErrors.currentPassword}
        />

        <PasswordInput
          label="New Password"
          name="newPassword"
          value={passwords.newPassword}
          showKey="new"
          show={show}
          setShow={setShow}
          onChange={handleChange}
          error={fieldErrors.newPassword}
        />

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          showKey="confirm"
          show={show}
          setShow={setShow}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
        />

      </div>

      {message.text && (
        <div
          className={`p-3 rounded-md text-sm ${message.type === "success"
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-600"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-start pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
