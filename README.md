# Full Stack Boilerplate

A modern full-stack web application boilerplate featuring a React TypeScript frontend with Vite build tooling and a Kotlin backend with PostgreSQL database. Includes authentication, routing, state management, and Docker development environment setup.

This README covers what to install on your machine and where to go next. The two projects are set up from their own READMEs.

Supported platforms: **Linux** and **macOS**.

## Prerequisites

| Tool          | Install instructions                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Git           | <https://git-scm.com/downloads>                                                                                                            |
| Docker        | macOS: [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/) · Linux: [Docker Engine](https://docs.docker.com/engine/install/) |
| mise          | [Set up your toolchain](#set-up-your-toolchain) below                                                                                      |
| IntelliJ IDEA | <https://www.jetbrains.com/idea/download/> — Community Edition is sufficient                                                                |

### Linux: run Docker without sudo

On Linux the Docker socket is owned by `root`, so `docker` needs `sudo` until you add yourself to the `docker` group:

```bash
sudo usermod -aG docker $USER
newgrp docker            # or log out and back in — group membership is set at login
docker run hello-world   # verify: no sudo, no permission error
```

Do this before running any of the project scripts. macOS Docker Desktop needs no equivalent step.

**Never run the project scripts with `sudo`.** `sudo` starts a fresh root environment and discards the `PATH` and `JAVA_HOME` that mise sets in your shell, so the build fails with `JAVA_HOME is not set`. The scripts refuse to run under `sudo` for this reason.

## Set up your toolchain

Node.js and Java come from [mise](https://mise.jdx.dev/), which reads the versions from [`.mise.toml`](.mise.toml) and puts them on your `PATH` while you are inside this project.

Install mise:

```bash
curl https://mise.run | sh
```

Activate it in your shell by running the line that matches the shell you use:

```bash
# bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc

# zsh
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> "${ZDOTDIR-$HOME}/.zshrc"

# fish
echo '~/.local/bin/mise activate fish | source' >> ~/.config/fish/config.fish
```

Restart your terminal so the activation takes effect, then install the toolchain from the repository root:

```bash
mise install
```

Confirm Node.js and Java are active:

```bash
mise ls
```

mise only puts Node.js and Java on `PATH` in shells where it has been activated, and the project scripts inherit the environment of whatever shell you launch them from. So activate it in the shell you actually work in — if you run the scripts from a different shell than the one you configured above, they will report that `java` or `node` is missing.

## Set up the projects

Each project is set up and run from its own README. Follow whichever one you are working on — both are self-contained, so you can work on one without reading the other.

- **Backend** — follow [`WS/README.md`](WS/README.md).
- **Frontend** — follow [`FE/README.md`](FE/README.md). The frontend calls the backend, so set the backend up first.

Working on both? `./bootstrap.sh` runs the backend database setup and the frontend dependency install in one go. You still need the IntelliJ steps in [`WS/README.md`](WS/README.md) to run the backend afterwards.

## Verifying a change

`./verify.sh` runs both projects' full verification suites and prints one summary per half. It needs Docker running, and it starts the backend on port `8080` and a preview server on port `3000`, so stop anything already using those ports first — the scripts refuse to run rather than test the wrong server.

Each project can be verified on its own: [`WS/scripts/verify.sh`](WS/scripts/verify.sh) and [`FE/scripts/verify.sh`](FE/scripts/verify.sh).

## Project Structure

- **[FE/](FE/README.md)** — React frontend application
- **[WS/](WS/README.md)** — Kotlin backend workspace
