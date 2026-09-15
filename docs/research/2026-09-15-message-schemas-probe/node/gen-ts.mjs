// json2ts через API с собственным резолвером https://ratedtattoo.ru/schemas/ -> локальное зеркало
import { compile } from "json-schema-to-typescript";
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const mirror = join(root, "gen/http-root");
if (!existsSync(join(mirror, "ratedtattoo.ru/schemas"))) cpSync(join(root, "schemas"), join(mirror, "ratedtattoo.ru/schemas"), { recursive: true });
mkdirSync(join(root, "gen/ts"), { recursive: true });
const resolver = {
  order: 1,
  canRead: /^https:\/\/ratedtattoo\.ru\//,
  read: (file) => readFileSync(join(mirror, file.url.replace(/^https:\/\//, "").split("#")[0]), "utf8"),
};
const targets = [
  ["messages/v1/submit-job.json", "SubmitJobV1"],
  ["messages/v1/erase-generation.json", "EraseGenerationV1"],
  ["messages/v1/result.json", "ResultV1"],
];
for (const [rel, name] of targets) {
  const schema = JSON.parse(readFileSync(join(mirror, "ratedtattoo.ru/schemas", rel), "utf8"));
  try {
    const ts = await compile(schema, name, { cwd: dirname(join(mirror, "ratedtattoo.ru/schemas", rel)), $refOptions: { resolve: { rated: resolver } }, bannerComment: "" });
    writeFileSync(join(root, "gen/ts", name + ".d.ts"), ts);
    console.log("ok", rel, ts.length, "bytes");
  } catch (e) { console.log("FAIL", rel, e.message.split("\n")[0]); }
}
// документ: корни before/after через указатель $defs
const doc = JSON.parse(readFileSync(join(mirror, "ratedtattoo.ru/schemas/documents/input/v1.json"), "utf8"));
for (const rootName of ["before", "after"]) {
  const wrapped = { $ref: "https://ratedtattoo.ru/schemas/documents/input/v1.json#/$defs/" + rootName };
  try {
    const ts = await compile(wrapped, "Input" + rootName, { $refOptions: { resolve: { rated: resolver } }, bannerComment: "" });
    writeFileSync(join(root, "gen/ts", "Input_" + rootName + ".d.ts"), ts);
    console.log("ok doc", rootName, ts.length, "bytes");
  } catch (e) { console.log("FAIL doc", rootName, e.message.split("\n")[0]); }
}
