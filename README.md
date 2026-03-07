# 🎮 Roblox Activity Monitor

> ⚠️ **NOT FOR PRODUCTION USE** — This application was AI-generated and is intended for demonstration purposes only. Do not use it in a production environment. All data is stored only in your browser session and is not persisted or secured.

A simple, manual-entry Roblox activity tracker built with [Svelte](https://svelte.dev/) + [Vite](https://vite.dev/).

**Live demo:** <https://clova-cz.github.io/Activity-Monitor/>

---

## Features

- **Add / edit / remove players** — manually record any Roblox username, display name, current status, and the game they're playing.
- **Status tracking** — Online 🟢, In Game 🎮, Offline ⚫
- **Activity log** — every add, edit, remove, and status change is timestamped and shown in a scrollable log.
- **Search & filter** — filter the player grid by status or search by name / game.
- **Stats bar** — at-a-glance counts for each status.

## Getting started locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173/Activity-Monitor/> in your browser.

## Building for production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Deployment

The app is deployed automatically to GitHub Pages via the [deploy workflow](.github/workflows/deploy.yml) on every push to the `slop` branch.

## Dependencies

Dependabot is configured (see [`.github/dependabot.yml`](.github/dependabot.yml)) to open weekly PRs for outdated npm packages and GitHub Actions.
