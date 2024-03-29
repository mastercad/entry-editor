module.exports = {
    parser: "babel-eslint",
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'standard'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        ecmaFeatures: {
            arrowFunctions: true,
            modules: true
        }
    },
    rules: {}
}