<script lang="ts">
	import FormError from "./../../../lib/components/FormError.svelte";
	import { Button, Card } from "flowbite-svelte";
	import type { PageData } from "./$types";
	import { superForm } from "sveltekit-superforms/client";
	import { error } from "@sveltejs/kit";

	export let data: PageData;

	const { form, errors, enhance } = superForm(data.updateContactForm);
</script>

<div class="py-20">
	<div class="flex w-full flex-col items-center">
		<div class="max-w-2xl text-center">
			<h1 class="text-4xl font-semibold">Edit Contact</h1>
		</div>
		<Card class="mt-6 w-full" padding="xl" size="md">
			<form method="POST" action="?/updateContact" class="flex flex-col space-y-6" use:enhance>
				<label class="space-y-2" for="name">
					<span>Name</span>
					<input type="text" name="name" bind:value={$form.name} />
					<FormError error={$errors.name} />
				</label>
				<label class="space-y-2" for="email">
					<span>Email</span>
					<input type="email" name="email" bind:value={$form.email} />
					<FormError error={$errors.email} />
				</label>
				<label class="space-y-2" for="phone">
					<span>Phone</span>
					<input type="text" name="phone" bind:value={$form.phone} />
					<FormError error={$errors.phone} />
				</label>
				<label class="space-y-2" for="company">
					<span>Company</span>
					<input type="text" name="company" bind:value={$form.company} />
					<FormError error={$errors.company} />
				</label>
				<Button type="submit" class="w-full">Save Changes</Button>
			</form>
		</Card>
	</div>
</div>
