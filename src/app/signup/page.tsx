'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function SignUp() {
    // State variables for the form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    // Initialize the Supabase client. We do this here because this is a client component.
    const supabase = createPagesBrowserClient();

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Reset error state on new submission

        // --- Basic Validation ---
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        // --- Supabase Sign-Up Logic ---
        try {
            // We create a "dummy" email address for Supabase auth, as it requires one.
            // The user will never see or use this email.
            const email = `${username}@cry-tracker.app`;

            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    // We pass the username here so our database trigger can access it.
                    data: {
                        username: username,
                    }
                }
            });

            if (signUpError) {
                // Display a user-friendly error
                setError(signUpError.message);
                console.error("Sign-up error:", signUpError);
                return;
            }

            // If sign-up is successful, Supabase sends a confirmation email by default.
            // Since we're using a dummy email, this won't be delivered.
            // You can disable this in your Supabase project settings if you wish.
            // (Settings -> Authentication -> Email Templates -> disable "Confirmation")

            // For now, we'll just redirect the user to a login page or dashboard.
            alert('Sign-up successful! Please check your console for user data. You can now log in.');
            router.push('/login'); // We will create this page next.

        } catch (catchError: any) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Catch block error:", catchError);
        }
    };

    // Minimalistic form UI
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
}
