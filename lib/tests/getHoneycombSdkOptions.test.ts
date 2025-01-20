import type { Instrumentation, InstrumentationConfig } from "@opentelemetry/instrumentation";
import type { SpanProcessor } from "@opentelemetry/sdk-trace-web";
import { getHoneycombSdkOptions } from "../src/registerHoneycombInstrumentation.ts";

class DummyInstrumentation implements Instrumentation {
    instrumentationName: string = "dummy";
    instrumentationVersion: string = "1.0.0";

    disable(): void {
        throw new Error("Method not implemented.");
    }

    enable(): void {
        throw new Error("Method not implemented.");
    }

    setTracerProvider(): void {
        throw new Error("Method not implemented.");
    }

    setMeterProvider(): void {
        throw new Error("Method not implemented.");
    }

    setConfig(): void {
        throw new Error("Method not implemented.");
    }

    getConfig(): InstrumentationConfig {
        throw new Error("Method not implemented.");
    }
}

class DummySpanProcessor implements SpanProcessor {
    forceFlush(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    onStart(): void {
        throw new Error("Method not implemented.");
    }

    onEnd(): void {
        throw new Error("Method not implemented.");
    }

    shutdown(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeInstrumentationVersionsForSnapshot(options: any) {
    if (Array.isArray(options.instrumentations)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        options.instrumentations.forEach(x => {
            if (x["instrumentationVersion"]) {
                delete x["instrumentationVersion"];
            }

            if (x["version"]) {
                delete x["version"];
            }

            if (x["_logger"] && x["_logger"]["version"]) {
                delete x["_logger"]["version"];
            }

            if (x["_tracer"] && x["_tracer"]["version"]) {
                delete x["_tracer"]["version"];
            }
        });
    }

    return options;
}

test("do not throw when an api key is provided", () => {
    expect(() => getHoneycombSdkOptions("foo", ["/foo"], {
        apiKey: "123"
    })).not.toThrow();
});

test("do not throw when an endpoint is provided", () => {
    expect(() => getHoneycombSdkOptions("foo", ["/foo"], {
        endpoint: "https://www.google.com"
    })).not.toThrow();
});

test("throw when both the api key and endpoint options are not provided", () => {
    expect(() => getHoneycombSdkOptions("foo", ["/foo"])).toThrow();
});

test("when debug is true", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        debug: true,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when debug is false", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        debug: false,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("with custom instrumentations", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        instrumentations: [new DummyInstrumentation()],
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("with custom span processors", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        spanProcessors: [new DummySpanProcessor()],
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when fetch instrumentation is false", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        fetchInstrumentation: false,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when fetch instrumentation is a custom function", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        fetchInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when xml http instrumentation is false", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        xmlHttpRequestInstrumentation: false,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when xml http instrumentation is a custom function", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        xmlHttpRequestInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when document load instrumentation is false", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        documentLoadInstrumentation: false,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when document load instrumentation is a custom function", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        documentLoadInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when user interaction instrumentation is false", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        userInteractionInstrumentation: false,
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("when user interaction instrumentation is a custom function", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        userInteractionInstrumentation: defaultOptions => ({ ...defaultOptions, ignoreNetworkEvents: false }),
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("with a single transformer", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        transformers: [
            options => {
                options.serviceName = "toto";

                return options;
            }
        ],
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});

test("with multiple transformers", () => {
    const result = getHoneycombSdkOptions("foo", ["/foo"], {
        transformers: [
            options => {
                options.serviceName = "toto";

                return options;
            },
            options => {
                options.apiKey = "toto";

                return options;
            }
        ],
        apiKey: "123"
    });

    const cleanedResult = removeInstrumentationVersionsForSnapshot(result);

    expect(cleanedResult).toMatchSnapshot();
});
