---
"@workleap/honeycomb": major
---

Request hook for the fetch instrumentation can now be registered dynamically rather than only being specified at initialization. This feature is not documented because it's for library integration code only but since it does define by default a request hook with the fetch instrumentation, it seems to be worth of being a major in case it breaks some code.
