'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Define the type for a single notification object
type Notification = {
    id: number;
    created_at: string;
    is_read: boolean;
    type: string;
    post_id: number | null;
    actor: {
        username: string;
        avatar_url: string | null;
    };
};

export default function NotificationList({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const supabase = createPagesBrowserClient();
    const router = useRouter();

    // This state ensures date formatting only happens on the client
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    // This effect runs once when the component mounts to mark notifications as read
    useEffect(() => {
        const markAsRead = async () => {
            const unreadIds = initialNotifications.filter(n => !n.is_read).map(n => n.id);
            if (unreadIds.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .in('id', unreadIds);
                
                // Refresh the server components (like the layout) to update the count
                router.refresh();
            }
        };

        markAsRead();
    }, [initialNotifications, supabase, router]);

    const getNotificationMessage = (notification: Notification) => {
        const actorUsername = <strong>{notification.actor.username}</strong>;
        switch (notification.type) {
            case 'new_hug':
                return <>{actorUsername} sent you a hug.</>;
            case 'accepted_friend_request':
                return <>{actorUsername} accepted your friend request.</>;
            case 'new_friend_request':
                 return <>{actorUsername} sent you a friend request.</>;
            default:
                return 'You have a new notification.';
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            {notifications.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            style={{
                                padding: '15px',
                                border: '1px solid #eee',
                                marginBottom: '10px',
                                opacity: notification.is_read ? 0.6 : 1,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <img
                                    src={notification.actor.avatar_url || 'https://placehold.co/40x40/eee/ccc?text=??'}
                                    alt={`${notification.actor.username}'s avatar`}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                />
                                <div>
                                    <p style={{ margin: 0 }}>{getNotificationMessage(notification)}</p>
                                    <small style={{ color: '#666' }}>
                                        {/* THE FIX: Only render the formatted date on the client */}
                                        {isClient ? new Date(notification.created_at).toLocaleString() : ''}
                                    </small>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You have no notifications.</p>
            )}
        </div>
    );
}
