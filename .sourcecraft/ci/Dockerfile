FROM docker.io/library/node:24.19.0-bookworm-slim AS node
FROM ghcr.io/astral-sh/uv:0.12.11 AS uv
FROM docker.io/library/python:3.14.7-slim-bookworm

COPY --from=node /usr/local/ /usr/local/
COPY --from=uv /uv /uvx /bin/

RUN node --version \
    && npm --version \
    && python --version \
    && uv --version

WORKDIR /sourcecraft/workspace
