'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

type Profile = {
    id: string;
    username: string;
    avatar_url: string | null;
};

type Friendship = {
    requester_id: string;
    addressee_id: string;
    status: 'pending' | 'accepted' | 'blocked';
};

export default function SearchPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Profile[]>([]);
    const [friendships, setFriendships] = useState<Friendship[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const supabase = createPagesBrowserClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const fetchFriendships = async () => {
            const { data } = await supabase
                .from('friendships')
                .select('*')
                .or(`requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`);

            if (data) {
                setFriendships(data);
            }
        };
        fetchFriendships();
    }, [currentUser]);


    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim() || !currentUser) return;

        setLoading(true);
        setMessage('');
        setResults([]);

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('username', query.trim())
            .neq('id', currentUser.id);

        setLoading(false);
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else if (data.length === 0) {
            setMessage('No user found with that exact username.');
        } else {
            setResults(data);
        }
    };

    const handleSendRequest = async (addresseeId: string) => {
        if (!currentUser) return;

        const { error } = await supabase.from('friendships').insert({
            requester_id: currentUser.id,
            addressee_id: addresseeId,
            status: 'pending',
        });

        if (error) {
            alert(`Error sending request: ${error.message}`);
        } else {
            setFriendships([...friendships, { requester_id: currentUser.id, addressee_id: addresseeId, status: 'pending' }]);
        }
    };
    
    const getFriendshipStatus = (userId: string): 'friends' | 'pending' | 'not_friends' => {
        if (!currentUser) return 'not_friends';

        for (const f of friendships) {
            const isRequester = f.requester_id === currentUser.id && f.addressee_id === userId;
            const isAddressee = f.addressee_id === currentUser.id && f.requester_id === userId;

            if (isRequester || isAddressee) {
                return f.status === 'accepted' ? 'friends' : 'pending';
            }
        }
        return 'not_friends';
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Search for Users</h1>

            <form onSubmit={handleSearch} style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter an exact username..."
                    style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div style={{ marginTop: '30px' }}>
                {message && <p>{message}</p>}
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {results.map((profile) => {
                        const status = getFriendshipStatus(profile.id);
                        return (
                            <li key={profile.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eee', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img
                                        src={profile.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'}
                                        alt={`${profile.username}'s avatar`}
                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                    />
                                    <span>{profile.username}</span>
                                </div>
                                <button
                                    onClick={() => handleSendRequest(profile.id)}
                                    disabled={status !== 'not_friends'}
                                    style={{
                                        cursor: status !== 'not_friends' ? 'not-allowed' : 'pointer',
                                        opacity: status !== 'not_friends' ? 0.6 : 1
                                    }}
                                >
                                    {status === 'friends' && 'Friends'}
                                    {status === 'pending' && 'Pending'}
                                    {status === 'not_friends' && 'Add Friend'}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
