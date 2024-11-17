import type { Config } from "jest";

const config: Config = {
    projects: [
        "<rootDir>/lib"
    ],
    testRegex: "/tests/*/.*\\.test\\.(ts|tsx)$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    verbose: true
};

export default config;
