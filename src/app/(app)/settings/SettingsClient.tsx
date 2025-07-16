'use client';

import { useState } from 'react';
import EditProfileForm from '../profile/EditProfileForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsClient({ profile }: { profile: any }) {
    const [confirmText, setConfirmText] = useState('');
    const supabase = createClientComponentClient();
    const router = useRouter();

    const handleDeleteAccount = async () => {
        // The user must type 'delete my account' to confirm.
        if (confirmText !== 'delete my account') {
            alert('Confirmation text does not match. Please type "delete my account" to confirm.');
            return;
        }

        // Call the database function we created.
        const { error } = await supabase.rpc('delete_user');

        if (error) {
            alert(`Error deleting account: ${error.message}`);
        } else {
            // On successful deletion, sign the user out and redirect to login.
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            {/* --- Edit Profile Section --- */}
            <section style={{ marginBottom: '40px' }}>
                <h2>Edit Profile</h2>
                <p style={{ color: '#666', marginBottom: '20px' }}>Update your username, name, and profile picture.</p>
                <EditProfileForm profile={profile} />
            </section>

            {/* --- Account Deletion Section --- */}
            <section style={{ border: '2px solid red', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ color: 'red' }}>Danger Zone</h2>
                <p>Deleting your account is permanent and cannot be undone. All of your posts, friendships, and data will be removed forever.</p>
                <div style={{ marginTop: '20px' }}>
                    <label htmlFor="confirmation" style={{ display: 'block', marginBottom: '5px' }}>
                        To confirm, please type "delete my account" below:
                    </label>
                    <input
                        id="confirmation"
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    <button
                        onClick={handleDeleteAccount}
                        disabled={confirmText !== 'delete my account'}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginTop: '10px',
                            backgroundColor: confirmText === 'delete my account' ? 'red' : '#ccc',
                            color: 'white',
                            border: 'none',
                            cursor: confirmText === 'delete my account' ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Delete My Account
                    </button>
                </div>
            </section>
        </div>
    );
}
