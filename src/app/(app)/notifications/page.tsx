import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NotificationList from './NotificationList';

export default async function NotificationsPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: notifications } = await supabase
        .from('notifications')
        .select(`
            id,
            created_at,
            is_read,
            type,
            post_id,
            actor:profiles!notifications_actor_id_fkey (
                username,
                avatar_url
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Notifications</h1>
            <NotificationList initialNotifications={notifications || []} />
        </div>
    );
}
