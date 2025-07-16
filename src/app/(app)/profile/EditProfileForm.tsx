'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type Profile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_private: boolean;
};

export default function EditProfileForm({ profile }: { profile: Profile }) {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setFullName(profile.full_name || '');
            setIsPrivate(profile.is_private);
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        setUploading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setUploading(false);
            return;
        }

        let newAvatarUrl = profile.avatar_url;

        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile);

            if (uploadError) {
                setMessage(`Error uploading avatar: ${uploadError.message}`);
                setUploading(false);
                return;
            }
            
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('avatars')
                .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);

            if (signedUrlError) {
                setMessage(`Error creating signed URL: ${signedUrlError.message}`);
                setUploading(false);
                return;
            }
            
            newAvatarUrl = signedUrlData.signedUrl;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                username,
                full_name: fullName,
                avatar_url: newAvatarUrl,
                is_private: isPrivate,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        setUploading(false);

        if (updateError) {
            setMessage(`Error updating profile: ${updateError.message}`);
        } else {
            setAvatarFile(null);
            setMessage('Profile updated successfully!');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleUpdateProfile} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <div>
                <label htmlFor="avatar">Avatar</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '10px 0' }}>
                    <img src={profile.avatar_url || 'https://placehold.co/60x60/eee/ccc?text=??'} alt="Current avatar" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                    <input
                        type="file"
                        id="avatar"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setAvatarFile(e.target.files[0]);
                            }
                        }}
                    />
                </div>
            </div>
            <div style={{ marginTop: '15px' }}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
            </div>
            <div>
                <label htmlFor="fullName">Full Name</label>
                <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
            </div>
            <div>
                <input
                    type="checkbox"
                    id="is_private"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <label htmlFor="is_private" style={{ marginLeft: '8px' }}>
                    Keep profile private
                </label>
            </div>
            <button type="submit" disabled={uploading} style={{ marginTop: '20px', padding: '10px 20px' }}>
                {uploading ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </form>
    );
}
