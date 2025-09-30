module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "prettier",
  ],
  plugins: [
    "svelte",
    "@typescript-eslint",
    "prettier-plugin-svelte",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: ["*.svelte"],
      processor: "svelte/svelte",
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
