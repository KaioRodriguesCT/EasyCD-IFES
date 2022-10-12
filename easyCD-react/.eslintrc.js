module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  settings: {
    jest: {
      version: 26
    },
    react: {
      version: 'detect'
    },
    'import/resolver': {
      'babel-module': {
        // Needed to avoid IDE eslint warning until a better fix is found
        alias: {
          '@src': './src',
          '@shared': './src/shared',
          '@redux': './src/redux',
          '@components': './src/components',
          '@test': './test'
        }
      }
    }
  },
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'no-use-before-define': ['off', { functions: false }],
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ],
    'space-before-function-paren': ['error', 'always'],
    'template-curly-spacing': ['error', 'always'],
    curly: ['error', 'all'],
    'nonblock-statement-body-position': ['error', 'below'],
    'brace-style': ['error', '1tbs'],
    'no-param-reassign': ['off'],
    'no-plusplus': 0,
    'no-multi-spaces': [
      'error',
      {
        exceptions: {
          VariableDeclarator: true,
          ImportDeclaration: true
        }
      }
    ],
    // prevent lint errors if you don't use some function arguments
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-params': ['warn', 5],
    'max-nested-callbacks': ['warn', 4],
    'max-statements': ['warn', 20],
    'max-depth': ['warn', 4],
    'max-lines': [
      'off',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
        ignoreRegExpLiterals: true
      }
    ],
    // I'd like suggest setting it to 50 (eslint default) except to JSX files - vinicius.santos
    'max-lines-per-function': ['warn', 250],
    // I'd like suggest setting it to 80 (eslint default), it will looks better for who split the screen - vinicius.santos
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'max-statements-per-line': ['error'],
    'array-callback-return': 'error',
    'operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
    // I'd like suggest reducing it to 20 an refactor where necessary - vinicius.santos
    complexity: ['error', { max: 30 }],
    'one-var': ['error', 'never'],
    // it's causing errors on ~/scripts/test.js
    'jest/no-jest-import': ['off'],
    'jest/no-standalone-expect': ['off'],
    'jsx-a11y/anchor-is-valid': ['off'],
    'jsx-quotes': ['error', 'prefer-double'],
    quotes: ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'computed-property-spacing': ['error', 'always'],
    'prefer-const': ['error'],
    semi: ['error', 'always'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-undef': ['error'],
    'no-const-assign': ['error'],
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
    'no-trailing-spaces': ['error']
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { mocha: true }
    }
  ]
};
