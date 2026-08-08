# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository structure

This repo contains two independent projects, each with its own CLAUDE.md:
- [`FE/`](FE/CLAUDE.md) — React + TypeScript + Vite frontend (port 3000)
- [`WS/`](WS/CLAUDE.md) — Kotlin + Ktor backend (port 8080), PostgreSQL via Docker

There is no shared build system between them; treat them as separate projects and consult the CLAUDE.md in whichever directory you're working in.

## First-time setup

From repo root: `./bootstrap.sh` starts the WS Docker DB, runs migrations/codegen, then `npm install`s the FE. Safe to re-run, and it exits non-zero at the first failing step.

Node.js and Java are pinned in `.mise.toml` and installed via `mise install`; the repo carries no other toolchain setup. Linux and macOS are the supported platforms — there are no Windows scripts.

Never run `bootstrap.sh` or the `WS/scripts/*.sh` scripts with `sudo` — mise exports `JAVA_HOME`/`PATH` into the user's shell, and `sudo` discards them, so Gradle fails with `JAVA_HOME is not set`. On Linux, Docker needing root is fixed by adding the user to the `docker` group (root README), not by `sudo`. All these scripts source `WS/scripts/lib/preflight.sh`, which checks for `sudo`, an unreachable Docker daemon, and missing `java`/`node`.

## Agent skills

Shared skills live in `.claude/skills/` and are checked in, so every teammate gets them
on clone. `skills-lock.json` records each skill's upstream source and content hash.

Install project-level only, never with `-g` or `-y`:
`npx skills add <owner/repo> -s <skill> -a claude-code`

`.claude/skills/find-skills/SKILL.md` has been edited locally (its install instructions
were changed to project-level and confirmation-required), so it no longer matches the
hash in `skills-lock.json`. Running `npx skills update` will overwrite that edit —
re-apply it if you do.

## Keeping the READMEs current

The three READMEs divide the work, and each step belongs to exactly one of them:

- `README.md` — what the project is, the machine-level prerequisites, toolchain setup via mise, and a handoff to the two subproject READMEs. It does not document how to set up or run either project.
- `WS/README.md` and `FE/README.md` — each is the complete and only setup path for its own project, readable start to finish without the other. A contributor reads the root README once for prerequisites, then works entirely from one subproject README.

Setup instructions live in exactly one file. When a change affects how someone would set up, install, configure, or run something — a new prerequisite, a changed command, a new step, a changed port — update the file that owns that step, in the same change. Don't add a second copy elsewhere for convenience, and don't leave it for a follow-up; treat stale setup instructions as a bug.
