<script lang="ts">
	export let error: string[] | undefined;
</script>

{#if error}
	<span class="block text-red-600 dark:text-red-500">{error}</span>
{/if}
