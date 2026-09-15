# Проба общих схем сообщений (2026-09-15)

Отчёт: `../2026-09-15-message-schemas-probe.md`. Запуск из этого каталога одной командой
(Node ≥ 22, uv, Python 3.14; Ruff ставится из `py/requirements.txt`):

    ./run-all.sh

Скрипт останавливается на первом шаге с ненулевым кодом: несовпадение фикстуры с ожиданием,
ошибка линтера классификации, нарушение цепочки «схема → модель → сериализация → схема»,
ошибка генерации типов. Шаги по отдельности — в самом скрипте, в этом порядке:

1. `node node/run.mjs` — backend, Ajv2020 + ajv-formats над корпусом `fixtures/cases.json`;
2. `py/.venv/bin/python py/run.py` — генератор, jsonschema + rfc3339-validator над тем же корпусом;
3. `datamodel-codegen …` — модели Pydantic из `schemas/` через пересозданное зеркало `gen/http-root/`;
4. `py/.venv/bin/python py/models_probe.py` — модель не строже схемы, сериализация
   `model_dump(mode="json", exclude_unset=True)` снова проходит схему, стёртые ключи не возвращаются;
5. `node node/gen-ts.mjs` — типы TypeScript через API с резолвером на актуальный `schemas/`.

Результаты: `gen/results-node.json`, `gen/results-python.json`, `gen/py/pkg/`, `gen/ts/`.
