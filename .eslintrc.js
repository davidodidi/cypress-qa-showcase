module.exports = {
  plugins: ["cypress"],
  extends: ["plugin:cypress/recommended"],
  env: {
    "cypress/globals": true,
    browser: true,
    es2021: true,
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "cypress/no-unnecessary-waiting": "warn",
    "cypress/assertion-before-screenshot": "warn",
  },
};
