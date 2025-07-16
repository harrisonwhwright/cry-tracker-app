'use client';

import { useState, useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

type HugButtonProps = {
    postId: number;
    initialHugs: number;
    userHasHugged: boolean;
};

export default function HugButton({ postId, initialHugs, userHasHugged }: HugButtonProps) {
    const [hugCount, setHugCount] = useState(initialHugs);
    const [hasHugged, setHasHugged] = useState(userHasHugged);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const supabase = createPagesBrowserClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();
    }, []);

    const handleHug = async () => {
        if (!currentUser) {
            alert('You must be logged in to hug a post.');
            return;
        }

        if (hasHugged) {
            // Un-hug the post
            const { error } = await supabase
                .from('hugs')
                .delete()
                .match({ post_id: postId, user_id: currentUser.id });

            if (!error) {
                setHasHugged(false);
                setHugCount(hugCount - 1);
            }
        } else {
            // Hug the post
            const { error } = await supabase
                .from('hugs')
                .insert({ post_id: postId, user_id: currentUser.id });

            if (!error) {
                setHasHugged(true);
                setHugCount(hugCount + 1);
            }
        }
    };

    return (
        <button
            onClick={handleHug}
            style={{
                padding: '5px 10px',
                border: hasHugged ? '1px solid #ff69b4' : '1px solid #ccc',
                backgroundColor: hasHugged ? '#ffc0cb' : 'white',
                cursor: 'pointer',
                borderRadius: '5px'
            }}
        >
            🤗 {hugCount}
        </button>
    );
}
