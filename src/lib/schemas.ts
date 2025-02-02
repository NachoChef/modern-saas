import { z } from 'zod';
import { lookupKeys, productConfig, productNames } from './config';

export const registerUserSchema = z.object({
	// nullish => optional
	full_name: z.string().max(140, 'Name must be 140 characters or less').nullish(),
	email: z.string().email('Invalid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(64, 'Password must be 64 characters or less'),
	passwordConfirm: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(64, 'Password must be 64 characters or less')
});

export const profileSchema = registerUserSchema.pick({ full_name: true });
export type ProfileSchema = typeof profileSchema;

export const emailSchema = registerUserSchema.pick({ email: true });
export type EmailSchema = typeof emailSchema;

export const passwordSchema = registerUserSchema.pick({ password: true, passwordConfirm: true });
export type PasswordSchema = typeof passwordSchema;

export const createContactSchema = z
	.object({
		name: z.string().max(140, 'Name must be 140 characters or less').nullish(),
		email: z.string().email('Invalid email address').nullish(),
		company: z.string().max(140, 'Company must be 140 characters or less').nullish(),
		phone: z.string().max(64, 'Phone must be 140 characters or less').nullish()
	})
	// make sure at least one field is present
	.refine(({ name, email, company, phone }) => {
		return name || email || company || phone;
	}, 'At least one field must be filled out');

export type CreateContactSchema = typeof createContactSchema;

export const deleteContactSchema = z.object({
	id: z.string()
});

export type DeleteContactSchema = typeof deleteContactSchema;

export const stripeProductSchema = z.object({
	id: z.string(),
	name: z.string(),
	active: z.boolean(),
	description: z.string(),
	metadata: z.record(z.string())
});

export const stripeCustomerSchema = z.object({
  id: z.string(),
  email: z.string(),
  metadata: z.record(z.string())
});

export const stripeSubscriptionStatusEnum = z.enum([
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
]);

export const stripeSubscriptionItemsSchema = z.object({
  data: z.array(
    z.object({
      price: z.object({
        product: z.string()
      })
    })
  )
});

const unixTimestampToISOString = z.number().transform((n) => new Date(n * 1000).toISOString());

export const stripeSubscriptionSchema = z
  .object({
    id: z.string(),
    status: stripeSubscriptionStatusEnum,
    customer: z.string(),
    items: stripeSubscriptionItemsSchema,
    cancel_at_period_end: z.boolean(),
    created: unixTimestampToISOString,
    current_period_start: unixTimestampToISOString,
    current_period_end: unixTimestampToISOString,
    trial_start: unixTimestampToISOString.nullable(),
    trial_end: unixTimestampToISOString.nullable(),
    metadata: z.record(z.string()),
  })
  // transform to return a structure matching the db
  .transform((obj) => {
    const { items, customer, ...rest } = obj;
    const [{ price }] = items.data;
    return {
      ...rest,
      customer_id: customer,
      product_id: price.product,
    };
  });

const priceProductSchema = z.object({
  id: z.string(),
  name: z.enum([...productNames]),
  description: z.string()
}).transform((product) => {
  return {
    ...product,
    features: productConfig[product.name].features,
    call_to_action: productConfig[product.name].call_to_action
  }
})

const priceSchema = z.object({
  id: z.string(),
  lookup_key: z.enum([...lookupKeys]),
  unit_amount: z.number().transform((amt) => amt / 100),
  product: priceProductSchema
})

export const priceListSchema = z.array(priceSchema)

export const subscriptionTierSchema = z.enum([...productNames])
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>

export const subscriptionProductSchema = z.object({
  product: z.object({
    name: subscriptionTierSchema
  })
})