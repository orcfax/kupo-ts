# Kupo-ts 

> A ts client of kupo

## Gen schema 

Grab the yaml from kupo
```sh
  pnpm run update-schema
```

Manually patch the following:

+ Delete superfluous `["properties"]` picked up by LSP
+ In paths, edit variables from kebab to snake case. For example: `datum-hash => datum_hash`
+ `spent` and `unspent` have type `boolean` not `string`
(see https://github.com/CardanoSolutions/kupo/issues/179)



## Troubleshooting 

+ openapi zod generator using zodios had `void()` type for all returns.
Switched back to openapi-typescript
+ node-ts seems to broke with node version > 20. 
Switched to `tsx`.
+ middleware needed to fix some disagreement between openapi-fetch and kupo
