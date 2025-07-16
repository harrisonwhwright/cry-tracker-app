'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();
    const supabase = createPagesBrowserClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Explicitly redirect to the login page for a clean logout experience.
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            style={{
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
            }}
        >
            Logout
        </button>
    );
}
