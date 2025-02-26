import type { Span } from "@opentelemetry/api";
import type { FetchCustomAttributeFunction, FetchInstrumentationConfig } from "@opentelemetry/instrumentation-fetch";
import type { XHRCustomAttributeFunction, XMLHttpRequestInstrumentationConfig } from "@opentelemetry/instrumentation-xml-http-request";

const PatchXMLSpanProcessor: XHRCustomAttributeFunction = (span: Span, xhr: XMLHttpRequest) => {
    span.setAttribute("http.request.method", xhr.responseURL);
    span.setAttribute("http.response.status_code", xhr.status);
    span.setAttribute("url.full", xhr.responseURL);
};

export function patchXMLHttpInstrumentationConfig(conf: XMLHttpRequestInstrumentationConfig) : XMLHttpRequestInstrumentationConfig {
    if (conf.applyCustomAttributesOnSpan) {
        const old = conf.applyCustomAttributesOnSpan;
        conf.applyCustomAttributesOnSpan = (span, xhr) => {
            old(span, xhr);
            PatchXMLSpanProcessor(span, xhr);
        };
    } else {
        conf.applyCustomAttributesOnSpan = PatchXMLSpanProcessor;
    }

    return conf;
}

const PatchFetchSpanProcessor: FetchCustomAttributeFunction = (span, request, result) => {
    span.setAttribute("http.request.method", request.method ?? "GET");
    span.setAttribute("http.response.status_code", result.status ?? 0);
    span.setAttribute("url.full", (request as Request).url);
};

export function patchFetchInstrumentationConfig(conf: FetchInstrumentationConfig) : FetchInstrumentationConfig {
    if (conf.applyCustomAttributesOnSpan) {
        const old = conf.applyCustomAttributesOnSpan;
        conf.applyCustomAttributesOnSpan = (span, request, response) => {
            old(span, request, response);
            PatchFetchSpanProcessor(span, request, response);
        };
    } else {
        conf.applyCustomAttributesOnSpan = PatchFetchSpanProcessor;
    }

    return conf;
}
