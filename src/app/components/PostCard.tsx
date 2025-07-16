'use client';

import Link from 'next/link'; // Import the Link component
import ClientFormattedDate from './ClientFormattedDate';
import PostOptionsMenu from './PostOptionsMenu';
import HugButton from '../(app)/home/HugButton';

// Define the type for the post object this component expects
type PostWithDetails = {
    id: number;
    content: string;
    created_at: string;
    image_url: string | null;
    is_public: boolean;
    user_id: string;
    profiles: {
        username: string;
        avatar_url: string | null;
    } | null;
    hugs: {
        count: number;
    }[];
};

type PostCardProps = {
    post: PostWithDetails;
    userHuggedPostIds: Set<number>;
};

export default function PostCard({ post, userHuggedPostIds }: PostCardProps) {
    return (
        <li style={{ border: '1px solid #eee', padding: '15px', marginBottom: '15px', position: 'relative', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* THE FIX: Wrap the user info in a Link */}
                <Link href={`/profile/${post.profiles?.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={post.profiles?.avatar_url || 'https://placehold.co/40x40/eee/ccc?text=??'}
                        alt={`${post.profiles?.username}'s avatar`}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                    <strong>{post.profiles?.username}</strong>
                </Link>
                <PostOptionsMenu post={post} />
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
    );
}
