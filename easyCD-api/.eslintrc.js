module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-console': 0,
    'no-multi-assign': 0,
    'no-use-before-define': 0,
    'no-param-reassign': 0,
    'no-underscore-dangle': 0,
    'no-shadow': 0,
  },
};
