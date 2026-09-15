"""Общая часть пробы на стороне генератора: реестр схем, приём в два шага, документ, стирание, фикстуры."""
from __future__ import annotations

import copy
import json
from pathlib import Path

from jsonschema import Draft202012Validator
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

_cache: dict[str, Draft202012Validator] = {}


def compiled(ref: str) -> Draft202012Validator:
    if ref not in _cache:
        _cache[ref] = Draft202012Validator({"$ref": ref}, registry=registry, format_checker=FORMATS)
    return _cache[ref]


KNOWN_VERSIONS = {1}
TYPE_FILE = {"SubmitJob": "submit-job", "EraseGeneration": "erase-generation", "Result": "result"}


def fmt_errors(v: Draft202012Validator, data) -> str:
    errs = sorted(v.iter_errors(data), key=lambda e: e.path)
    return "; ".join(f"/{'/'.join(map(str, e.path))} {e.message[:80]}" for e in errs[:3])


def receive(msg, dir_="v1"):
    """Двухшаговый приём: конверт → известна ли версия → тело."""
    envelope = compiled(BASE + "messages/envelope.json")
    if not envelope.is_valid(msg):
        return "reject", "envelope: " + fmt_errors(envelope, msg)
    if msg["contract_version"] not in KNOWN_VERSIONS:
        return "quarantine", f"unknown contract_version {msg['contract_version']}"
    body = compiled(BASE + f"messages/{dir_}/{TYPE_FILE[msg['message_type']]}.json")
    if not body.is_valid(msg):
        return "reject", "body: " + fmt_errors(body, msg)
    return "accept", ""


def validate_doc(doc, root):
    v = compiled(BASE + f"documents/input/v1.json#{root}")
    return ("accept", "") if v.is_valid(doc) else ("reject", fmt_errors(v, doc))


# --- стирание по сырой схеме -------------------------------------------------
doc_schema = next(s for s in schemas if s["$id"] == BASE + "documents/input/v1.json")


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
    """Каждое свойство либо имеет класс, либо является объектом, все свойства которого имеют класс."""
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
            raise KeyError(f"erase: unknown key {k}")  # неизвестный ключ — не решаем за схему
        cls = sub.get("ratedFieldClass")
        if cls == "content":
            continue
        if cls == "technical":
            out[k] = v
            continue
        out[k] = erase(v, props_of(sub))
    return out


# --- отображение SubmitJob → документ input генератора (явно, по ключам) -------
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
fixtures = json.loads((ROOT / "fixtures/cases.json").read_text())


def _walk(o, path):
    ks = path.split(".")
    c = o
    for k in ks[:-1]:
        c = c[int(k)] if isinstance(c, list) else c[k]
    return c, ks[-1]


def set_path(o, path, val):
    c, k = _walk(o, path)
    c[k] = val


def unset_path(o, path):
    c, k = _walk(o, path)
    if isinstance(c, list):
        del c[int(k)]
    else:
        del c[k]


def build(c):
    d = copy.deepcopy(fixtures["bases"][c["base"]])
    for p, v in (c.get("set") or {}).items():
        set_path(d, p, v)
    for p in c.get("unset") or []:
        unset_path(d, p)
    return d


def without_content(d):
    return {k: v for k, v in d.items() if k not in ("description", "negative_prompt")}
