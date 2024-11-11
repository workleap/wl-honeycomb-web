import { registerHoneycombInstrumentation } from "@workleap/honeycomb";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

registerHoneycombInstrumentation("endpoints-sample", [/http:\/\/localhost:1234\.*/], {
    apiKey: "Twfeq1Fp3t6Xti0goZexZY",
    debug: true
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
