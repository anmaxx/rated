"""Что гарантирует сгенерированная модель Pydantic, а что — только общая схема (граница ответственности, пункт 1 владельца)."""
import copy, json, sys, importlib, pathlib
from pydantic import ValidationError
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "gen/py"))
fx = json.loads((ROOT / "fixtures/cases.json").read_text())
submit_mod = importlib.import_module("pkg.messages.v1.submit_job")
result_mod = importlib.import_module("pkg.messages.v1.result")
doc_mod = importlib.import_module("pkg.documents.input.v1")
common = importlib.import_module("pkg.common")
def root_model(mod, marker):
    # корневая модель сообщения: BaseModel с полем конверта и полем тела (marker); родитель-конверт не подходит
    from pydantic import BaseModel
    for name in dir(mod):
        obj = getattr(mod, name)
        f = getattr(obj, "model_fields", None) if isinstance(obj, type) else None
        if f and issubclass(obj, BaseModel) and "message_type" in f and marker in f:
            return obj
    raise RuntimeError("no root model in " + mod.__name__)
Submit, Result, Before, After = root_model(submit_mod, "prompt"), root_model(result_mod, "state"), doc_mod.Before, doc_mod.After
print("models:", Submit.__name__, "<-", [b.__name__ for b in Submit.__bases__], "|", Result.__name__)
def check(label, model, data, strict=True):
    try:
        model.model_validate_json(json.dumps(data), strict=strict); return f"{label}: ACCEPT"
    except ValidationError as e:
        return f"{label}: reject ({e.errors()[0]['type']} at {'/'.join(map(str, e.errors()[0]['loc']))})"
base = fx["bases"]; s = copy.deepcopy(base["submit"]); r = copy.deepcopy(base["result"]); d = copy.deepcopy(base["doc"])
out = []
out.append(check("Submit valid", Submit, s))
out.append(check("Submit created_at '1757939400' (M03, схема: reject)", Submit, {**s, "created_at": "1757939400"}))
out.append(check("Submit created_at 1757939400 число (M04)", Submit, {**s, "created_at": 1757939400}))
out.append(check("Submit created_at без смещения (M05)", Submit, {**s, "created_at": "2026-09-14T12:00:00"}))
out.append(check("Submit mode='refine' (M12, схема: reject)", Submit, {**s, "mode": "refine"}))
out.append(check("Submit ext_note (M09, открытая форма)", Submit, {**s, "ext_note": "x"}))
out.append(check("Submit source.size '1024' строкой (M13)", Submit, {**s, "source": {"key": "k", "size": "1024", "media_type": "image/jpeg", "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"}}))
out.append(check("Submit contract_version 99 (M15, у схемы: quarantine)", Submit, {**s, "contract_version": 99}))
out.append(check("Result valid", Result, r))
rc = copy.deepcopy(r); rc.pop("result"); rc.update({"state": "failed", "reason_code": "result_payload_unavailable", "result_candidate": {"key": "k", "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", "size": 10, "media_type": "image/png"}})
out.append(check("Result result_candidate без call_id (M24)", Result, rc))
r2 = copy.deepcopy(r); r2["provider_calls"][0]["finished_at"] = "1757939400"
out.append(check("Result provider_calls[0].finished_at '1757939400' (схема: reject)", Result, r2))
r3 = copy.deepcopy(r); r3["provider_calls"][0]["usage"] = {"units": 1, "amount": 12.5, "currency": "RUB", "cost_kind": "estimated"}
out.append(check("Result estimated без tariff_version (M30, схема: reject)", Result, r3))
out.append(check("Before valid (D01)", Before, d))
out.append(check("Before ext_text (D02)", Before, {**d, "ext_text": "x"}))
out.append(check("Before studio_rules.note (D03)", Before, {**d, "studio_rules": {**d["studio_rules"], "note": "x"}}))
da = {k: v for k, v in d.items() if k not in ("description", "negative_prompt")}
out.append(check("After valid (D06)", After, da))
out.append(check("After description остался (D07, схема: reject)", After, {**da, "description": "x"}))
out.append(check("After description '' (D08, схема: reject)", After, {**da, "description": ""}))
# классификация в json_schema_extra у сгенерированной модели
cls = {n: (f.json_schema_extra or {}).get("ratedFieldClass") for n, f in Before.model_fields.items()}
out.append("Before.model_fields ratedFieldClass: " + json.dumps(cls, ensure_ascii=False))
print("\n".join(out))
