"use client";

import './globals.css';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import type { ReactNode } from 'react';

// This is the root layout for the new Next.js App Router.
export default function RootLayout({ children }: { children: ReactNode }) {
    // Create a new supabase browser client on every render.
    const [supabaseClient] = useState(() => createPagesBrowserClient());

    return (
        <html lang="en">
            <body>
                <SessionContextProvider
                    supabaseClient={supabaseClient}
                    initialSession={null} // initialSession is not needed in this setup
                >
                    {children}
                </SessionContextProvider>
            </body>
        </html>
    );
}
