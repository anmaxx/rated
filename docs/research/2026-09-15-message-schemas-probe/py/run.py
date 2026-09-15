"""Проба: сторона генератора (Python). jsonschema Draft202012Validator + format checker."""
from __future__ import annotations

import copy
import json
import sys
from importlib.metadata import version
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parent.parent
SCHEMAS = ROOT / "schemas"
BASE = "https://ratedtattoo.ru/schemas/"

schemas = [json.loads(p.read_text()) for p in sorted(SCHEMAS.rglob("*.json"))]
registry = Registry().with_resources(
    (s["$id"], Resource.from_contents(s, default_specification=DRAFT202012)) for s in schemas
)

# Проверка форматов включается явно; date-time работает только при установленном rfc3339-validator.
FORMATS = Draft202012Validator.FORMAT_CHECKER
formats_known = sorted(FORMATS.checkers)


def compiled(ref: str) -> Draft202012Validator:
    return Draft202012Validator({"$ref": ref}, registry=registry, format_checker=FORMATS)


def compiled_no_formats(ref: str) -> Draft202012Validator:
    return compiled_noformat_cache.setdefault(
        ref, Draft202012Validator({"$ref": ref}, registry=registry)
    )


compiled_noformat_cache: dict[str, Draft202012Validator] = {}

KNOWN_VERSIONS = {1}
TYPE_FILE = {"SubmitJob": "submit-job", "EraseGeneration": "erase-generation", "Result": "result"}
envelope = compiled(BASE + "messages/envelope.json")
doc_roots = {
    "before": compiled(BASE + "documents/input/v1.json#before"),
    "after": compiled(BASE + "documents/input/v1.json#after"),
}


def fmt_errors(v: Draft202012Validator, data) -> str:
    errs = sorted(v.iter_errors(data), key=lambda e: e.path)
    return "; ".join(f"/{'/'.join(map(str, e.path))} {e.message[:80]}" for e in errs[:3])


def receive(msg, dir_="v1"):
    if not envelope.is_valid(msg):
        return "reject", "envelope: " + fmt_errors(envelope, msg)
    if msg["contract_version"] not in KNOWN_VERSIONS:
        return "quarantine", f"unknown contract_version {msg['contract_version']}"
    body = compiled(BASE + f"messages/{dir_}/{TYPE_FILE[msg['message_type']]}.json")
    if not body.is_valid(msg):
        return "reject", "body: " + fmt_errors(body, msg)
    return "accept", ""


def validate_doc(doc, root):
    v = doc_roots[root]
    return ("accept", "") if v.is_valid(doc) else ("reject", fmt_errors(v, doc))


# --- стирание по сырой схеме -------------------------------------------------
doc_schema = next(s for s in schemas if s["$id"] == BASE + "documents/input/v1.json")
common_schema = next(s for s in schemas if s["$id"] == BASE + "common.json")


def resolve_ref(ref: str):
    file, ptr = ref.split("#")
    target = next(s for s in schemas if s["$id"] == file)
    for k in ptr.split("/")[1:]:
        target = target[k]
    return target


def props_of(sub: dict) -> dict:
    parts = list(sub.get("allOf", [])) + ([{"$ref": sub["$ref"]}] if "$ref" in sub else [])
    via_ref: dict = {}
    for p in parts:
        via_ref.update(props_of(resolve_ref(p["$ref"])) if "$ref" in p else p.get("properties", {}))
    return {**via_ref, **sub.get("properties", {})}


def lint(props: dict, path: str = "") -> list[str]:
    problems = []
    for k, sub in props.items():
        cls = sub.get("ratedFieldClass")
        if cls in ("content", "technical"):
            continue
        nested = props_of(sub)
        if not nested:
            problems.append(f"{path}{k}: нет ratedFieldClass")
        else:
            problems.extend(lint(nested, f"{path}{k}."))
    return problems


def erase(doc: dict, props: dict | None = None) -> dict:
    props = doc_schema["$defs"]["fields"]["properties"] if props is None else props
    out = {}
    for k, v in doc.items():
        sub = props.get(k)
        if sub is None:
            raise KeyError(f"erase: unknown key {k}")
        cls = sub.get("ratedFieldClass")
        if cls == "content":
            continue
        if cls == "technical":
            out[k] = v
            continue
        out[k] = erase(v, props_of(sub))
    return out


lint_problems = lint(doc_schema["$defs"]["fields"]["properties"])


# --- отображение SubmitJob → документ input генератора ------------------------
def map_submit_to_input(m: dict) -> dict:
    p = m["parameters"]
    doc = {
        "schema_version": 1,
        "description": m["prompt"],
        "negative_prompt": m["negative_prompt"],
        "style": m["style"],
        "studio_rules": {"text": p["studio_rules"]["text"], "version": p["studio_rules"]["version"]},
        "model_settings": {"model": p["model_settings"]["model"]},
    }
    if "seed" in p["model_settings"]:
        doc["model_settings"]["seed"] = p["model_settings"]["seed"]
    if "placement" in p:
        doc["placement"] = p["placement"]
    if "size" in p:
        doc["size"] = {"value": p["size"]["value"], "unit": p["size"]["unit"]}
    return doc


# --- фикстуры ----------------------------------------------------------------
fx = json.loads((ROOT / "fixtures/cases.json").read_text())


def set_path(o, path, val):
    ks = path.split(".")
    c = o
    for k in ks[:-1]:
        c = c[int(k)] if isinstance(c, list) else c[k]
    c[ks[-1]] = val


def unset_path(o, path):
    ks = path.split(".")
    c = o
    for k in ks[:-1]:
        c = c[int(k)] if isinstance(c, list) else c[k]
    if isinstance(c, list):
        del c[int(ks[-1])]
    else:
        del c[ks[-1]]


def build(c):
    d = copy.deepcopy(fx["bases"][c["base"]])
    for p, v in (c.get("set") or {}).items():
        set_path(d, p, v)
    for p in c.get("unset") or []:
        unset_path(d, p)
    return d


def without_content(d):
    return {k: v for k, v in d.items() if k not in ("description", "negative_prompt")}


rows = []
for c in fx["cases"]:
    data = build(c)
    try:
        if c["kind"] == "validate":
            if c["target"] == "message":
                got, why = receive(data)
            else:
                got, why = validate_doc(data, c["target"].split(":")[1])
        elif c["kind"] == "erase":
            before, _ = validate_doc(data, "before")
            erased = erase(data)
            after, after_why = validate_doc(erased, "after")
            idem = erase(erased) == erased
            tech = erased == without_content(data)
            # исход определяет только результат стирания; before — справочно, чтобы reject не маскировался входом
            ok = after == "accept" and idem and tech
            got = "accept" if ok else "reject"
            why = f"after={after} idempotent={idem} technical_intact={tech} (before={before}) {after_why}"
        elif c["kind"] == "map":
            rec, _ = receive(data)
            doc = map_submit_to_input(data)
            v, _ = validate_doc(doc, "before")
            s = json.dumps(doc)
            leaked = '"ext_note"' in s or '"kind"' in s or '"ext_flag"' in s
            ok = rec == "accept" and v == "accept" and not leaked
            got, why = ("accept" if ok else "reject"), f"received={rec} doc_before={v} leaked={leaked}"
        elif c["kind"] == "compat":
            old, _ = receive(data, "v1")
            neu, _ = receive(data, "v1-ext")
            ok = old == "accept" and neu == "accept" and data["contract_version"] == 1
            got, why = ("accept" if ok else "reject"), f"v1={old} v1-ext={neu}"
    except Exception as e:  # noqa: BLE001
        got, why = "error", f"{type(e).__name__}: {e}"
    rows.append({"id": c["id"], "expect": c["expect"], "got": got, "ok": got == c["expect"], "why": why})

# Контроль: без format_checker числовая строка проходит?
m03 = build(next(c for c in fx["cases"] if c["id"] == "M03"))
no_fmt = Draft202012Validator({"$ref": BASE + "messages/v1/submit-job.json"}, registry=registry).is_valid(m03)

summary = {
    "side": "python",
    "versions": {
        "python": sys.version.split()[0],
        "jsonschema": version("jsonschema"),
        "referencing": version("referencing"),
        "rfc3339-validator": version("rfc3339-validator"),
    },
    "date_time_checker_registered": "date-time" in formats_known,
    "numeric_string_accepted_without_format_checker": no_fmt,
    "lintProblems": lint_problems,
    "rows": rows,
}
(ROOT / "gen").mkdir(exist_ok=True)
(ROOT / "gen/results-python.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
bad = [r for r in rows if not r["ok"]]
print(
    f"python: {len(rows) - len(bad)}/{len(rows)} совпали с ожиданием; lint: {lint_problems or 'ok'}; "
    f"date-time checker: {summary['date_time_checker_registered']}; без format_checker M03 проходит: {no_fmt}"
)
for r in bad:
    print("  MISMATCH", r["id"], "expect", r["expect"], "got", r["got"], "—", r["why"])
