import { ENV } from "$lib/server/env";
import { createSupabaseServerClient } from "@supabase/auth-helpers-sveltekit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        supabaseUrl: ENV.PUBLIC_SUPABASE_URL,
        supabaseKey: ENV.PUBLIC_SUPABASE_ANON_KEY,
        event
    });

    event.locals.getSession = async () => {
        const { 
            data: { session }
        } =  await event.locals.supabase.auth.getSession();
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range';
        }
    })
}