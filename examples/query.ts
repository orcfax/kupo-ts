import { Kupo } from "../src/index";

async function main() {
  const baseUrl = process.env.KUPO_URL;
  if (!baseUrl) throw new Error("expect envvar KUPO_URL to be set");
  const api = new Kupo(baseUrl);
  return await api.getAllMatches({ unspent: null }).then((res) => {
    if (res instanceof Error) throw res;
    return api.resolveMatches(res);
  });
}

main().then((res) => console.log(res));
