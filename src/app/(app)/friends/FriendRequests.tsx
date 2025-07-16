'use client';

import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

type RequesterProfile = {
    id: string;
    username: string;
    avatar_url: string | null;
};

type FriendRequest = {
    id: number;
    requester: RequesterProfile;
};

export default function FriendRequests({ initialRequests }: { initialRequests: FriendRequest[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const supabase = createPagesBrowserClient();

    const handleRequest = async (requestId: number, newStatus: 'accepted' | 'blocked') => {
        const { error } = await supabase
            .from('friendships')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) {
            alert(`Error handling request: ${error.message}`);
        } else {
            setRequests(requests.filter((req) => req.id !== requestId));
        }
    };

    if (requests.length === 0) {
        return <p>You have no pending friend requests.</p>;
    }

    return (
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ddd' }}>
            <h3>Friend Requests</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {requests.map((request) => (
                    <li key={request.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img
                                src={request.requester.avatar_url || 'https://placehold.co/50x50/eee/ccc?text=??'}
                                alt={`${request.requester.username}'s avatar`}
                                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                            />
                            <span>{request.requester.username}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleRequest(request.id, 'accepted')} style={{ padding: '8px 12px', cursor: 'pointer' }}>Accept</button>
                            <button onClick={() => handleRequest(request.id, 'blocked')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none' }}>Decline</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
