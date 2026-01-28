import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import axiosInstance from "../../Api/axiosInstance";
import { AlertCircle, Shield, Users, Settings, ArrowLeft, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });

  // General login error
  const [generalError, setGeneralError] = useState("");

  const [success, setSuccess] = useState("");

  // ✅ Field-level validation function
  function validateField(name, value) {
    let message = "";
    if (name === "email") {
      if (!value) message = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) message = "Enter a valid email";
    }
    if (name === "password") {
      if (!value) message = "Password is required";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setSuccess("");

    // ✅ Run validation synchronously
    const errors = {};
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email";

    if (!password) errors.password = "Password is required";

    // ✅ Update state once
    setFieldErrors(errors);

    // ✅ Stop if errors exist
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        { email, password }
      );

      console.log("Login successful:", response.data);
      setSuccess("Login successful!");

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigate to dashboard based on user role with a small delay
      setTimeout(() => {
        if (response.data.user.role === "Admin") {
          navigate("/admin/dashboard");
        } else if (response.data.user.role === "HR") {
          navigate("/candidateManagement");
        } else {
          // Default to admin dashboard
          navigate("/admin/dashboard");
        }
      }, 1000); // 1 second delay to show success message
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setGeneralError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-slate-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Company Info */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">InterviewPro</h1>
                <p className="text-slate-600">Enterprise Solutions</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-800 leading-tight">
                Welcome Back,
                <span className="block text-blue-600">Administrator</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Access your comprehensive dashboard to manage interviews, candidates, and analytics with enterprise-grade security.
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-slate-700">Manage candidates and interviews</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-slate-700">Configure interview settings</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-slate-700">Enterprise security & compliance</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center p-4 bg-white/60 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-800">500+</div>
              <div className="text-sm text-slate-600">Companies</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-800">10K+</div>
              <div className="text-sm text-slate-600">Interviews</div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-slate-800">99.9%</div>
              <div className="text-sm text-slate-600">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10">
            <CardHeader className="text-center pb-6 pt-8">
              {/* Logo */}
              <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to access your management dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateField("email", e.target.value);
                      }}
                      className={`pl-10 h-12 bg-white/50 border-2 transition-all duration-200 ${fieldErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                        } rounded-xl`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateField("password", e.target.value);
                      }}
                      className={`pl-10 h-12 bg-white/50 border-2 transition-all duration-200 ${fieldErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
                        } rounded-xl`}
                    />
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.password}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/forgot-password')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* General Error */}
                {generalError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      {generalError}
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {success}
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                      Redirecting to dashboard...
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Access Dashboard
                    </div>
                  )}
                </Button>
              </form>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600 text-sm font-medium">Enterprise Security</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
