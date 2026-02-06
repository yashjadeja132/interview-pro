import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
// import { Info, Clock } from "lucide-react"; // COMMENTED OUT - not used anymore
import api from "../../Api/axiosInstance";
import sparrowLogo from "../../assets/sparrowlogo.svg";
export function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  // const [retestRequestStatus, setRetestRequestStatus] = useState(null);
  // const [showRetestNotification, setShowRetestNotification] = useState(false);

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

    const errors = {};
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/candidates/login", { email, password });
      setSuccess("Login successful!");
      if (response.status === 200) {
        const { candidate, token } = response.data;

        // Check for pending retest request - COMMENTED OUT
        // if (retestRequest?.hasRequest && retestRequest?.isPending) {
        //   setRetestRequestStatus(retestRequest);
        //   setShowRetestNotification(true);
        //   // Don't navigate yet, show notification first
        //   return;
        // }

        // If approved, they can proceed (no notification needed)

        sessionStorage.setItem(
          "candidateData",
          JSON.stringify({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            positionId: candidate.position._id,
            positionName: candidate.position.name,
            questionsAskedToCandidate: candidate.questionsAskedToCandidate,
            timeforTest: candidate.timeforTest,
            token,
          })
        );
        navigate('/candidate/StartTest');
      }
    } catch (err) {
      setGeneralError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Centered Card */}
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader className="text-center pb-6 pt-8">
            {/* Logo */}
            <div className="mx-auto mb-4 w-12 h-12 rounded-lg flex items-center justify-center">
            <img src={sparrowLogo} alt="Logo" className="w-12 h-12" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900 mb-1">Sign In</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your interview
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateField("email", e.target.value);
                    }}
                    className={`pl-10 h-11 bg-white border transition-colors ${fieldErrors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      } rounded-lg focus:ring-2 focus:ring-offset-0`}
                  />
                </div>
                {fieldErrors.email && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`pl-10 h-11 bg-white border transition-colors ${fieldErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      } rounded-lg focus:ring-2 focus:ring-offset-0`}
                  />
                </div>
                {fieldErrors.password && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* General Error */}
              {generalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    {generalError}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                  </div>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-gray-600 text-xs font-medium">Secure Login</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
