module.exports = {
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": [require("prettier-plugin-svelte"), require("prettier-plugin-tailwindcss")],
	"pluginSearchDirs": false,
	"overrides": [
		{
			"files": "*.svelte",
			"options": {
				"parser": "svelte",
				"svelteIndentScriptAndStyle": true,
				"svelteStrictMode": false,
				"svelteSortOrder": "scripts-markup-styles-options"
			}
		}
	],
	"bracketSameLine": true
}
