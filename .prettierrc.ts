import { type Config } from 'prettier';

const config: Config = {
    printWidth: 100,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
    arrowParens: 'always',
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    importOrder: [
        '^vue$',
        '^@vue/(.*)$',
        '^vue-router',
        '^pinia',
        '^@element-plus/',
        '<THIRD_PARTY_MODULES>',
        '^@/(.*)$',
        '^[../]',
        '^[./]',
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
};

export default config;
