import type { FetchCustomAttributeFunction, FetchInstrumentationConfig } from "@opentelemetry/instrumentation-fetch";
import type { XHRCustomAttributeFunction, XMLHttpRequestInstrumentationConfig } from "@opentelemetry/instrumentation-xml-http-request";

export function _normalizeXmlHttpInstrumentationSpanAttributes(config: XMLHttpRequestInstrumentationConfig, normalizeFunction: XHRCustomAttributeFunction) {
    if (config.applyCustomAttributesOnSpan) {
        const baseFunction = config.applyCustomAttributesOnSpan;

        config.applyCustomAttributesOnSpan = (...args) => {
            baseFunction(...args);
            normalizeFunction(...args);
        };
    } else {
        config.applyCustomAttributesOnSpan = normalizeFunction;
    }

    return config;
}

export function normalizeXmlHttpInstrumentationSpanAttributes(config: XMLHttpRequestInstrumentationConfig) {
    return _normalizeXmlHttpInstrumentationSpanAttributes(config, (span, xhr) => {
        span.setAttribute("http.request.method", xhr["_method"]);
        span.setAttribute("http.response.status_code", xhr.status);
        span.setAttribute("url.full", xhr.responseURL);
    });
}

export function _normalizeFetchInstrumentationSpanAttributes(config: FetchInstrumentationConfig, normalizeFunction: FetchCustomAttributeFunction) {
    if (config.applyCustomAttributesOnSpan) {
        const baseFunction = config.applyCustomAttributesOnSpan;

        config.applyCustomAttributesOnSpan = (...args) => {
            baseFunction(...args);
            normalizeFunction(...args);
        };
    } else {
        config.applyCustomAttributesOnSpan = normalizeFunction;
    }

    return config;
}

export function normalizeFetchInstrumentationSpanAttributes(config: FetchInstrumentationConfig) {
    return _normalizeFetchInstrumentationSpanAttributes(config, (span, request, result) => {
        span.setAttribute("http.request.method", request.method ?? "GET");
        span.setAttribute("http.response.status_code", result.status ?? 0);
        span.setAttribute("url.full", (request as Request).url);
    });
}
