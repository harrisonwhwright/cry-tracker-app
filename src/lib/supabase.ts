import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// This is a browser-only client
// It will be used in our components and pages
export const supabase = createPagesBrowserClient();