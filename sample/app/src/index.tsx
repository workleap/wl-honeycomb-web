import { registerHoneycombInstrumentation, setGlobalSpanAttributes } from "@workleap/honeycomb";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HoneycombApiKey } from "../../apiKeys.js";
import { App } from "./App.tsx";

registerHoneycombInstrumentation("honeycomb-lib-sample", [/http:\/\/localhost:1234\.*/], {
    apiKey: HoneycombApiKey,
    debug: true
});

// Update telemetry global attributes.
setGlobalSpanAttributes({
    "app.user_id": "123",
    "app.user_prefered_language": "fr-CA"
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
