'use client';

import { useState, useEffect } from 'react';
import EditProfileForm from './EditProfileForm';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import ClientFormattedDate from '../../components/ClientFormattedDate';
import PostCard from '../../components/PostCard';

type Post = {
    id: number;
    user_id: string;
    content: string;
    is_public: boolean;
    created_at: string;
    image_url: string | null;
    hugs: { count: number }[];
};

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_private: boolean;
    created_at: string;
};

export default function ProfileClient({ profile, posts, userHuggedPostIds }: { profile: Profile, posts: Post[], userHuggedPostIds: Set<number> }) {
    const [isEditing, setIsEditing] = useState(false);
    const [postImageFile, setPostImageFile] = useState<File | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const router = useRouter();
    const supabase = createPagesBrowserClient();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPosting(true);

        const formData = new FormData(e.currentTarget);
        const content = formData.get('content') as string;
        const isPublic = formData.get('is_public') === 'on';

        if (!content && !postImageFile) {
            alert('A post must have text or an image.');
            setIsPosting(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsPosting(false);
            return;
        }

        let imageUrl: string | null = null;

        if (postImageFile) {
            const fileExt = postImageFile.name.split('.').pop();
            const filePath = `${user.id}-post-${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, postImageFile);

            if (uploadError) {
                alert(`Error uploading image: ${uploadError.message}`);
                setIsPosting(false);
                return;
            }

            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('post-images')
                .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

            if (signedUrlError) {
                alert(`Error creating signed URL for post image: ${signedUrlError.message}`);
                setIsPosting(false);
                return;
            }
            
            imageUrl = signedUrlData.signedUrl;
        }

        const { error: postError } = await supabase.from('posts').insert({
            content,
            is_public: isPublic,
            user_id: user.id,
            image_url: imageUrl,
        });

        if (postError) {
            alert(`Error creating post: ${postError.message}`);
        } else {
            setPostImageFile(null);
            (e.target as HTMLFormElement).reset();
            router.refresh();
        }
        setIsPosting(false);
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h1>Profile</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                <img
                    src={profile.avatar_url || 'https://placehold.co/100x100/eee/ccc?text=Avatar'}
                    alt="Profile avatar"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                    <h2>{profile.username}</h2>
                    <p>{profile.full_name || 'No name set'}</p>
                    <p style={{ color: '#666', fontSize: '0.9em' }}>
                        Joined: {isClient ? new Date(profile.created_at).toLocaleDateString() : ''}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ padding: '10px 20px' }}>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                {isEditing && (
                    <div style={{ marginTop: '20px' }}>
                        <EditProfileForm profile={profile} />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h2>Create a New Post</h2>
                <form id="create-post-form" onSubmit={createPost}>
                    <textarea
                        name="content"
                        placeholder="What's on your mind?"
                        style={{ width: '100%', minHeight: '80px', padding: '8px', marginBottom: '10px' }}
                    ></textarea>
                    <div>
                        <label htmlFor="postImage">Attach an image:</label>
                        <input
                            type="file"
                            id="postImage"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setPostImageFile(e.target.files[0]);
                                }
                            }}
                            style={{ display: 'block', margin: '10px 0' }}
                        />
                    </div>
                    <div>
                        <input type="checkbox" name="is_public" id="is_public" defaultChecked />
                        <label htmlFor="is_public" style={{ marginLeft: '8px' }}>Make this post public to friends</label>
                    </div>
                    <button type="submit" disabled={isPosting} style={{ marginTop: '10px', padding: '10px 20px' }}>
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </form>
            </div>

            <div>
                <h2>Your Posts</h2>
                {posts && posts.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {posts.map((post) => (
                           <PostCard key={post.id} post={post} userHuggedPostIds={userHuggedPostIds} />
                        ))}
                    </ul>
                ) : (
                    <p>You haven't made any posts yet.</p>
                )}
            </div>
        </div>
    );
}
