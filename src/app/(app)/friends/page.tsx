import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FriendsClient from './FriendsClient';

export default async function FriendsPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch all necessary initial data for the client component
    const { data: friendships } = await supabase
        .from('friendships')
        .select('id, status, profiles!friendships_addressee_id_fkey(id, username, avatar_url), requester:profiles!friendships_requester_id_fkey(id, username, avatar_url)')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Manage Friends</h1>
            <FriendsClient serverFriendships={friendships || []} />
        </div>
    );
}
