import type { Span } from "@opentelemetry/api";
import type { FetchInstrumentationConfig, FetchRequestHookFunction } from "@opentelemetry/instrumentation-fetch";

export type FetchRequestPipelineHookFunction = (span: Span, request: Request | RequestInit) => void | true;

export class FetchRequestPipeline {
    private hooks: FetchRequestPipelineHookFunction[] = [];

    registerHook(hook: FetchRequestPipelineHookFunction) {
        this.hooks.push(hook);
    }

    dispatchRequest(span: Span, request: Request | RequestInit) {
        for (let i = 0; i < this.hooks.length; i += 1) {
            const hook = this.hooks[i];

            const result = hook(span, request);

            // A hook can return "true" to stop the propagation to the subsequent hooks.
            if (result === true) {
                break;
            }
        }
    }

    clearHooks() {
        this.hooks = [];
    }

    get hookCount() {
        return this.hooks.length;
    }
}

const pipeline = new FetchRequestPipeline();

export function registerFetchRequestHook(hook: FetchRequestPipelineHookFunction) {
    if (hook) {
        pipeline.registerHook(hook);
    }
}

export function getFetchRequestHookCount() {
    return pipeline.hookCount;
}

const fetchRequestPipelineHook: FetchRequestHookFunction = (span: Span, request: Request | RequestInit) => {
    pipeline.dispatchRequest(span, request);
};

export function augmentFetchInstrumentationOptionsWithFetchRequestPipeline(options: FetchInstrumentationConfig) {
    // In case this function is executed twice by mistake.
    pipeline.clearHooks();

    if (options.requestHook) {
        pipeline.registerHook(options.requestHook);
    }

    options.requestHook = fetchRequestPipelineHook;

    return options;
}
