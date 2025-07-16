'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

// Updated navigation links (Search removed)
const navLinks = [
    { href: '/home', name: 'Home' },
    { href: '/profile', name: 'Profile' },
    { href: '/friends', name: 'Friends' },
    { href: '/notifications', name: 'Notifications' },
];

export default function NavBar({ unreadCount }: { unreadCount: number }) {
    const pathname = usePathname();

    const getNotificationLabel = () => {
        if (unreadCount === 0) {
            return 'Notifications';
        }
        if (unreadCount > 9) {
            return 'Notifications (9+)';
        }
        return `Notifications (${unreadCount})`;
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const label = link.name === 'Notifications' ? getNotificationLabel() : link.name;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            style={{
                                textDecoration: isActive ? 'underline' : 'none',
                                color: isActive ? '#0070f3' : 'black',
                                fontWeight: isActive ? 'bold' : 'normal',
                            }}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
            <LogoutButton />
        </header>
    );
}
