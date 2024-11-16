```bash
npx create-next-app next-sample-project
```

```text
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like your code inside a `src/` directory? ... Yes
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to use Turbopack for next dev? ... Yes
√ Would you like to customize the import alias (@/* by default)? ... Yes
```

```bash
npm i -D prettier # check / format
npm i -D eslint-config-google # google code style
npm i -D eslint-plugin-react # react rules
npm i -D eslint-config-prettier # fix eslint prettier conflict
npm i -D twMerge # fix class name to long
```

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "google",
    "plugin:react/jsx-runtime",
    "prettier"
  ],
  "rules": {
    "require-jsdoc": "off",
    "max-len": ["error", {"code": 100, "tabWidth": 2, "ignoreUrls": true}]
  }
}
```

```json
// package.json
"scripts": {
    "format": "prettier --write ."
}
```

```json
// vscode settings.json
"[typescript]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.rulers": [120],
  "editor.formatOnSave": true
},
"[typescriptreact]": {
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.rulers": [120],
  "editor.formatOnSave": true
}
```

```json
// .prettierc
{
  "singleQuote": true,
  "bracketSpacing": false
}
```
