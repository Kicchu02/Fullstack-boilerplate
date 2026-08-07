# Full Stack Boilerplate

A modern full-stack web application boilerplate featuring a React TypeScript frontend with Vite build tooling and a Kotlin backend with PostgreSQL database. Includes authentication, routing, state management, and Docker development environment setup.

This README is the definitive, step-by-step guide to setting up and running this project from a clean machine. Follow it in order.

## Prerequisites

Install these before doing anything else:

1. **Git** — to clone this repository.
2. **Docker** — required to run the PostgreSQL database.
   - **Windows/macOS**: install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure it is running.
   - **Linux**: install Docker Engine and the Docker Compose plugin (`docker compose version` should work).
3. **[mise](https://mise.jdx.dev/)** — manages the exact Node.js and Java versions this project needs (pinned in `.mise.toml` at the repo root). See [Step 1](#step-1-install-mise) below.
4. **[IntelliJ IDEA](https://www.jetbrains.com/idea/)** — the backend (`WS/`) is run from IntelliJ, not the command line. The free Community Edition is sufficient.

## Step 1: Install mise

Pick the instructions for your OS.

### macOS / Linux

```bash
curl https://mise.run | sh
```

Then activate mise in your shell (pick the line matching your shell, run it once):

```bash
# bash
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc

# zsh
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> "${ZDOTDIR-$HOME}/.zshrc"

# fish
echo '~/.local/bin/mise activate fish | source' >> ~/.config/fish/config.fish
```

Restart your terminal (or `source` the file you just edited), then verify:

```bash
mise --version
```

### Windows

Using [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/) (or use `scoop install mise` / `choco install mise` if you prefer those):

```powershell
winget install jdx.mise
```

Activate mise in PowerShell:

```powershell
echo '(&mise activate pwsh) | Out-String | Invoke-Expression' >> $HOME\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
```

Restart your terminal, then verify:

```powershell
mise --version
```

## Step 2: Clone the repository and install pinned tool versions

```bash
git clone <this-repo-url>
cd Fullstack-boilerplate
mise install
```

This reads `.mise.toml` and installs the exact Node.js and Java (Temurin) versions this project is pinned to — currently Node.js 24 (LTS) and Java 25 (Temurin, LTS). Verify it worked:

```bash
node -v        # should print v24.x.x
java -version  # should print openjdk version "25...", Temurin
```

(If `.mise.toml` is ever updated to pin different versions, these numbers — and this README — should be updated to match.)

If these commands aren't found, your shell activation from Step 1 didn't take effect — restart your terminal and try again.

## Step 3: Run the bootstrap script

From the repo root:

**Linux/macOS:**

```bash
./bootstrap.sh
```

**Windows:**

```bash
.\bootstrap.bat
```

This is safe to re-run. It will:

1. Start the PostgreSQL Docker container for the backend (`WS/`), then run Flyway migrations and JOOQ code generation against it.
2. Run `npm install` for the frontend (`FE/`).

Docker must already be running before this step (see Prerequisites).

## Step 4: Run the backend (WS)

The backend is run from IntelliJ IDEA:

1. Open the `WS/` folder as a project in IntelliJ IDEA.
2. Let IntelliJ import the Gradle project (watch the status bar until it finishes).
3. Run the pre-configured **`ApplicationKt`** run configuration (top-right run dropdown, or `Run ▸ Run...`).

The server starts on `http://localhost:8080`. See [`WS/README.md`](WS/README.md) for database start/stop scripts, migrations, and formatting commands.

## Step 5: Run the frontend (FE)

In a separate terminal, from the repo root:

```bash
cd FE
npm run dev
```

Open `http://localhost:3000` in your browser. See [`FE/README.md`](FE/README.md) for more.

## Stopping the project

Stop the backend from IntelliJ (stop the running configuration), stop the frontend dev server with `Ctrl+C`, and stop the database container:

```bash
cd WS
./scripts/stop_dev_docker.sh   # or scripts\stop_dev_docker.bat on Windows
```

## Project Structure

- **FE/** - React frontend application
- **WS/** - Kotlin backend workspace

## More Information

- [Frontend README](FE/README.md)
- [Backend README](WS/README.md)
