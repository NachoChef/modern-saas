import { supabaseAdmin } from "./supabase-admin";

export async function getContactsCount(user_id: string): Promise<number> {
    const { error, count } = await supabaseAdmin.from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user_id).single();

    if (error) {
        throw error;
    }

    if (!count) {
        return 0;
    } else {
        return count;
    }
}