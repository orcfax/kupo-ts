import { ClientMethod, Middleware } from "openapi-fetch";
import { components, paths } from "./schema";

export type MediaType = `${string}/${string}`;

export type Client<Paths extends {}, Media extends MediaType = MediaType> = {
  /** Call a GET endpoint */
  GET: ClientMethod<Paths, "get", Media>;
  /** Call a PUT endpoint */
  PUT: ClientMethod<Paths, "put", Media>;
  /** Call a POST endpoint */
  POST: ClientMethod<Paths, "post", Media>;
  /** Call a DELETE endpoint */
  DELETE: ClientMethod<Paths, "delete", Media>;
  /** Call a OPTIONS endpoint */
  OPTIONS: ClientMethod<Paths, "options", Media>;
  /** Call a HEAD endpoint */
  HEAD: ClientMethod<Paths, "head", Media>;
  /** Call a PATCH endpoint */
  PATCH: ClientMethod<Paths, "patch", Media>;
  /** Call a TRACE endpoint */
  TRACE: ClientMethod<Paths, "trace", Media>;
  /** Register middleware */
  use(...middleware: Middleware[]): void;
  /** Unregister middleware */
  eject(...middleware: Middleware[]): void;
};

export type KupoClient = Client<paths>;

export type Result<T> = Error | T;

// FIXME : Can't make the health ep the right type
// type Health = components["schemas"]["Health"]
export type Health =
  paths["/health"]["get"]["responses"]["200"]["content"]["application/json;charset=utf-8"];

export type Pattern = components["schemas"]["Pattern"];
export type Patterns = Pattern[];
export type PutPatternsContent = {
  patterns: Patterns;
  rollback_to: components["schemas"]["ForcedRollback"]["rollback_to"];
  limit?: components["schemas"]["ForcedRollback"]["limit"];
};

export type GetMatchesQuery = paths["/matches"]["get"]["parameters"]["query"];
export type Match = components["schemas"]["Match"];
export type Matches = Match[];

export type DatumHash =
  paths["/datums/{datum_hash}"]["get"]["parameters"]["path"]["datum_hash"];
export type Datum = components["schemas"]["Datum"];
export type DatumOrNull = Datum | null;
export type ScriptHash =
  paths["/scripts/{script_hash}"]["get"]["parameters"]["path"]["script_hash"];
export type Script = components["schemas"]["Script"];
export type ScriptOrNull = Script | null;

export type MatchWithoutHash = Omit<Match, "datum_hash" | "script_hash">;
export type MatchResolved = MatchWithoutHash & {
  script?: ScriptOrNull;
  datum?: DatumOrNull;
};

export type Point = components["schemas"]["Point"];
export type Points = Point[];
