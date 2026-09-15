#!/usr/bin/env bash
# Вся проба одной командой из её каталога. Любой шаг с ненулевым кодом останавливает выполнение
# (замечание владельца 2026-09-15, P4). Зеркало $id-URL для datamodel-code-generator пересоздаётся
# заново при каждом запуске (P5). Ruff закреплён в py/requirements.txt (P6).
set -euo pipefail
cd "$(dirname "$0")"

echo "== установка"
(cd node && npm ci --silent)
[ -x py/.venv/bin/python ] || uv venv -q -p 3.14 py/.venv
uv pip install -q -p py/.venv/bin/python -r py/requirements.txt

echo "== backend: Ajv2020 над корпусом фикстур"
node node/run.mjs

echo "== генератор: jsonschema над тем же корпусом"
py/.venv/bin/python py/run.py

echo "== модели Pydantic из схем (зеркало пересоздаётся)"
rm -rf gen/http-root gen/py/pkg
mkdir -p gen/http-root/ratedtattoo.ru
cp -r schemas gen/http-root/ratedtattoo.ru/schemas
# --strict-types не задаётся: модель не должна быть строже схемы (P3: JSON не различает 7 и 7.0)
py/.venv/bin/datamodel-codegen --input schemas --input-file-type jsonschema --output gen/py/pkg \
  --output-model-type pydantic_v2.BaseModel --field-extra-keys ratedFieldClass \
  --output-datetime-class AwareDatetime --target-python-version 3.12 \
  --formatters ruff-format --disable-timestamp \
  --http-local-ref-path gen/http-root --no-allow-remote-refs

echo "== цепочка схема → модель → сериализация → схема"
py/.venv/bin/python py/models_probe.py

echo "== типы TypeScript (резолвер читает schemas/ напрямую)"
(cd node && node gen-ts.mjs)

echo "== готово"
