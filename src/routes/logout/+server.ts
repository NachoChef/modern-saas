import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    const { error: logoutError } = await event.locals.supabase.auth.signOut();

    if (logoutError) {
        throw error(500, "Error logging out, please try again :(");
    }

    return redirect(302, '/login');
};