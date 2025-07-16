'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Define types
type FriendshipWithProfiles = {
    id: number;
    status: 'pending' | 'accepted' | 'blocked';
    profiles: { id: string; username: string; avatar_url: string | null; };
    requester: { id: string; username: string; avatar_url: string | null; };
};

type ProfileSearchResult = {
    id: string;
    username: string;
    avatar_url: string | null;
};

export default function FriendsClient({ serverFriendships }: { serverFriendships: FriendshipWithProfiles[] }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [friendships, setFriendships] = useState(serverFriendships);
    
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

    const supabase = createPagesBrowserClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        setFriendships(serverFriendships);
    }, [serverFriendships]);

    const { friendRequests, acceptedFriends } = useMemo(() => {
        if (!currentUser) return { friendRequests: [], acceptedFriends: [] };
        
        const requests = friendships
            .filter(f => f.status === 'pending' && f.profiles.id === currentUser.id)
            .map(f => ({ ...f.requester, friendship_id: f.id }));

        const friends = friendships
            .filter(f => f.status === 'accepted')
            .map(f => {
                const friendProfile = f.requester.id === currentUser.id ? f.profiles : f.requester;
                return { ...friendProfile, friendship_id: f.id };
            });

        return { friendRequests: requests, acceptedFriends: friends };
    }, [friendships, currentUser]);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim() || !currentUser) return;

        setLoadingSearch(true);
        setSearchMessage('');
        setSearchResults([]);

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .ilike('username', `%${query}%`)
            .neq('id', currentUser.id);

        setLoadingSearch(false);
        if (error) {
            setSearchMessage(`Error: ${error.message}`);
        } else if (data.length === 0) {
            setSearchMessage('No users found.');
        } else {
            setSearchResults(data);
        }
    };

    const handleFriendshipAction = async (friendshipId: number, newStatus: 'accepted' | 'blocked' | 'deleted') => {
        if (newStatus === 'deleted') {
            if (!confirm('Are you sure you want to unfriend this user?')) return;
            const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
            if (!error) {
                setFriendships(friendships.filter(f => f.id !== friendshipId));
            }
        } else {
            const { error } = await supabase.from('friendships').update({ status: newStatus }).eq('id', friendshipId);
            if (!error) {
                setFriendships(friendships.map(f => f.id === friendshipId ? { ...f, status: newStatus } : f));
            }
        }
    };

    const handleSendRequest = async (addresseeId: string) => {
        if (!currentUser) return;

        // Disable the button immediately to prevent multiple clicks
        const tempFriendship = {
            id: Date.now(),
            status: 'pending' as const,
            requester: { id: currentUser.id, username: '', avatar_url: '' },
            profiles: { id: addresseeId, username: '', avatar_url: '' }
        };
        setFriendships(current => [...current, tempFriendship]);
        
        const { error } = await supabase.from('friendships').insert({
            requester_id: currentUser.id,
            addressee_id: addresseeId,
            status: 'pending',
        });
        
        if (error) {
            // The UNIQUE constraint we added will cause an error if a request already exists.
            // We can just inform the user.
            if (error.code === '23505') { // 23505 is the code for a unique violation
                alert("You already have a pending request with this user.");
            } else {
                alert("Error sending request. Please try again.");
            }
            // Revert the optimistic UI update on error
            setFriendships(friendships.filter(f => f.id !== tempFriendship.id));
        } else {
            // Refresh the page data in the background to get the real object
            router.refresh();
        }
    };

    const getFriendshipStatus = (userId: string): 'friends' | 'pending_sent' | 'pending_received' | 'not_friends' => {
        if (!currentUser) return 'not_friends';
        const friendship = friendships.find(f => (f.requester.id === userId && f.profiles.id === currentUser.id) || (f.requester.id === currentUser.id && f.profiles.id === userId));
        if (!friendship) return 'not_friends';
        if (friendship.status === 'accepted') return 'friends';
        if (friendship.status === 'pending') {
            return friendship.requester.id === currentUser.id ? 'pending_sent' : 'pending_received';
        }
        return 'not_friends';
    };

    return (
        <div style={{ marginTop: '20px' }}>
            {/* --- Search Section --- */}
            <section>
                <h2>Find New Friends</h2>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username..."
                        style={{ width: '100%', padding: '10px', fontSize: '16px', boxSizing: 'border-box' }}
                    />
                    <button type="submit" disabled={loadingSearch} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
                        {loadingSearch ? 'Searching...' : 'Search'}
                    </button>
                </form>
                <div style={{ marginTop: '20px' }}>
                    {searchMessage && <p>{searchMessage}</p>}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {searchResults.map((profile) => {
                            const status = getFriendshipStatus(profile.id);
                            return (
                                <li key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img src={profile.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                        <span>{profile.username}</span>
                                    </div>
                                    <button onClick={() => handleSendRequest(profile.id)} disabled={status !== 'not_friends'}>
                                        {status === 'friends' && 'Friends'}
                                        {status === 'pending_sent' && 'Request Sent'}
                                        {status === 'pending_received' && 'Accept Request'}
                                        {status === 'not_friends' && 'Add Friend'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* --- Friend Requests Section --- */}
            <section style={{ marginTop: '40px' }}>
                <h3>Friend Requests</h3>
                {friendRequests.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {friendRequests.map(req => (
                            <li key={req.friendship_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img src={req.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                    <span>{req.username}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleFriendshipAction(req.friendship_id, 'accepted')}>Accept</button>
                                    <button onClick={() => handleFriendshipAction(req.friendship_id, 'blocked')}>Decline</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>No new friend requests.</p>}
            </section>

            {/* --- Friend List Section --- */}
            <section style={{ marginTop: '40px' }}>
                <h3>Your Friends</h3>
                {acceptedFriends.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {acceptedFriends.map(friend => (
                            <li key={friend.friendship_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img src={friend.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                    <span>{friend.username}</span>
                                </div>
                                <button onClick={() => handleFriendshipAction(friend.friendship_id, 'deleted')} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Unfriend</button>
                            </li>
                        ))}
                    </ul>
                ) : <p>You haven't added any friends yet.</p>}
            </section>
        </div>
    );
}
