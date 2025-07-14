export default {
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-sh', 'prettier-plugin-tailwindcss'],
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 120,
  semi: false,
  singleQuote: true,
  overrides: [
    {
      files: ['*.sh', '*.bash'],
      options: {
        useTabs: true,
        keepComments: true,
      },
    },
  ],
}
