'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import PostCard from '../../../components/PostCard';
import ClientFormattedDate from '../../../components/ClientFormattedDate';

export default function UserProfileClient({ profile, initialFriendship, posts, userHuggedPostIds }: any) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [friendship, setFriendship] = useState(initialFriendship);
    const supabase = createPagesBrowserClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    // --- UPDATED LOGIC ---
    const handleAcceptRequest = async () => {
        if (!friendship) return;
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendship.id);

        if (error) {
            alert("Error accepting request.");
        } else {
            setFriendship({ ...friendship, status: 'accepted' });
            router.refresh();
        }
    };

    const handleDeclineRequest = async () => {
        if (!friendship) return;
        const { error } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendship.id);

        if (error) {
            alert("Error declining request.");
        } else {
            setFriendship(null); // The friendship row is gone
            router.refresh();
        }
    };

    const handleSendRequest = async () => {
        if (!currentUser) return;
        
        const { data, error } = await supabase.from('friendships').insert({
            requester_id: currentUser.id,
            addressee_id: profile.id,
            status: 'pending',
        }).select().single();

        if (error) {
            alert("Error sending request.");
        } else {
            setFriendship(data);
        }
    };

    const getButton = () => {
        if (!friendship) {
            return <button onClick={handleSendRequest}>Add Friend</button>;
        }

        if (friendship.status === 'accepted') {
            return <button disabled>Friends</button>;
        }

        if (friendship.status === 'pending') {
            if (friendship.requester_id === profile.id) {
                return (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleAcceptRequest}>Accept</button>
                        <button onClick={handleDeclineRequest} style={{backgroundColor: '#666', color: 'white', border: 'none'}}>Decline</button>
                    </div>
                );
            }
            return <button disabled>Request Sent</button>;
        }

        return <button onClick={handleSendRequest}>Add Friend</button>;
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <img
                    src={profile.avatar_url || 'https://placehold.co/100x100/eee/ccc?text=Avatar'}
                    alt="Profile avatar"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                    <h2>{profile.username}</h2>
                    <p style={{ color: '#666', fontSize: '0.9em' }}>
                        <ClientFormattedDate dateString={profile.created_at} />
                    </p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    {getButton()}
                </div>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <div>
                {friendship?.status === 'accepted' ? (
                    <>
                        <h3>{profile.username}'s Public Posts</h3>
                        {posts && posts.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                                {posts.map((post: any) => (
                                    <PostCard key={post.id} post={post} userHuggedPostIds={userHuggedPostIds} />
                                ))}
                            </ul>
                        ) : (
                            <p>{profile.username} hasn't made any public posts yet.</p>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                        <p>🔒 This profile is private.</p>
                        <p>Add {profile.username} as a friend to see their public posts.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
