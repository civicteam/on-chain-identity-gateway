// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['dist/', 'docs/'],
    }
);
//   "root": true,
//   "parser": "@typescript-eslint/parser",
//   "parserOptions": {"project": ["./tsconfig.eslint.json"]},
//   "plugins": ["@typescript-eslint"],
//   "extends": [
//     "plugin:@typescript-eslint/recommended-requiring-type-checking",
//     "prettier"
//   ],
//   "rules": {
//     "@typescript-eslint/no-implicit-any-catch": "error"
//   },
//   "ignorePatterns": ["dist/", "docs/"]
// }]

