import { fail, type Actions, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';
import { registerUserSchema } from '$lib/schemas';

export const load = (async (event) => {
    const session = await event.locals.getSession();
    if (session) {
        throw redirect(302, "/");
    }
    return {
        form: superValidate(registerUserSchema)
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, registerUserSchema);

        if (!form.valid) {
            return fail(400, {
                form
            })
        }

        if (form.data.password !== form.data.passwordConfirm) {
            return setError(form, "passwordConfirm", "Passwords do not match")
        }

        const { error: authError } = await event.locals.supabase.auth.signUp({
            email: form.data.email,
            password: form.data.password,
            options: {
                data: {
                    full_name: form.data.full_name ?? ""
                }
            }
        })

        if (authError) {
            return setError(form, null, 'Error signing up')
        }

        return form;
    }
}