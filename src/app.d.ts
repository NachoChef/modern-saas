import type { Database } from "$lib/supabase-types";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

declare global {
	namespace App {
		/// <reference types-"stripe-event-types" />
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
		}
		interface PageData {
			session: Session | null;
		}
		// interface Platform {}
	}
}

export {};
