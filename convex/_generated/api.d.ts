/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as codementor from "../codementor.js";
import type * as execution from "../execution.js";
import type * as files from "../files.js";
import type * as friends from "../friends.js";
import type * as http from "../http.js";
import type * as internal_ from "../internal.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as rooms from "../rooms.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  codementor: typeof codementor;
  execution: typeof execution;
  files: typeof files;
  friends: typeof friends;
  http: typeof http;
  internal: typeof internal_;
  messages: typeof messages;
  profiles: typeof profiles;
  rooms: typeof rooms;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
