import React, { useState } from "react";
import { Save, Lock, Key, ShieldCheck, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/Api/axiosInstance";

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

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.put("/admin/change-password", passwords);
      setMessage({
        type: "success",
        text: "Password changed successfully! Please login again.",
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

  const PasswordInput = ({ label, name, value, icon, showKey }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon} {label}
      </label>

      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full p-2 pr-16 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          required
          minLength={6}
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
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Info Card */}
      <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3 border border-orange-100">
        <ShieldCheck className="text-orange-600 mt-1" size={20} />
        <div>
          <h4 className="font-semibold text-orange-900">Security Recommendations</h4>
          <p className="text-xs text-orange-700 mt-1">
            Use a strong password with at least 8 characters, including numbers and symbols.
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-md">

        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={passwords.currentPassword}
          icon={<Lock size={14} />}
          showKey="current"
        />

        <PasswordInput
          label="New Password"
          name="newPassword"
          value={passwords.newPassword}
          icon={<Key size={14} />}
          showKey="new"
        />

        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          icon={<Key size={14} />}
          showKey="confirm"
        />

      </div>

      {message.text && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
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
 