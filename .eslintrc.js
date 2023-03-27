module.exports = {
  extends: ["prettier", "eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["prettier"],
  env: {
    node: true,
    es6: true,
    commonjs: true,
  },
  plugins: [],
  globals: {},
  rules: {
    "no-console": "error",
    "prettier/prettier": "error",
    quotes: ["error", "single"],
  },
};
