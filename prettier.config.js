export default {
	printWidth: 100,
	singleQuote: true,
	tabWidth: 3,
	useTabs: true,

	plugins: ['@trivago/prettier-plugin-sort-imports'],
	importOrder: ['<THIRD_PARTY_MODULES>', '^@/', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,

	overrides: [
		{
			files: '**/package.json',
			options: {
				useTabs: false,
				tabWidth: 2,
				singleQuote: false,
			},
		},
		{
			files: '**/*.y{,a}ml',
			options: {
				singleQuote: false,
				tabWidth: 2,
				useTabs: false,
			},
		},
	],
};
