"use client";

import { useState } from "react";
import { LogIn, User, KeyRound, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Using Next.js 13+ App Router's navigation hook

export default function LoginPage() {
    const router = useRouter(); // Initialize the router

    // State management for the login form
    const [employeeId, setEmployeeId] = useState('');
    const [password, setPassword] = useState('');
    // The role from the form is not needed for the backend call, but we keep it for the UI
    const [role, setRole] = useState('Depot Manager (Admin)');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // List of possible roles for the dropdown
    const possibleRoles = [
        "Depot Manager (Admin)",
        "Operations Supervisor",
        "Maintenance Technician",
        "Commercial Manager",
        "Read-Only Viewer"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!employeeId || !password) {
            setError('All fields are required.');
            setIsLoading(false);
            return;
        }

        // --- API call to the backend ---
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employeeId, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // If response is not OK (e.g., 400, 401, 500), throw an error with the message from the backend
                throw new Error(data.error || 'Something went wrong.');
            }

            // --- Handle successful login: Redirect based on user role ---
            const userRole = data.user.role;

            switch (userRole) {
                case 'Depot Manager (Admin)':
                    // Admin is redirected to the main page/dashboard
                    router.push('/');
                    break;
                case 'Operations Supervisor':
                    router.push('/windows/operations');
                    break;
                case 'Maintenance Technician':
                    router.push('/windows/maintenance');
                    break;
                case 'Commercial Manager':
                    router.push('/windows/branding');
                    break;
                case 'Read-Only Viewer':
                    router.push('/windows/default');
                    break;
                default:
                    // Fallback for any unknown roles
                    setError("Login successful, but your role has no assigned dashboard.");
                    setIsLoading(false);
                    break;
            }

        } catch (err) {
            // Set the error message to be displayed in the UI
            setError(err.message);
            setIsLoading(false); // Make sure loading stops on error
        }
        // No finally block needed here as we handle setIsLoading in both success and error paths
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex font-sans">
            {/* Left Side: KMRL Banner */}
            <div className="hidden md:flex w-2/5 bg-slate-800 relative items-center justify-center">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616345918261-75a604c35109?q=80&w=1887&auto=format&fit=crop')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-slate-900/80"></div>
                
                <div className="relative z-10 text-center text-white p-8">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3b/Kochi_Metro_logo.svg" 
                        alt="KMRL Logo"
                        className="w-24 h-24 mx-auto mb-6 bg-white/10 p-2 rounded-full backdrop-blur-sm"
                    />
                    <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-lg">KMRL Depot Command Center</h1>
                    <p className="mt-4 text-lg text-slate-300 drop-shadow-md">Smart Operations for a Smarter City.</p>
                </div>
            </div>

            {/* Right Side: Login UI */}
            <div className="w-full md:w-3/5 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 mb-8">Sign in to continue.</p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-md mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Employee ID Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Employee ID</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <input 
                                    type="text" 
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="e.g., KMRL-001"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                            </div>
                        </div>

                        {/* Note: The 'role' selector is now just for show on the frontend.
                            The actual role is determined by the backend upon successful login. */}
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Role (for reference)</label>
                             <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <select 
                                    value={role} 
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
                                >
                                    {possibleRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm text-slate-400">
                                <input type="checkbox" className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-blue-400 hover:underline">Forgot Password?</a>
                        </div>
                        
                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2"/>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

