'use client';

import { useState, useEffect, useRef } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

type PostOptionsMenuProps = {
    post: {
        id: number;
        user_id: string;
    };
};

export default function PostOptionsMenu({ post }: PostOptionsMenuProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const supabase = createPagesBrowserClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        fetchUser();

        // Close menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id);

            if (error) {
                alert(`Error deleting post: ${error.message}`);
            } else {
                setIsOpen(false);
                router.refresh(); // Refresh the page to show the updated post list
            }
        }
    };

    // Only render the menu if the post belongs to the current user
    if (!currentUser || currentUser.id !== post.user_id) {
        return null;
    }

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
            >
                ...
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '0',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 10,
                }}>
                    <button
                        onClick={handleDelete}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 15px',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: 'red',
                        }}
                    >
                        Delete Post
                    </button>
                </div>
            )}
        </div>
    );
}
