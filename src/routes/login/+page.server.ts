import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const loginUserSchema = z.object({ 
    email: z.string().email("Please enter an email address"),
    password: z.string().min(8, "Please enter a password")
 })

export const load = (async (event) => {
    const session = await event.locals.getSession();
    if (session) {
        throw redirect(302, "/");
    }
    return {
        form: superValidate(loginUserSchema)
    };
}) satisfies PageServerLoad;

export const actions: Actions = { 
    default: async (event) => {
        const form = await superValidate(event, loginUserSchema);

        if (!form.valid) {
            return fail(400, {
                form
            })
        }

        const { error: authError } = await event.locals.supabase.auth.signInWithPassword(form.data)

        if (authError) {
            if (authError instanceof AuthApiError && authError.status === 400) {
                setError(form, "email", "Invalid credentials");
                setError(form, "password", "Invalid credentials");
                
                return fail(400, {
                    form,
                });
            }
        }

        throw redirect(302, "/");
    }
 }