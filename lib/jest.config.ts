import type { Config } from "jest";
import { swcConfig } from "./swc.jest.ts";

const config: Config = {
    // JSDOM is required for OTel instrumentation like "@opentelemetry/instrumentation-document-load".
    testEnvironment: "jsdom",
    testRegex: "/tests/*/.*\\.test\\.ts$",
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    transform: {
        "^.+\\.(js|ts)$": ["@swc/jest", swcConfig as Record<string, unknown>]
    },
    setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
    cacheDirectory: "./node_modules/.cache/jest",
    verbose: true
};

export default config;
