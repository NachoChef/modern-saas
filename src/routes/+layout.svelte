<script lang="ts">
	import "../app.css";
	import { page } from "$app/stores";
	import {
		Navbar,
		NavBrand,
		NavHamburger,
		NavUl,
		NavLi,
		Button,
		Dropdown,
		Chevron,
		DropdownItem
	} from "flowbite-svelte";
	import { invalidate } from "$app/navigation";
	import type { LayoutData } from "./$types";
	import { onMount } from "svelte";

	const navigation = [
		{ label: "Home", href: "/" },
		{ label: "Pricing", href: "/pricing" },
		{ label: "Contacts", href: "/contacts" }
	];

	export let data: LayoutData;

	// pull session/supabase from data
	$: ({ session, supabase } = data);

	onMount(() => {
		// subscribe to supabase auth state change
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			// if not the same then session isn't the same, invalidate the supabase:auth id
			// depending on supabase:auth id will trigger re-retrieving the session?
			if (_session?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		// cleanup
		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>Contactly</title>
</svelte:head>

<div class="flex h-full flex-col">
	<Navbar let:hidden let:toggle>
		<NavBrand href="/">
			<img src="/images/logo.png" class="mr-3 h-6 sm:h-9" alt="Contactly Logo" />
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
				Contactly
			</span>
		</NavBrand>
		{#if session}
			<Button color="light"><Chevron>Account</Chevron></Button>
			<Dropdown>
				<div slot="header" class="px-4 py-2">
					<span class="block truncate text-sm font-medium"> {session.user.email} </span>
				</div>
				<DropdownItem href="/account">Settings</DropdownItem>
				<DropdownItem href="/account/billing">Billing</DropdownItem>
				<form action="/logout" method="POST">
					<DropdownItem type="submit" slot="footer">Sign out</DropdownItem>
				</form>
			</Dropdown>
		{:else}
			<div class="flex md:order-2">
				<div class="flex items-center gap-2">
					<Button href="/login" size="sm">Login</Button>
					<Button href="/register" size="sm" color="alternative">Register</Button>
				</div>
			</div>
		{/if}
		<NavHamburger on:click={toggle} />
		<NavUl {hidden}>
			{#each navigation as nav}
				<NavLi href={nav.href} active={$page.url.pathname === nav.href}>{nav.label}</NavLi>
			{/each}
		</NavUl>
	</Navbar>
	<div class="w-full flex-grow px-2 sm:px-4">
		<div class="container mx-auto">
			<slot />
		</div>
	</div>
</div>
