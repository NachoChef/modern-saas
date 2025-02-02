import { freePrice, lookupKeys } from '$lib/config';
import { priceListSchema } from '$lib/schemas';
import { stripe } from '$lib/server/stripe';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const intervalSchema = z.enum(["month", "year"]).catch("month");

export const load = (async (event) => {
    const interval = intervalSchema.parse(event.url.searchParams.get("interval"));
    
    const stripePrices = await stripe.prices.list({
        expand: ["data.product"],
        recurring: { interval },
        lookup_keys: [...lookupKeys]
    })

    const prices = priceListSchema.parse(stripePrices.data).sort((a, b) => a.unit_amount - b.unit_amount);


    return {
        prices: [freePrice, ...prices],
        interval
    };
}) satisfies PageServerLoad;