import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import NavBar from '../components/NavBar';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch the count of unread notifications for the current user.
    const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

    return (
        <div>
            <NavBar unreadCount={count ?? 0} />
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        </div>
    );
}
