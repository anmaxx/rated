// Типы TypeScript из общих схем: json-schema-to-typescript через API с резолвером,
// который читает $id-ссылки https://ratedtattoo.ru/schemas/<путь> прямо из актуального каталога schemas/
// (замечание владельца 2026-09-15, P5: зеркало не нужно, устаревших копий нет).
// Любая ошибка генерации — ненулевой код выхода (P4).
import { compile } from "json-schema-to-typescript";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const SCHEMAS = join(root, "schemas");
const BASE = "https://ratedtattoo.ru/schemas/";
const OUT = join(root, "gen/ts");
mkdirSync(OUT, { recursive: true });

const resolver = {
  order: 1,
  canRead: /^https:\/\/ratedtattoo\.ru\/schemas\//,
  read: (file) => readFileSync(join(SCHEMAS, file.url.slice(BASE.length).split("#")[0]), "utf8"),
};
const opts = { $refOptions: { resolve: { rated: resolver } }, bannerComment: "" };

let failed = 0;
const targets = [
  ["messages/v1/submit-job.json", "SubmitJobV1"],
  ["messages/v1/erase-generation.json", "EraseGenerationV1"],
  ["messages/v1/result.json", "ResultV1"],
];
for (const [rel, name] of targets) {
  const schema = JSON.parse(readFileSync(join(SCHEMAS, rel), "utf8"));
  try {
    const ts = await compile(schema, name, { ...opts, cwd: dirname(join(SCHEMAS, rel)) });
    writeFileSync(join(OUT, name + ".d.ts"), ts);
    console.log("ok", rel, ts.length, "bytes");
  } catch (e) {
    failed++;
    console.log("FAIL", rel, e.message.split("\n")[0]);
  }
}
// документ: корни before/after через указатель $defs ($anchor генератор не понимает)
for (const rootName of ["before", "after"]) {
  const wrapped = { $ref: BASE + "documents/input/v1.json#/$defs/" + rootName };
  try {
    const ts = await compile(wrapped, "Input" + rootName, opts);
    writeFileSync(join(OUT, "Input_" + rootName + ".d.ts"), ts);
    console.log("ok doc", rootName, ts.length, "bytes");
  } catch (e) {
    failed++;
    console.log("FAIL doc", rootName, e.message.split("\n")[0]);
  }
}
process.exitCode = failed ? 1 : 0;
