import { registerHoneycombInstrumentation } from "@workleap/honeycomb";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

registerHoneycombInstrumentation("honeycomb-lib-sample", [/http:\/\/localhost:1234\.*/], {
    apiKey: "",
    debug: true
});

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
