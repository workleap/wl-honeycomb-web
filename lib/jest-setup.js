// https://github.com/mswjs/msw/issues/1796
import { TextDecoder, TextEncoder } from "node:util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// https://github.com/jestjs/jest/issues/7007
import "whatwg-fetch";
