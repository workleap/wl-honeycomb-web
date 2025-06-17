import type { Span } from "@opentelemetry/api";
import type { FetchCustomAttributeFunction, FetchInstrumentationConfig } from "@opentelemetry/instrumentation-fetch";
import type { XHRCustomAttributeFunction, XMLHttpRequestInstrumentationConfig } from "@opentelemetry/instrumentation-xml-http-request";
import { XmlHttpVerbProperty } from "./patchXmlHttpRequest.ts";

function setDeprecatedAttributesToUndefined(span: Span) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    span.setAttribute("http.method", undefined);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    span.setAttribute("http.status_code", undefined);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    span.setAttribute("http.url", undefined);
}

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
        setDeprecatedAttributesToUndefined(span);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        span.setAttribute("http.request.method", xhr[XmlHttpVerbProperty]);
        span.setAttribute("http.response.status_code", xhr.status);
        // The XMLHttpRequest API does not expose the request URL as a property.
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
        setDeprecatedAttributesToUndefined(span);

        span.setAttribute("http.request.method", request.method ?? "GET");
        span.setAttribute("http.response.status_code", result.status ?? 0);

        if (request instanceof Request) {
            const requestUrl = (request as Request).url;
            const url = new URL(requestUrl);

            span.setAttribute("url.full", requestUrl);
            span.setAttribute("url.scheme", url.protocol);
            span.setAttribute("http.host", `${url.hostname}${!url.port || url.port === "" ? "" : ":"}${url.port}`);
            span.setAttribute("server.address", url.hostname);
            span.setAttribute("server.port", url.port);

            const userAgent = (request as Request).headers?.get("User-Agent");

            if (userAgent) {
                span.setAttribute("http.user_agent", userAgent);
            }
        }
    });
}
