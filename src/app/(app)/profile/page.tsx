import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: posts } = await supabase
        .from('posts')
        .select('*, hugs(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    const { data: userHugs } = await supabase
        .from('hugs')
        .select('post_id')
        .eq('user_id', user.id);

    const userHuggedPostIds = new Set(userHugs?.map(hug => hug.post_id) || []);

    // We pass the user's own profile info to be used by the PostCard
    const postsWithProfile = posts?.map(post => ({
        ...post,
        profiles: {
            username: profile.username,
            avatar_url: profile.avatar_url
        }
    }));

    return <ProfileClient profile={profile} posts={postsWithProfile || []} userHuggedPostIds={userHuggedPostIds} />;
}
