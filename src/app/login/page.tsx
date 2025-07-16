'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
    // State variables for the form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    // Initialize the Supabase client
    const supabase = createPagesBrowserClient();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Reset error state

        // --- Supabase Login Logic ---
        try {
            // We use the same "dummy" email convention as the sign-up page
            const email = `${username}@cry-tracker.app`;

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) {
                setError(signInError.message);
                console.error("Login error:", signInError);
                return;
            }

            // On successful login, Supabase sets a session cookie automatically.
            // We can now redirect the user to the main page of the app.
            router.push('/home'); // Redirect to the home/dashboard page
            router.refresh(); // Refresh the page to update the server-side session state

        } catch (catchError: any) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Catch block error:", catchError);
        }
    };

    // Minimalistic form UI
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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
                        style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
        </div>
    );
}
