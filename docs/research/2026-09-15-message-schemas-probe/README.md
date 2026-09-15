# Проба общих схем сообщений (2026-09-15)

Отчёт: `../2026-09-15-message-schemas-probe.md`. Запуск из этого каталога, последовательность
дословно (Node ≥ 22, uv, Python 3.14):

    (cd node && npm ci --silent)                                   # ajv, ajv-formats, json-schema-to-typescript
    node node/run.mjs                                              # backend: Ajv2020 над корпусом фикстур
    uv venv -q -p 3.14 py/.venv && uv pip install -q -p py/.venv/bin/python -r py/requirements.txt
    py/.venv/bin/python py/run.py                                  # генератор: jsonschema над тем же корпусом
    mkdir -p gen/http-root/ratedtattoo.ru && cp -r schemas gen/http-root/ratedtattoo.ru/schemas
    py/.venv/bin/datamodel-codegen --input schemas --input-file-type jsonschema --output gen/py/pkg \
      --output-model-type pydantic_v2.BaseModel --field-extra-keys ratedFieldClass \
      --strict-types str int float bool --output-datetime-class AwareDatetime \
      --target-python-version 3.12 --formatters ruff-format \
      --http-local-ref-path gen/http-root --no-allow-remote-refs
    py/.venv/bin/python py/models_probe.py                         # что гарантирует модель, а что — схема
    (cd node && node gen-ts.mjs)                                   # типы TypeScript через API с локальным зеркалом

Результаты: `gen/results-node.json`, `gen/results-python.json`, `gen/py/pkg/`, `gen/ts/`.
