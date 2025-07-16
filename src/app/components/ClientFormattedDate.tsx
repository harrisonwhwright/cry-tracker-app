'use client';

import { useState, useEffect } from 'react';

// This component safely formats a date on the client side to avoid hydration errors.
export default function ClientFormattedDate({ dateString }: { dateString: string }) {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        // This code only runs in the browser, after the initial render.
        setFormattedDate(new Date(dateString).toLocaleString());
    }, [dateString]);

    // Return the formatted date, or nothing if it hasn't been formatted yet.
    return <>{formattedDate}</>;
}
