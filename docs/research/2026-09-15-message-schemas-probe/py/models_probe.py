"""Сгенерированные модели Pydantic против общей схемы (граница ответственности, пункт 1 владельца;
цепочка «схема → модель → сериализация → схема» — замечание владельца 2026-09-15, P3).

Требования к модели (несоблюдение — ненулевой код выхода, P4):
  (a) модель принимает всё, что приняла схема (модель не строже схемы);
  (b) model_dump(mode="json", exclude_unset=True) снова проходит ту же схему;
  (c) у стёртого документа удалённые ключи после сериализации не появляются.
Справочно (не требование): что модель принимает из отклонённого схемой — граница, которую закрывает схема.
"""
from __future__ import annotations

import importlib
import json
import sys

from probe_lib import ROOT, build, erase, fixtures, receive, validate_doc
from pydantic import BaseModel, ValidationError

sys.path.insert(0, str(ROOT / "gen/py"))
mods = {
    "SubmitJob": importlib.import_module("pkg.messages.v1.submit_job"),
    "EraseGeneration": importlib.import_module("pkg.messages.v1.erase_generation"),
    "Result": importlib.import_module("pkg.messages.v1.result"),
}
doc_mod = importlib.import_module("pkg.documents.input.v1")


def root_model(mod, marker):
    """Корневая модель сообщения: BaseModel с полем конверта и полем тела (marker); родитель-конверт не подходит."""
    for name in dir(mod):
        obj = getattr(mod, name)
        f = getattr(obj, "model_fields", None) if isinstance(obj, type) else None
        if f and issubclass(obj, BaseModel) and "message_type" in f and marker in f:
            return obj
    raise RuntimeError("no root model in " + mod.__name__)


MODELS = {
    "SubmitJob": root_model(mods["SubmitJob"], "prompt"),
    "EraseGeneration": root_model(mods["EraseGeneration"], "requested_at"),
    "Result": root_model(mods["Result"], "state"),
    "before": doc_mod.Before,
    "after": doc_mod.After,
}
DUMP = {"mode": "json", "exclude_unset": True}


def model_accepts(model, data):
    try:
        return model.model_validate_json(json.dumps(data)), None
    except ValidationError as e:
        err = e.errors()[0]
        return None, f"{err['type']} at /{'/'.join(map(str, err['loc']))}"


failures: list[str] = []
info: list[str] = []
checked = 0

# (a)+(b): каждая фикстура, принятая схемой, проходит модель и после сериализации снова схему
for c in fixtures["cases"]:
    if c["kind"] != "validate" or c["expect"] != "accept":
        continue
    data = build(c)
    if c["target"] == "message":
        key, schema_check = data["message_type"], lambda d: receive(d)[0]
    else:
        key = c["target"].split(":")[1]
        schema_check = lambda d, k=key: validate_doc(d, k)[0]
    model = MODELS[key]
    inst, err = model_accepts(model, data)
    checked += 1
    if inst is None:
        failures.append(f"{c['id']}: схема приняла, модель отклонила ({err})")
        continue
    out = inst.model_dump(**DUMP)
    if schema_check(out) != "accept":
        failures.append(f"{c['id']}: после model_dump{DUMP} схема отклоняет: {json.dumps(out, ensure_ascii=False)[:120]}")
    elif out != data:
        info.append(f"{c['id']}: сериализация меняет представление (схема принимает): {json.dumps(out, ensure_ascii=False)[:100]}")

# (c): стёртый документ через модель After не восстанавливает удалённые ключи
for c in fixtures["cases"]:
    if c["kind"] != "erase" or c["expect"] != "accept":
        continue
    erased = erase(build(c))
    inst, err = model_accepts(MODELS["after"], erased)
    checked += 1
    if inst is None:
        failures.append(f"{c['id']}: After отклонила стёртый документ ({err})")
        continue
    for label, dumped in (("exclude_unset=True", inst.model_dump(**DUMP)), ("по умолчанию", inst.model_dump(mode="json"))):
        restored = [k for k in ("description", "negative_prompt") if k in dumped]
        ok = validate_doc(dumped, "after")[0] == "accept" and not restored
        line = f"{c['id']}: After → model_dump({label}) → корень after: {'accept' if ok else 'reject'}; восстановлены ключи: {restored or 'нет'}"
        (info if label == "по умолчанию" else (info if ok else failures)).append(line)

# Справочно: что модель принимает из отклонённого схемой (граница, которую закрывает схема)
for c in fixtures["cases"]:
    if c["kind"] != "validate" or c["expect"] not in ("reject", "quarantine") or c["target"] != "message":
        continue
    data = build(c)
    if data.get("message_type") not in MODELS:
        continue
    inst, err = model_accepts(MODELS[data["message_type"]], data)
    if inst is not None:
        info.append(f"{c['id']}: схема — {c['expect']}, модель — принимает ({c['note']})")

cls = {n: (f.json_schema_extra or {}).get("ratedFieldClass") for n, f in MODELS["before"].model_fields.items()}
info.append("Before.model_fields ratedFieldClass: " + json.dumps(cls, ensure_ascii=False))

print(f"models: проверено {checked} принятых схемой фикстур; требования (a)(b)(c): {'нарушений нет' if not failures else str(len(failures)) + ' нарушений'}")
for f in failures:
    print("  FAIL", f)
print("справочно:")
for i in info:
    print("  ", i)
sys.exit(1 if failures else 0)
