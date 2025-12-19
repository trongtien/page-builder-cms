/**
 * LoginForm Component
 * Reusable login form with validation and error handling
 */

import { useState, type FormEvent } from "react";
import type { LoginCredentials } from "../types/auth.types";

interface LoginFormProps {
    onSubmit: (credentials: LoginCredentials) => Promise<void>;
    isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
    const [formData, setFormData] = useState<LoginCredentials>({
        email: "",
        password: "",
        rememberMe: false
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    return (
        <>
            {/* Login Card */}
            <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-[#ffffff] dark:bg-[#1a2234] py-10 px-6 shadow-xl shadow-slate-200/40 dark:shadow-none sm:rounded-xl sm:px-12 border border-[#cfd7e7]/50 dark:border-[#2d3748]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-[#0d121b] dark:text-gray-200 mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading || isLoading}
                                    className="block w-full rounded-lg border-0 py-3.5 text-[#0d121b] shadow-sm ring-1 ring-inset ring-[#cfd7e7] placeholder:text-[#4c669a] focus:ring-2 focus:ring-inset focus:ring-[#2b6cee] dark:bg-[#101622] dark:text-white dark:ring-[#2d3748] dark:focus:ring-[#2b6cee] sm:text-sm sm:leading-6 bg-[#f6f6f8]/30 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="user@example.com"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg
                                        className="h-5 w-5 text-[#4c669a]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium leading-6 text-[#0d121b] dark:text-gray-200 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading || isLoading}
                                    className="block w-full rounded-lg border-0 py-3.5 pr-10 text-[#0d121b] shadow-sm ring-1 ring-inset ring-[#cfd7e7] placeholder:text-[#4c669a] focus:ring-2 focus:ring-inset focus:ring-[#2b6cee] dark:bg-[#101622] dark:text-white dark:ring-[#2d3748] dark:focus:ring-[#2b6cee] sm:text-sm sm:leading-6 bg-[#f6f6f8]/30 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                >
                                    <svg
                                        className="h-5 w-5 text-[#4c669a] hover:text-[#2b6cee] transition-colors cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {showPassword ? (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        ) : (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-[#cfd7e7] text-[#2b6cee] focus:ring-[#2b6cee] dark:border-[#2d3748] dark:bg-[#101622] dark:ring-offset-[#1a2234] cursor-pointer"
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="ml-2 block text-sm text-[#0d121b] dark:text-gray-300 select-none cursor-pointer"
                                >
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-[#2b6cee] hover:text-[#2b6cee]/80 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || isLoading}
                                className="flex w-full justify-center items-center rounded-lg bg-[#2b6cee] px-3 py-3.5 text-base font-bold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2b6cee] transition-all duration-200 transform active:scale-[0.98] disabled:bg-[#2b6cee]/60 disabled:cursor-not-allowed"
                            >
                                {loading || isLoading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Separator for SSO */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#cfd7e7] dark:border-[#2d3748]"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-[#ffffff] dark:bg-[#1a2234] px-2 text-[#4c669a]">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-[#101622] px-3 py-2.5 text-sm font-semibold text-[#0d121b] dark:text-white shadow-sm ring-1 ring-inset ring-[#cfd7e7] dark:ring-[#2d3748] hover:bg-[#f6f6f8] dark:hover:bg-gray-800 focus-visible:ring-transparent transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                                <span className="text-sm">SSO</span>
                            </button>
                            <button
                                type="button"
                                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white dark:bg-[#101622] px-3 py-2.5 text-sm font-semibold text-[#0d121b] dark:text-white shadow-sm ring-1 ring-inset ring-[#cfd7e7] dark:ring-[#2d3748] hover:bg-[#f6f6f8] dark:hover:bg-gray-800 focus-visible:ring-transparent transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span className="text-sm">Passkey</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-[#4c669a] dark:text-slate-500">
                    © 2024 Enterprise Admin System. All rights reserved.
                    <br />
                    <button type="button" className="hover:text-[#2b6cee] transition-colors">
                        Privacy Policy
                    </button>{" "}
                    ·{" "}
                    <button type="button" className="hover:text-[#2b6cee] transition-colors">
                        Terms of Service
                    </button>
                </p>
            </div>
        </>
    );
}
