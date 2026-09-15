"""Проба: сторона генератора (Python). jsonschema Draft202012Validator + format checker над общим корпусом фикстур.
Ненулевой код выхода при любом несовпадении с ожиданием или ошибке линтера (замечание владельца 2026-09-15, P4)."""
from __future__ import annotations

import json
import sys
from importlib.metadata import version

from probe_lib import (
    BASE,
    FORMATS,
    ROOT,
    build,
    compiled,
    doc_schema,
    erase,
    fixtures,
    lint,
    map_submit_to_input,
    receive,
    registry,
    validate_doc,
    without_content,
)
from jsonschema import Draft202012Validator

lint_problems = lint(doc_schema["$defs"]["fields"]["properties"])

rows = []
for c in fixtures["cases"]:
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

# Контроль: без format_checker календарно невозможная дата (M45) проходит? Числовую строку (M03) теперь
# отклоняет и pattern профиля, поэтому необходимость rfc3339-validator показывает именно M45.
m45 = build(next(c for c in fixtures["cases"] if c["id"] == "M45"))
no_fmt = Draft202012Validator({"$ref": BASE + "messages/v1/submit-job.json"}, registry=registry).is_valid(m45)

summary = {
    "side": "python",
    "versions": {
        "python": sys.version.split()[0],
        "jsonschema": version("jsonschema"),
        "referencing": version("referencing"),
        "rfc3339-validator": version("rfc3339-validator"),
    },
    "date_time_checker_registered": "date-time" in FORMATS.checkers,
    "invalid_calendar_date_accepted_without_format_checker": no_fmt,
    "lintProblems": lint_problems,
    "rows": rows,
}
(ROOT / "gen").mkdir(exist_ok=True)
(ROOT / "gen/results-python.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
bad = [r for r in rows if not r["ok"]]
print(
    f"python: {len(rows) - len(bad)}/{len(rows)} совпали с ожиданием; lint: {lint_problems or 'ok'}; "
    f"date-time checker: {summary['date_time_checker_registered']}; без format_checker M45 (30 февраля) проходит: {no_fmt}"
)
for r in bad:
    print("  MISMATCH", r["id"], "expect", r["expect"], "got", r["got"], "—", r["why"])
sys.exit(1 if bad or lint_problems else 0)
