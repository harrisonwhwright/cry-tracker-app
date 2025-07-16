'use client';

import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Define the type for a single friend object
type Friend = {
    friendship_id: number;
    id: string;
    username: string;
    avatar_url: string | null;
};

export default function FriendList({ initialFriends }: { initialFriends: Friend[] }) {
    const [friends, setFriends] = useState(initialFriends);
    const supabase = createPagesBrowserClient();

    const handleUnfriend = async (friendshipId: number, friendUsername: string) => {
        if (confirm(`Are you sure you want to unfriend ${friendUsername}?`)) {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('id', friendshipId);

            if (error) {
                alert(`Error unfriending: ${error.message}`);
            } else {
                // Remove the friend from the list in the UI instantly
                setFriends(friends.filter(f => f.friendship_id !== friendshipId));
            }
        }
    };

    if (friends.length === 0) {
        return <p>You haven't added any friends yet.</p>;
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {friends.map((friend) => (
                <li key={friend.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={friend.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'}
                            alt={`${friend.username}'s avatar`}
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                        <span>{friend.username}</span>
                    </div>
                    <button
                        onClick={() => handleUnfriend(friend.friendship_id, friend.username)}
                        style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none' }}
                    >
                        Unfriend
                    </button>
                </li>
            ))}
        </ul>
    );
}
