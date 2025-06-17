import { test, vi } from "vitest";
import { _normalizeFetchInstrumentationSpanAttributes, normalizeFetchInstrumentationSpanAttributes } from "../src/normalizeSpanAttributes.ts";
import { DummySpan } from "./utils.ts";

test.concurrent("when no consumer applyCustomAttributesOnSpan hook is provided, call the normalize function", ({ expect }) => {
    const normalizeFetchSpanAttributesMock = vi.fn();

    const config = _normalizeFetchInstrumentationSpanAttributes({}, normalizeFetchSpanAttributesMock);

    const span = new DummySpan();
    const request: RequestInit = {};
    const response = new Response(JSON.stringify({ foo: "bar" }));

    config.applyCustomAttributesOnSpan!(span, request, response);

    expect(normalizeFetchSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test.concurrent("when a consumer applyCustomAttributesOnSpan hook is provided, call both the consumer hook and the normalize function", ({ expect }) => {
    const applyCustomAttributesOnSpanMock = vi.fn();
    const normalizeFetchSpanAttributesMock = vi.fn();

    const config = _normalizeFetchInstrumentationSpanAttributes({
        applyCustomAttributesOnSpan: applyCustomAttributesOnSpanMock
    }, normalizeFetchSpanAttributesMock);

    const span = new DummySpan();
    const request: RequestInit = {};
    const response = new Response(JSON.stringify({ foo: "bar" }));

    config.applyCustomAttributesOnSpan!(span, request, response);

    expect(applyCustomAttributesOnSpanMock).toHaveBeenCalledTimes(1);
    expect(normalizeFetchSpanAttributesMock).toHaveBeenCalledTimes(1);
});

test.concurrent("when the request argument is a RequestInit object literal, add attributes to the span", ({ expect }) => {
    const config = normalizeFetchInstrumentationSpanAttributes({});

    const span = new DummySpan();
    const request: RequestInit = { method: "GET" };
    const response = new Response(JSON.stringify({ foo: "bar" }), { status: 200 });

    config.applyCustomAttributesOnSpan!(span, request, response);

    expect(span.attributes.some(x => x.key === "http.request.method" && x.value === "GET")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "http.response.status_code" && x.value === 200)).toBeTruthy();
});

test.concurrent("when the request argument is a Request instance, add attributes to the span", ({ expect }) => {
    const config = normalizeFetchInstrumentationSpanAttributes({});

    const span = new DummySpan();
    const request = new Request("http://my-api.com", { method: "GET" });
    const response = new Response(JSON.stringify({ foo: "bar" }), { status: 200 });

    config.applyCustomAttributesOnSpan!(span, request, response);

    expect(span.attributes.some(x => x.key === "http.request.method" && x.value === "GET")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "http.response.status_code" && x.value === 200)).toBeTruthy();
    expect(span.attributes.some(x => x.key === "url.full" && x.value === "http://my-api.com/")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "url.scheme" && x.value === "http:")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "http.host" && x.value === "my-api.com")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "server.address" && x.value === "my-api.com")).toBeTruthy();
    expect(span.attributes.some(x => x.key === "server.port" && x.value === "")).toBeTruthy();
});

