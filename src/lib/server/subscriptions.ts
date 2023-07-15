import { stripeSubscriptionSchema } from "$lib/schemas";
import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase-admin";
import { stripe } from "./stripe";
import { getCustomerRecord } from "./customers";
import { ENV } from "./env";

export async function insertSubscriptionRecord(stripeSubscription: Stripe.Subscription) {
    const subscription = stripeSubscriptionSchema.parse(stripeSubscription);

    const { data: customer, error: customerError } = await supabaseAdmin.from('billing_customers')
        .select('user_id')
        .eq('id', subscription.customer_id)
        .limit(1)
        .single();

    if (customerError) {
        throw customerError;
    }

    const { error: subscriptionError } = await supabaseAdmin.from('billing_subscriptions')
    .insert({
        ...subscription,
        user_id: customer.user_id
    })

    if (subscriptionError) {
        throw subscriptionError;
    }
}

export async function updateSubscriptionRecord(stripeSubscription: Stripe.Subscription) {
    const subscription = stripeSubscriptionSchema.parse(stripeSubscription);

    const { error } = await supabaseAdmin.from('billing_subscriptions')
        .update(subscription)
        .eq('id', subscription.id);

    if (error) {
        throw error;
    }
}

export async function checkTrialEligibility(user_id: string, price_id: string): Promise<boolean> {
    type PriceWithProduct = Stripe.Price & { product: Stripe.Product };
    // don't care if they had a trial with a price, but we do care about a product
    const price = await stripe.prices.retrieve(price_id, {
        expand: ['product']
    }) as PriceWithProduct;

    if (!price) {
        throw new Error('Invalid price id');
    }

    const { data: subscription, error: subscriptionError } = await supabaseAdmin.from('billing_subscriptions')
        .select('id, product_id')
        .eq('user_id', user_id)
        .eq('product_id', price.product.id)
        .limit(1)
        .maybeSingle(); // could/could not exist

    if (subscriptionError) {
        throw subscriptionError;
    }

    if (!subscription) {
        return true;
    } else {
        return false;
    }
}

export async function createCheckoutSession(user_id: string, price_id: string) {
    
  const customer = await getCustomerRecord(user_id);
  const isEligibleForTrial = await checkTrialEligibility(user_id, price_id);

  // this is real messy, but it's from the course /shrug
  if (isEligibleForTrial) {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${ENV.PUBLIC_BASE_URL}/account`,
      cancel_url: `${ENV.PUBLIC_BASE_URL}/pricing`,
      subscription_data: {
        metadata: {
          user_id,
        },
        trial_period_days: 14,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      },
    //   payment_method_collection: "if_required", -> no payment method required for trials/etc
    });

    if (!checkoutSession.url) {
      throw new Error("Error creating checkout session");
    }
    return checkoutSession.url;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer: customer.id,
    line_items: [
      {
        price: price_id,
        quantity: 1,
      },
    ],
    success_url: `${ENV.PUBLIC_BASE_URL}/account`,
    cancel_url: `${ENV.PUBLIC_BASE_URL}/pricing`,
    subscription_data: {
      metadata: {
        user_id,
      },
    },
  });

  if (!checkoutSession.url) {
    throw new Error("Error creating checkout session");
  }
  return checkoutSession.url;
}