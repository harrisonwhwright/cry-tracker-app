import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PostCard from '../../components/PostCard';
import HugButton from './HugButton';
import ClientFormattedDate from '../../components/ClientFormattedDate';

export default async function HomeFeed() {
    const supabase = createServerComponentClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

    const friendIds = (friendships || []).map(f =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    const postUserIds = [user.id, ...friendIds];

    const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles ( username, avatar_url ), hugs ( count )')
        .in('user_id', postUserIds)
        .or(`is_public.eq.true,user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

    const { data: userHugs } = await supabase
        .from('hugs')
        .select('post_id')
        .eq('user_id', user.id);

    const userHuggedPostIds = new Set(userHugs?.map(hug => hug.post_id) || []);

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Home Feed</h1>
            {posts && posts.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} userHuggedPostIds={userHuggedPostIds} />
                    ))}
                </ul>
            ) : (
                <p>Your feed is empty. Add some friends to see their posts!</p>
            )}
        </div>
    );
}
