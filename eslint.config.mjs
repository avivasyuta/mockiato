import { defineConfig } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: fixupConfigRules(compat.extends(
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "airbnb",
        "prettier",
    )),

    plugins: {
        react: fixupPluginRules(react),
        import: fixupPluginRules(_import),
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.webextensions,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        "import/resolver": {
            typescript: {
                alwaysTryTypes: false,
            },
        },
    },

    rules: {
        "object-curly-newline": 0,
        "max-len": ["error", 120],

        indent: ["error", 4, {
            SwitchCase: 1,
        }],

        "no-unused-vars": "off",
        "no-shadow": "off",
        "arrow-body-style": 0,
        "import/prefer-default-export": "off",

        "import/extensions": ["error", {
            ts: "never",
            tsx: "never",
            json: "always",
        }],

        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-shadow": ["error"],
        "react/require-default-props": "off",
        "react/react-in-jsx-scope": "off",
        "react/function-component-definition": "off",

        "react/jsx-filename-extension": [1, {
            extensions: [".tsx"],
        }],

        "react/jsx-props-no-spreading": "off",
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "react/jsx-one-expression-per-line": "off",
    },
}]);