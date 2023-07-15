import { tierPolicy } from "$lib/config";
import type { SubscriptionTier } from "$lib/schemas";

export function hasReachedMaxContacts(tier: SubscriptionTier, contacts_count: number) {
    return contacts_count >= tierPolicy['maxContacts'][tier];
}

export function getUpgradeUrl(tier: SubscriptionTier) {
    return tier === 'Free' ? '/pricing' : '/account/billing';
}