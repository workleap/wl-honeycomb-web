import type { Span, SpanAttributeValue, SpanContext } from "@opentelemetry/api";
import { _normalizeXmlHttpInstrumentationSpanAttributes, normalizeXmlHttpInstrumentationSpanAttributes } from "../src/normalizeSpanAttributes.ts";

class DummySpan implements Span {
    attributes: { key: string; value: unknown }[] = [];

    spanContext(): SpanContext {
        throw new Error("Method not implemented.");
    }

    setAttribute(key: string, value: SpanAttributeValue): this {
        this.attributes.push({ key, value });

        return this;
    }

    setAttributes(): this {
        throw new Error("Method not implemented.");
    }

    addEvent(): this {
        throw new Error("Method not implemented.");
    }

    addLink(): this {
        throw new Error("Method not implemented.");
    }

    addLinks(): this {
        throw new Error("Method not implemented.");
    }

    setStatus(): this {
        throw new Error("Method not implemented.");
    }

    updateName(): this {
        throw new Error("Method not implemented.");
    }

    end(): void {
        throw new Error("Method not implemented.");
    }

    isRecording(): boolean {
        throw new Error("Method not implemented.");
    }

    recordException(): void {
        throw new Error("Method not implemented.");
    }
}

function createXmlHttpRequest(options: { status?: number } = {}) {
    const {
        status = 0
    } = options;

    const request: XMLHttpRequest = {
        onreadystatechange: null,
        readyState: 0,
        response: undefined,
        responseText: "",
        responseType: "",
        responseURL: "",
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

    return request;
}

test("when no consumer applyCustomAttributesOnSpan hook is provided, call the normalize function", () => {
    const normalizeXmlHttpSpanAttributesMock = jest.fn();

    const config = _normalizeXmlHttpInstrumentationSpanAttributes({}, normalizeXmlHttpSpanAttributesMock);

    const span = new DummySpan();
    const request = createXmlHttpRequest();

    config.applyCustomAttributesOnSpan!(span, request);

    expect(normalizeXmlHttpSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test("when a consumer applyCustomAttributesOnSpan hook is provided, call both the consumer hook and the normalize function", () => {
    const applyCustomAttributesOnSpanMock = jest.fn();
    const normalizeXmlHttpSpanAttributesMock = jest.fn();

    const config = _normalizeXmlHttpInstrumentationSpanAttributes({
        applyCustomAttributesOnSpan: applyCustomAttributesOnSpanMock
    }, normalizeXmlHttpSpanAttributesMock);

    const span = new DummySpan();
    const request = createXmlHttpRequest();

    config.applyCustomAttributesOnSpan!(span, request);

    expect(applyCustomAttributesOnSpanMock).toHaveBeenCalledTimes(1);
    expect(normalizeXmlHttpSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test("add all attributes to the span", () => {
    const config = normalizeXmlHttpInstrumentationSpanAttributes({});

    const span = new DummySpan();
    const request = createXmlHttpRequest({ status: 200 });

    config.applyCustomAttributesOnSpan!(span, request);

    // expect(span.attributes.some(x => x.key === "http.request.method" && x.value === "GET")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "http.response.status_code" && x.value === 200)).toBeTruthy();
    expect(span.attributes.some(x => x.key === "url.full")).toBeTruthy();
});
