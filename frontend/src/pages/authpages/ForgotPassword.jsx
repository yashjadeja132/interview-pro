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
import { Key, Mail, ArrowLeft, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!email) {
            setError("Email is required");
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            console.log('forgotPassword api called',email)
            setSuccess("If an account exists with this email, you will receive a reset link shortly.");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 backdrop-blur-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <div className="relative w-full max-w-md">
                <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10">
                    <CardHeader className="text-center pb-6 pt-8">
                        {/* Icon */}
                        <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <Key className="w-8 h-8 text-white" />
                        </div>

                        <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                            Forgot Password?
                        </CardTitle>
                        <CardDescription className="text-slate-600 px-4">
                            No worries, it happens. Enter your email and we'll send you a recovery link.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-medium">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`pl-10 h-12 bg-white/50 border-2 transition-all duration-200 ${error ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
                                            } rounded-xl`}
                                        placeholder='admin@company.com'
                                        required
                                    />
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
                                    "Send Reset Link"
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/login')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Return to Login
                                </button>
                            </div>
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
