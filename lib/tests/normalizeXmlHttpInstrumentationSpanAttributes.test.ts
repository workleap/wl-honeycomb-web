import { test, vi } from "vitest";
import { _normalizeXmlHttpInstrumentationSpanAttributes, normalizeXmlHttpInstrumentationSpanAttributes } from "../src/normalizeSpanAttributes.ts";
import { XmlHttpVerbProperty } from "../src/patchXmlHttpRequest.ts";
import { DummySpan } from "./utils.ts";

function createXmlHttpRequest(options: { verb?: string; status?: number; responseURL?: string } = {}) {
    const {
        status = 0,
        responseURL = "",
        verb = "GET"
    } = options;

    const request: XMLHttpRequest = {
        onreadystatechange: null,
        readyState: 0,
        response: undefined,
        responseText: "",
        responseType: "",
        responseURL,
        responseXML: null,
        status,
        statusText: "",
        timeout: 0,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        upload: undefined,
        withCredentials: false,
        abort: function (): void {
            throw new Error("Function not implemented.");
        },
        getAllResponseHeaders: function (): string {
            throw new Error("Function not implemented.");
        },
        getResponseHeader: function (): string | null {
            throw new Error("Function not implemented.");
        },
        open: function (): void {
            throw new Error("Function not implemented.");
        },
        overrideMimeType: function (): void {
            throw new Error("Function not implemented.");
        },
        send: function (): void {
            throw new Error("Function not implemented.");
        },
        setRequestHeader: function (): void {
            throw new Error("Function not implemented.");
        },
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4,
        addEventListener: () => {
            throw new Error("Function not implemented.");
        },
        removeEventListener: () => {
            throw new Error("Function not implemented.");
        },
        onabort: null,
        onerror: null,
        onload: null,
        onloadend: null,
        onloadstart: null,
        onprogress: null,
        ontimeout: null,
        dispatchEvent: function (): boolean {
            throw new Error("Function not implemented.");
        }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    request[XmlHttpVerbProperty] = verb;

    return request;
}

test.concurrent("when no consumer applyCustomAttributesOnSpan hook is provided, call the normalize function", ({ expect }) => {
    const normalizeXmlHttpSpanAttributesMock = vi.fn();

    const config = _normalizeXmlHttpInstrumentationSpanAttributes({}, normalizeXmlHttpSpanAttributesMock);

    const span = new DummySpan();
    const request = createXmlHttpRequest();

    config.applyCustomAttributesOnSpan!(span, request);

    expect(normalizeXmlHttpSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test.concurrent("when a consumer applyCustomAttributesOnSpan hook is provided, call both the consumer hook and the normalize function", ({ expect }) => {
    const applyCustomAttributesOnSpanMock = vi.fn();
    const normalizeXmlHttpSpanAttributesMock = vi.fn();

    const config = _normalizeXmlHttpInstrumentationSpanAttributes({
        applyCustomAttributesOnSpan: applyCustomAttributesOnSpanMock
    }, normalizeXmlHttpSpanAttributesMock);

    const span = new DummySpan();
    const request = createXmlHttpRequest();

    config.applyCustomAttributesOnSpan!(span, request);

    expect(applyCustomAttributesOnSpanMock).toHaveBeenCalledTimes(1);
    expect(normalizeXmlHttpSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test.concurrent("add all attributes to the span", ({ expect }) => {
    const config = normalizeXmlHttpInstrumentationSpanAttributes({});
    const responseURL = "http://example.com";
    const span = new DummySpan();
    const request = createXmlHttpRequest({ verb: "GET", status: 200, responseURL });

    config.applyCustomAttributesOnSpan!(span, request);

    expect(span.attributes.some(x => x.key === "http.request.method" && x.value === "GET")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "http.response.status_code" && x.value === 200)).toBeTruthy();
    expect(span.attributes.some(x => x.key === "url.full" && x.value === responseURL)).toBeTruthy();
});
