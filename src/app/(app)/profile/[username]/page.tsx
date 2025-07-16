import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UserProfileClient from './UserProfileClient';
import { notFound } from 'next/navigation';

export default async function UserProfilePage({ params }: { params: { username: string } }) {
    const supabase = createServerComponentClient({ cookies });

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
        redirect('/login');
    }

    const { data: ownProfile } = await supabase.from('profiles').select('username').eq('id', currentUser.id).single();
    if (ownProfile?.username === params.username) {
        redirect('/profile');
    }

    const { data: viewedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', params.username)
        .single();

    if (!viewedProfile) {
        notFound();
    }

    // --- THE FIX: Fetch the entire friendship object ---
    // This gives us the 'id' and 'requester_id' needed for the client component.
    const { data: friendship } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${viewedProfile.id}),and(requester_id.eq.${viewedProfile.id},addressee_id.eq.${currentUser.id})`)
        .single();

    let posts = [];
    // Only fetch posts if the friendship is accepted
    if (friendship?.status === 'accepted') {
        const { data: friendPosts } = await supabase
            .from('posts')
            .select('*, profiles ( username, avatar_url ), hugs ( count )')
            .eq('user_id', viewedProfile.id)
            .eq('is_public', true)
            .order('created_at', { ascending: false });
        posts = friendPosts || [];
    }

    const { data: userHugs } = await supabase
        .from('hugs')
        .select('post_id')
        .eq('user_id', currentUser.id);

    const userHuggedPostIds = new Set(userHugs?.map(hug => hug.post_id) || []);

    return (
        <UserProfileClient
            profile={viewedProfile}
            initialFriendship={friendship} // Pass the whole object
            posts={posts}
            userHuggedPostIds={userHuggedPostIds}
        />
    );
}
