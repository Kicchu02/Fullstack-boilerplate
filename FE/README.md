# React Sample Project

This is a React + TypeScript + Vite project with routing and state management.

This project is worked on standalone — everything you need to set it up and run it is in this README.

## Prerequisites

Install mise and run `mise install` — see the [root README](../README.md). mise supplies the Node.js and npm versions this project uses, read from [`../.mise.toml`](../.mise.toml).

This app calls the backend at `http://localhost:8080`, so get the backend running first by following [`../WS/README.md`](../WS/README.md). You do not need to know anything about the backend stack to do that.

## Installation & Setup

### Step 1: Install Dependencies

From this directory:

```bash
npm install
```

This installs the dependency versions recorded in `package-lock.json`.

### Step 2: Start Development Server

```bash
npm run dev
```

This starts the Vite development server with hot module replacement (HMR).

### Step 3: Access the Application

Once the development server is running, you should see output similar to:

```
Local:   http://localhost:3000/
Network: use --host to expose
```

Open your web browser and navigate to `http://localhost:3000/` to view the application.

Stop the development server with `Ctrl+C`.

## Other Commands

```bash
npm run build     # type-check and build for production into dist/
npm run lint      # run ESLint
npm run preview   # serve the production build
```
