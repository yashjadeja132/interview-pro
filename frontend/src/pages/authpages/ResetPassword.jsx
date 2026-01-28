import React, { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axiosInstance from '@/Api/axiosInstance';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Key,  Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate,useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const{email} = useParams();
    const [show, setShow] = useState({
        password: false,
        confirmPassword: false,
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        // Empty check
        if (!password || !confirmPassword) {
            setError("Both password fields are required");
            setLoading(false);
            return;
        }

        // Password strength validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

        if (!passwordRegex.test(password)) {
            setError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            );
            setLoading(false);
            return;
        }

        // Match validation
        if (password !== confirmPassword) {
            setError("Password and Confirm Password do not match");
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post("/auth/reset-password", { email,password });
            navigate("/admin/login");
            setSuccess("Your password has been reset successfully");
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const showPassword = (field) => {
        setShow({ ...show, [field]: !show[field] });
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md">
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10">
                    <CardHeader className="text-center pb-6 pt-8">
                        {/* Icon */}
                        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <Key className="w-8 h-8 text-white" />
                        </div>

                        <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                            Reset Your Password?
                        </CardTitle>
                        <CardDescription className="text-slate-600 px-4">
                            No worries, it happens. Enter your password and we'll send you a recovery link.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    </div>
                                    <input
                                        type={show.password ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border p-2 rounded-lg w-full pr-10"
                                        placeholder='Enter your password'
                                        required
                                    />
                                    <span
                                        onClick={() => showPassword("password")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    >
                                        {show.password ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    </div>

                                    <input
                                        type={show.confirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="border p-2 rounded-lg w-full pr-10"
                                        placeholder='Confirm your password'
                                        required
                                    />
                                    <span
                                        onClick={() => showPassword("confirmPassword")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                    >
                                        {show.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </span>
                                </div>
                            </div>

                            {/* Status Messages */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-emerald-700 font-medium">{success}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || !!success}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending Link...
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        {/* Security Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Secure Verification</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
