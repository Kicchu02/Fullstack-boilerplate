# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This repo contains two independent projects, each with its own CLAUDE.md:
- [`FE/`](FE/CLAUDE.md) — React + TypeScript + Vite frontend (port 3000)
- [`WS/`](WS/CLAUDE.md) — Kotlin + Ktor backend (port 8080), PostgreSQL via Docker

There is no shared build system between them; treat them as separate projects and consult the CLAUDE.md in whichever directory you're working in.

## First-time setup

From repo root: `./bootstrap.sh` (or `bootstrap.bat` on Windows) starts the WS Docker DB, runs migrations/codegen, then `npm install`s the FE. Safe to re-run.

## Keeping the READMEs current

The root `README.md` is the definitive, step-by-step source of truth for setting up and running this project from a clean machine — someone should be able to follow it top to bottom with no other context. `FE/README.md` and `WS/README.md` are the per-subproject supplements it links to.

Whenever a change affects how someone would set up, install, configure, or run the project — a new prerequisite, a changed command, a new setup step, a changed port, etc. — update the relevant README(s) (root and/or `FE/README.md` / `WS/README.md`) in the same change. Don't leave this for a follow-up; treat stale setup instructions as a bug.
