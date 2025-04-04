import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import { getWebAutoInstrumentations, type InstrumentationConfigMap } from "@opentelemetry/auto-instrumentations-web";
import type { DocumentLoadInstrumentationConfig } from "@opentelemetry/instrumentation-document-load";
import type { FetchInstrumentationConfig } from "@opentelemetry/instrumentation-fetch";
import type { UserInteractionInstrumentationConfig } from "@opentelemetry/instrumentation-user-interaction";
import type { XMLHttpRequestInstrumentationConfig } from "@opentelemetry/instrumentation-xml-http-request";
import type { PropagateTraceHeaderCorsUrls, SpanProcessor } from "@opentelemetry/sdk-trace-web";
import { applyTransformers, type HoneycombSdkOptionsTransformer } from "./applyTransformers.ts";
import { globalAttributeSpanProcessor } from "./globalAttributes.ts";
import type { HoneycombSdkInstrumentations, HoneycombSdkOptions } from "./honeycombTypes.ts";
import { normalizeFetchInstrumentationSpanAttributes, normalizeXmlHttpInstrumentationSpanAttributes } from "./normalizeSpanAttributes.ts";
import { patchXmlHttpRequest } from "./patchXmlHttpRequest.ts";

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export type DefineFetchInstrumentationOptionsFunction = (defaultOptions: FetchInstrumentationConfig) => FetchInstrumentationConfig;

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export type DefineXmlHttpRequestInstrumentationOptionsFunction = (defaultOptions: XMLHttpRequestInstrumentationConfig) => XMLHttpRequestInstrumentationConfig;

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export type DefineDocumentLoadInstrumentationOptionsFunction = (defaultOptions: DocumentLoadInstrumentationConfig) => DocumentLoadInstrumentationConfig;

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export type DefineUserInteractionInstrumentationOptionsFunction = (defaultOptions: UserInteractionInstrumentationConfig) => UserInteractionInstrumentationConfig;

const defaultDefineFetchInstrumentationOptions: DefineFetchInstrumentationOptionsFunction = defaultOptions => {
    return defaultOptions;
};

const defaultDefineDocumentLoadInstrumentationOptions: DefineDocumentLoadInstrumentationOptionsFunction = defaultOptions => {
    return defaultOptions;
};

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export interface RegisterHoneycombInstrumentationOptions {
    proxy?: string;
    apiKey?: HoneycombSdkOptions["apiKey"];
    debug?: HoneycombSdkOptions["debug"];
    instrumentations?: HoneycombSdkInstrumentations;
    spanProcessors?: SpanProcessor[];
    fetchInstrumentation?: false | DefineFetchInstrumentationOptionsFunction;
    xmlHttpRequestInstrumentation?: false | DefineXmlHttpRequestInstrumentationOptionsFunction;
    documentLoadInstrumentation?: false | DefineDocumentLoadInstrumentationOptionsFunction;
    userInteractionInstrumentation?: false | DefineUserInteractionInstrumentationOptionsFunction;
    transformers?: HoneycombSdkOptionsTransformer[];
}

// Must specify the return type, otherwise we get a TS4058: Return type of exported function has or is using name X from external module "XYZ" but cannot be named.
export function getHoneycombSdkOptions(serviceName: NonNullable<HoneycombSdkOptions["serviceName"]>, apiServiceUrls: PropagateTraceHeaderCorsUrls, options: RegisterHoneycombInstrumentationOptions = {}): HoneycombSdkOptions {
    const {
        proxy,
        apiKey,
        debug,
        instrumentations = [],
        spanProcessors = [],
        fetchInstrumentation = defaultDefineFetchInstrumentationOptions,
        xmlHttpRequestInstrumentation = false,
        documentLoadInstrumentation = defaultDefineDocumentLoadInstrumentationOptions,
        userInteractionInstrumentation = false,
        transformers = []
    } = options;

    if (!proxy && !apiKey) {
        throw new Error("[honeycomb] Instrumentation must be initialized with either a \"proxy\" or \"apiKey\" option.");
    }

    const instrumentationOptions = {
        ignoreNetworkEvents: true,
        propagateTraceHeaderCorsUrls: apiServiceUrls
    };

    const autoInstrumentations: InstrumentationConfigMap = {};

    if (fetchInstrumentation) {
        autoInstrumentations["@opentelemetry/instrumentation-fetch"] = normalizeFetchInstrumentationSpanAttributes(fetchInstrumentation(instrumentationOptions));
    } else {
        autoInstrumentations["@opentelemetry/instrumentation-fetch"] = {
            enabled: false
        };
    }

    if (xmlHttpRequestInstrumentation) {
        autoInstrumentations["@opentelemetry/instrumentation-xml-http-request"] = normalizeXmlHttpInstrumentationSpanAttributes(xmlHttpRequestInstrumentation(instrumentationOptions));
    } else {
        autoInstrumentations["@opentelemetry/instrumentation-xml-http-request"] = {
            enabled: false
        };
    }

    if (documentLoadInstrumentation) {
        autoInstrumentations["@opentelemetry/instrumentation-document-load"] = documentLoadInstrumentation(instrumentationOptions);
    } else {
        autoInstrumentations["@opentelemetry/instrumentation-document-load"] = {
            enabled: false
        };
    }

    if (userInteractionInstrumentation) {
        autoInstrumentations["@opentelemetry/instrumentation-user-interaction"] = userInteractionInstrumentation({});
    } else {
        autoInstrumentations["@opentelemetry/instrumentation-user-interaction"] = {
            enabled: false
        };
    }

    const sdkOptions = {
        endpoint: proxy,
        apiKey,
        debug,
        localVisualizations: debug,
        serviceName,
        // Watch out, getWebAutoInstrumentations enables by default all the supported instrumentations.
        // It's important to disabled those that we don't want.
        instrumentations: [
            ...getWebAutoInstrumentations(autoInstrumentations),
            ...instrumentations
        ],
        // @ts-expect-error There is an on-going issue because @honeycombio/opentelemetry-web is super slow to update it's dependencies and it keeps causing types mismatch.
        spanProcessors: [globalAttributeSpanProcessor, ...spanProcessors]
    } satisfies HoneycombSdkOptions;

    // @ts-expect-error There is an on-going issue because @honeycombio/opentelemetry-web is super slow to update it's dependencies and it keeps causing types mismatch.
    return applyTransformers(sdkOptions, transformers, {
        debug: !!debug
    });
}

/**
 * @see https://workleap.github.io/wl-honeycomb-web
 */
export function registerHoneycombInstrumentation(serviceName: NonNullable<HoneycombSdkOptions["serviceName"]>, apiServiceUrls: PropagateTraceHeaderCorsUrls, options?: RegisterHoneycombInstrumentationOptions) {
    if (options?.proxy) {
        patchXmlHttpRequest(options?.proxy);
    }

    const sdkOptions = getHoneycombSdkOptions(serviceName, apiServiceUrls, options);
    const instance = new HoneycombWebSDK(sdkOptions);

    instance.start();
}
