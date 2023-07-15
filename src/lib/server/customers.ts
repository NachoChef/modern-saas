import { stripeCustomerSchema } from "$lib/schemas";
import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase-admin";
import { stripe } from "./stripe";
import { NODE_ENV } from "$env/static/private";

export async function updateCustomerRecord(stripeCustomer: Stripe.Customer) {
	const customer = stripeCustomerSchema.parse(stripeCustomer);
	const { error } = await supabaseAdmin.from('billing_customers')
        .update(customer)
        .eq('id', customer.id);

	if (error) {
		throw error;
	}
}

export async function deleteCustomerRecord(stripeCustomer: Stripe.Customer) {
	const { error } = await supabaseAdmin
		.from('billing_customers')
		.delete()
		.eq('id', stripeCustomer.id);

	if (error) {
		throw error;
	}
}

export async function getCustomerRecord(user_id: string) {
    const { data: existing_customer} = await supabaseAdmin.from('billing_customers')
        .select('*')
        .eq('user_id', user_id)
        .limit(1)
        .single();

    if (existing_customer) {
        return existing_customer;
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (userError || !(userData && userData.user.email)) {
        throw userError || new Error('User not found');
    }

    const createParams: Stripe.CustomerCreateParams = {
        email: userData.user.email,
        metadata: {
            user_id: user_id
        },
    };

    // development check
    if (NODE_ENV && NODE_ENV === 'development') {
        // add test clock
        const testClock = await stripe.testHelpers.testClocks.create({
            frozen_time: Math.floor(Date.now() / 1000),
        })

        createParams.test_clock = testClock.id
    }

    const stripeCustomer = await stripe.customers.create(createParams);

    if (!stripeCustomer) {
        throw new Error('Error creating customer in Stripe');
    }

    const { error: newCustomerError, data: newCustomer } = await supabaseAdmin.from('billing_customers')
        .insert({
            id: stripeCustomer.id,
            user_id: userData.user.id,
            email: userData.user.email,
        })
        .select('*')
        .single();

    if (newCustomerError) {
        throw newCustomerError;
    }

    return newCustomer;
}
