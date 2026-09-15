// Проба: сторона backend (TypeScript/Node). Ajv2020 + ajv-formats.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const SCHEMAS = join(root, "schemas");
const BASE = "https://ratedtattoo.ru/schemas/";

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
  });
}
const schemaFiles = walk(SCHEMAS);
const schemas = schemaFiles.map((p) => JSON.parse(readFileSync(p, "utf8")));

function newAjv() {
  const ajv = new Ajv2020({
    strict: true,
    // strictRequired не видит properties за $ref; корни before/after документа составлены как
    // `$ref` + `required`, поэтому эта под-опция отключена явно. Остальные strict-проверки действуют.
    strictRequired: false,
    // strictTypes допускает только пары `[T, "null"]`; assembled_request — строка/массив/объект/null.
    allowUnionTypes: true,
    allErrors: true,
    coerceTypes: false,
    useDefaults: false,
    removeAdditional: false,
    validateFormats: true,
  });
  addFormats(ajv);
  // Ajv 8.20: $anchor разрешается в compile/resolve.js, но не входит ни в один словарь,
  // и strict отвергает его как неизвестное ключевое слово — регистрируем как пустое.
  ajv.addKeyword("$anchor");
  // Слово классификации — собственное ключевое слово-аннотация; в strict без регистрации компиляция падает.
  ajv.addKeyword({
    keyword: "ratedFieldClass",
    metaSchema: { enum: ["content", "technical"] },
  });
  for (const s of schemas) ajv.addSchema(s);
  return ajv;
}
const ajv = newAjv();

// Проверка, что без addKeyword strict действительно падает (пункт из памяти).
let strictWithoutKeyword;
try {
  const a = new Ajv2020({ strict: true, strictRequired: false });
  addFormats(a);
  a.addKeyword("$anchor");
  for (const s of schemas) a.addSchema(s);
  a.getSchema(BASE + "documents/input/v1.json#before");
  strictWithoutKeyword = "compiled (unexpected)";
} catch (e) {
  strictWithoutKeyword = "throws: " + e.message.slice(0, 120);
}

const KNOWN_VERSIONS = new Set([1]);
const TYPE_FILE = { SubmitJob: "submit-job", EraseGeneration: "erase-generation", Result: "result" };
const envelope = ajv.getSchema(BASE + "messages/envelope.json");
const compiled = (id) => {
  const v = ajv.getSchema(id);
  if (!v) throw new Error("no schema " + id);
  return v;
};
const docBefore = compiled(BASE + "documents/input/v1.json#before");
const docAfter = compiled(BASE + "documents/input/v1.json#after");

function fmtErrors(errs) {
  return (errs || []).slice(0, 3).map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");
}

// Двухшаговый приём: конверт → версия → тело.
function receive(msg, dir = "v1") {
  if (!envelope(msg)) return { outcome: "reject", why: "envelope: " + fmtErrors(envelope.errors) };
  if (!KNOWN_VERSIONS.has(msg.contract_version)) return { outcome: "quarantine", why: "unknown contract_version " + msg.contract_version };
  const body = compiled(BASE + `messages/${dir}/${TYPE_FILE[msg.message_type]}.json`);
  if (!body(msg)) return { outcome: "reject", why: "body: " + fmtErrors(body.errors) };
  return { outcome: "accept", why: "" };
}

function validateDoc(doc, root) {
  const v = root === "before" ? docBefore : docAfter;
  return v(doc) ? { outcome: "accept", why: "" } : { outcome: "reject", why: fmtErrors(v.errors) };
}

// --- стирание по сырой схеме -------------------------------------------------
const docSchema = schemas.find((s) => s.$id === BASE + "documents/input/v1.json");
const commonSchema = schemas.find((s) => s.$id === BASE + "common.json");
function resolveRef(ref) {
  // абсолютные ссылки по $id: "https://ratedtattoo.ru/schemas/<file>#/$defs/x"
  const [file, ptr] = ref.split("#");
  const target = schemas.find((s) => s.$id === file);
  if (!target) throw new Error("resolveRef: unknown $id " + file);
  return ptr.split("/").slice(1).reduce((o, k) => o[k], target);
}
function propsOf(sub) {
  // структура: собственные properties + properties из $ref и из каждого элемента allOf
  const parts = [...(sub.allOf || []), ...(sub.$ref ? [{ $ref: sub.$ref }] : [])];
  const viaRef = Object.assign({}, ...parts.map((p) => (p.$ref ? propsOf(resolveRef(p.$ref)) : p.properties || {})));
  return { ...viaRef, ...(sub.properties || {}) };
}
// Линтер: каждое свойство либо имеет класс, либо является объектом, все свойства которого имеют класс (рекурсивно).
function lint(props, path = "") {
  const problems = [];
  for (const [k, sub] of Object.entries(props)) {
    const cls = sub.ratedFieldClass;
    if (cls === "content" || cls === "technical") continue;
    const nested = propsOf(sub);
    if (Object.keys(nested).length === 0) problems.push(path + k + ": нет ratedFieldClass");
    else problems.push(...lint(nested, path + k + "."));
  }
  return problems;
}
function erase(doc, props = docSchema.$defs.fields.properties) {
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    const sub = props[k];
    if (!sub) throw new Error("erase: unknown key " + k); // неизвестный ключ — не решаем за схему
    const cls = sub.ratedFieldClass;
    if (cls === "content") continue;
    if (cls === "technical") { out[k] = v; continue; }
    out[k] = erase(v, propsOf(sub)); // смешанный контейнер — спускаемся
  }
  return out;
}
const lintProblems = lint(docSchema.$defs.fields.properties);

// --- отображение SubmitJob → документ input генератора (явно, по ключам) -------
function mapSubmitToInput(m) {
  const p = m.parameters;
  const doc = {
    schema_version: 1,
    description: m.prompt,
    negative_prompt: m.negative_prompt,
    style: m.style,
    studio_rules: { text: p.studio_rules.text, version: p.studio_rules.version },
    model_settings: { model: p.model_settings.model },
  };
  if (p.model_settings.seed !== undefined) doc.model_settings.seed = p.model_settings.seed;
  if (p.placement !== undefined) doc.placement = p.placement;
  if (p.size !== undefined) doc.size = { value: p.size.value, unit: p.size.unit };
  return doc;
}

// --- фикстуры ----------------------------------------------------------------
const fx = JSON.parse(readFileSync(join(root, "fixtures/cases.json"), "utf8"));
const clone = (o) => JSON.parse(JSON.stringify(o));
function setPath(o, path, val) {
  const ks = path.split(".");
  let c = o;
  for (const k of ks.slice(0, -1)) c = c[k];
  c[ks.at(-1)] = val;
}
function unsetPath(o, path) {
  const ks = path.split(".");
  let c = o;
  for (const k of ks.slice(0, -1)) c = c[k];
  if (Array.isArray(c)) c.splice(Number(ks.at(-1)), 1); else delete c[ks.at(-1)];
}
function build(c) {
  const d = clone(fx.bases[c.base]);
  for (const [p, v] of Object.entries(c.set || {})) setPath(d, p, v);
  for (const p of c.unset || []) unsetPath(d, p);
  return d;
}
const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const withoutContent = (d) => { const { description, negative_prompt, ...rest } = d; return rest; };

const rows = [];
for (const c of fx.cases) {
  const data = build(c);
  let r;
  try {
    if (c.kind === "validate") {
      r = c.target === "message" ? receive(data) : validateDoc(data, c.target.split(":")[1]);
    } else if (c.kind === "erase") {
      const before = validateDoc(data, "before");
      const erased = erase(data);
      const after = validateDoc(erased, "after");
      const again = erase(erased);
      const idem = deepEq(erased, again);
      const tech = deepEq(erased, withoutContent(data));
      // Исход определяет только результат стирания: остаток по корню after, идемпотентность, сохранность технической части.
      // Исход проверки исходного документа (before) — справочно в why, чтобы reject не маскировался входом.
      const ok = after.outcome === "accept" && idem && tech;
      r = { outcome: ok ? "accept" : "reject", why: `after=${after.outcome} idempotent=${idem} technical_intact=${tech} (before=${before.outcome}) ${after.why}` };
    } else if (c.kind === "map") {
      const rec = receive(data);
      const doc = mapSubmitToInput(data);
      const v = validateDoc(doc, "before");
      const leaked = ["ext_note", "kind"].some((k) => JSON.stringify(doc).includes(`"${k}"`)) || doc.ext_flag !== undefined;
      const ok = rec.outcome === "accept" && v.outcome === "accept" && !leaked;
      r = { outcome: ok ? "accept" : "reject", why: `received=${rec.outcome} doc_before=${v.outcome} leaked=${leaked}` };
    } else if (c.kind === "compat") {
      const old = receive(data, "v1");
      const neu = receive(data, "v1-ext");
      const ok = old.outcome === "accept" && neu.outcome === "accept" && data.contract_version === 1;
      r = { outcome: ok ? "accept" : "reject", why: `v1=${old.outcome} v1-ext=${neu.outcome}` };
    }
  } catch (e) {
    r = { outcome: "error", why: e.message };
  }
  rows.push({ id: c.id, expect: c.expect, got: r.outcome, ok: r.outcome === c.expect, why: r.why });
}

const summary = {
  side: "node",
  versions: { node: process.version, ajv: JSON.parse(readFileSync(join(here, "node_modules/ajv/package.json"))).version, "ajv-formats": JSON.parse(readFileSync(join(here, "node_modules/ajv-formats/package.json"))).version },
  strictWithoutKeyword,
  lintProblems,
  rows,
};
mkdirSync(join(root, "gen"), { recursive: true });
writeFileSync(join(root, "gen/results-node.json"), JSON.stringify(summary, null, 2));
const bad = rows.filter((r) => !r.ok);
console.log(`node: ${rows.length - bad.length}/${rows.length} совпали с ожиданием; lint: ${lintProblems.length ? lintProblems.join(", ") : "ok"}; strict без addKeyword: ${strictWithoutKeyword}`);
for (const r of bad) console.log("  MISMATCH", r.id, "expect", r.expect, "got", r.got, "—", r.why);
// Несовпадение или ошибка линтера — ненулевой код выхода (замечание владельца 2026-09-15, P4).
process.exitCode = bad.length || lintProblems.length ? 1 : 0;
