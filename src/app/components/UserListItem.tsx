import React from 'react';
import Link from 'next/link'; // Import Link

type UserListItemProps = {
    user: {
        username: string;
        avatar_url: string | null;
    };
    children: React.ReactNode;
};

export default function UserListItem({ user, children }: UserListItemProps) {
    return (
        <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
            <Link href={`/profile/${user.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img
                        src={user.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'}
                        alt={`${user.username}'s avatar`}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                    <span>{user.username}</span>
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '10px' }}>
                {children}
            </div>
        </li>
    );
}
