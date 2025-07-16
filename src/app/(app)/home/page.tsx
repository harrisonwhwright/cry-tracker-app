import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HugButton from './HugButton';
import ClientFormattedDate from '../../components/ClientFormattedDate';
import PostOptionsMenu from '../../components/PostOptionsMenu'; // Import the new component

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

    // Make sure to select user_id for the post
    const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at, image_url, is_public, user_id, profiles ( username, avatar_url ), hugs ( count )')
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
                        <li key={post.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <img
                                    src={post.profiles?.avatar_url || 'https://placehold.co/40x40/eee/ccc?text=??'}
                                    alt={`${post.profiles?.username}'s avatar`}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                />
                                <strong>{post.profiles?.username}</strong>
                                {/* Add the options menu to the feed */}
                                <div style={{ marginLeft: 'auto' }}>
                                    <PostOptionsMenu post={post} />
                                </div>
                            </div>
                            <p>{post.content}</p>
                            {post.image_url && (
                                <img
                                    src={post.image_url}
                                    alt="Post image"
                                    style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }}
                                />
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                <small style={{ color: '#666' }}>
                                    <ClientFormattedDate dateString={post.created_at} />
                                </small>
                                <HugButton
                                    postId={post.id}
                                    initialHugs={post.hugs[0]?.count || 0}
                                    userHasHugged={userHuggedPostIds.has(post.id)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your feed is empty. Add some friends to see their posts!</p>
            )}
        </div>
    );
}
