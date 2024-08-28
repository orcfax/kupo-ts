import createClient, { Middleware } from "openapi-fetch";
import { paths } from "./schema.ts";
import pLimit from "p-limit";
import {
  DatumHash,
  DatumOrNull,
  GetMatchesQuery,
  KupoClient,
  Match,
  Matches,
  MatchResolved,
  Pattern,
  Patterns,
  Point,
  Points,
  PutPatternsContent,
  Result,
  ScriptHash,
  ScriptOrNull,
} from "./types.ts";

function error(msg: string | undefined) {
  return new Error(msg || "");
}

function dataOrErr<T>(res: { data?: T; error?: { hint?: string } }): Result<T> {
  return res.data || error(res.error?.hint);
}

export const logUrls: Middleware = {
  async onRequest({ request, options, schemaPath, params }) {
    request.headers.set("Accept", "application/json");
    let url = request.url;
    url = url
      .replace("?unspent=true", "?unspent")
      .replace("?spent=true", "?spent");
    const nReq = new Request(url, request);
    return nReq;
  },
  async onResponse({ request, response, options }) {
    return response;
  },
};

export const defaultMiddleware: Middleware = {
  async onRequest({ request, options }) {
    request.headers.set("Accept", "application/json");
    let url = request.url;
    url = url
      .replace("?unspent=true", "?unspent")
      .replace("?spent=true", "?spent");
    const nReq = new Request(url, request);
    return nReq;
  },
  async onResponse({ request, response, options }) {
    return response;
  },
};

export class Kupo {
  baseUrl: string;
  _: KupoClient;

  constructor(baseUrl: string | URL, middleware?: Middleware) {
    this.baseUrl = baseUrl.toString();
    this._ = createClient<paths>({ baseUrl: baseUrl.toString() });
    if (middleware) this._.use(middleware);
  }

  // async getHealth() { //: Promise<Result<Health>> {
  //   return await this._.GET(
  //     "/health",
  //     { params : {}}
  //   ).then(dataOrErr) ;
  // }

  async getMatches(
    pattern: Pattern,
    query?: GetMatchesQuery,
  ): Promise<Result<Matches>> {
    return await this._.GET("/matches/{pattern}", {
      params: { query, path: { pattern } },
    }).then(dataOrErr);
  }

  async getAllMatches(query?: GetMatchesQuery): Promise<Result<Matches>> {
    return await this._.GET("/matches", { params: { query } }).then(dataOrErr);
  }

  async getDatums(datumHash: DatumHash): Promise<Result<DatumOrNull>> {
    return await this._.GET("/datums/{datum_hash}", {
      params: { path: { datum_hash: datumHash } },
    }).then(dataOrErr);
  }

  async getScripts(scriptHash: ScriptHash): Promise<Result<ScriptOrNull>> {
    return await this._.GET("/scripts/{script_hash}", {
      params: { path: { script_hash: scriptHash } },
    }).then(dataOrErr);
  }

  async resolveMatch(m: Match): Promise<MatchResolved> {
    let i = { ...m } as any;
    delete i["script_hash"];
    delete i["datum_hash"];
    const script = m.script_hash
      ? await this.getScripts(m.script_hash)
      : undefined;
    const datum = m.datum_hash ? await this.getDatums(m.datum_hash) : undefined;
    return { ...i, ...(script && { script }), ...(datum && { datum }) };
  }

  async resolveMatches(
    ms: Match[],
    concurrency = 100,
  ): Promise<MatchResolved[]> {
    const limit = pLimit(concurrency);
    const mrs = ms.map((m) => limit(() => this.resolveMatch(m)));
    return await Promise.all(mrs);
  }

  async getPatterns(): Promise<Result<Patterns>> {
    return await this._.GET("/patterns").then(dataOrErr);
  }

  async putPatterns(body: PutPatternsContent): Promise<Result<Patterns>> {
    return await this._.PUT("/patterns", { body }).then(dataOrErr);
  }

  async putPatternsFromLatest(patterns: Patterns): Promise<Result<Patterns>> {
    return await this.getLatest().then((res) => {
      if (res instanceof Error) return res;
      return this.putPatterns({
        patterns,
        rollback_to: res,
        limit: "within_safe_zone",
      });
    });
  }

  async getCheckpoints(): Promise<Result<Points>> {
    return await this._.GET("/checkpoints").then(dataOrErr);
  }

  async getCheckpointBySlot(slotNo: number): Promise<Result<Point | null>> {
    return await this._.GET("/checkpoints/{slot_no}", {
      params: { path: { slot_no: slotNo } },
    }).then(dataOrErr);
  }

  async getLatest(): Promise<Result<Point>> {
    return this.getCheckpoints().then((res) => {
      if (res instanceof Error) return res;
      return res[0];
    });
  }
}
