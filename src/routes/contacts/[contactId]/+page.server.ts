import { error, redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { createContactSchema } from '$lib/schemas';

export const load = (async (event) => {
    const session = await event.locals.getSession();
    if (!session) {
        throw redirect(302, "/login");
    }

    async function getContact(contact_id: string) {
        const { error: contactError, data: contact } = await event.locals.supabase.from("contacts")
            .select("*")
            .eq("id", contact_id)
            .limit(1)
            .maybeSingle(); // it may not exist

        if (contactError) {
            throw error(500, "Error retrieving contact, please try again later");
        }

        if (!contact) {
            throw error(404, "Contact not found");
        }

        return contact;
    }

    return {
        updateContactForm: superValidate(await getContact(event.params.contactId), createContactSchema),
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    updateContact: async (event) => {
        const session = await event.locals.getSession();
        if (!session) {
            throw error(401, "Unauthorized");
        }

        const updateContactForm = await superValidate(event, createContactSchema);

        if (!updateContactForm.valid) {
            return fail(400, {
                updateContactForm,
            });
        }

        const { error: updateContactError } = await event.locals.supabase.from("contacts")
            .update(updateContactForm.data)
            .eq("id", event.params.contactId);

        if (updateContactError) {
            return setError(updateContactForm, null, "Error updating contact, please try again")
        }

        return updateContactForm;
    }
}