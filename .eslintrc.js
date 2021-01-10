module.exports = {
  extends: ["react-app"],
  plugins: ["react-hooks","react"],
  parserOptions: {
      ecmaVersion: 6,
      sourceType: "module",
      ecmaFeatures: {
          jsx: true,
      },
  },
  rules: {
      semi: "warn",
  },
};
