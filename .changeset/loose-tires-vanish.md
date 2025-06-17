---
"@workleap/honeycomb": minor
---

- Added a session id span attribute (`app.session.id`) to correlate anonynous and authenticated traces.
- Normalized a few of open telemetry http span attributes. Related to https://github.com/workleap/wl-honeycomb-web/issues/37.
