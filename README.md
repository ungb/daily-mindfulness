# Daily Mindfulness

[![Tests and deployment](https://github.com/ungb/daily-mindfulness/actions/workflows/pages.yml/badge.svg)](https://github.com/ungb/daily-mindfulness/actions/workflows/pages.yml)

A free, static mindfulness routine builder. Choose a goal and session length, adjust the suggested exercises, and follow the on-screen breathing and meditation prompts.

[Open Daily Mindfulness](https://ungb.github.io/daily-mindfulness/)

## Features

- Deterministic routines for stress, focus, sleep, and general wellbeing
- Adjustable exercise timers and two paced-breathing patterns
- Pause, skip, restart, and exercise information controls
- Preferences saved locally in the browser
- Responsive layout and reduced-motion support
- No account, backend, analytics, advertising, or payment system

## Privacy And Security

The app runs entirely in the browser. It does not transmit mindfulness choices or saved preferences to a server. Preferences contain no sensitive information and are stored only in the browser's `localStorage`.

The page uses a restrictive Content Security Policy, validates saved preferences, and renders dynamic content with safe DOM APIs rather than HTML strings. Google Fonts is the only third-party browser request. GitHub Pages provides HTTPS for the published site.

This project is a general mindfulness aid, not medical advice or a replacement for professional care.

To report a security issue, use the repository's private **Security advisories** reporting form rather than opening a public issue.

## Local Development

Requirements: Node.js 22 or newer.

```bash
npm install
npx playwright install chromium
node tests/server.js
```

Then open <http://127.0.0.1:4173>.

## Tests

```bash
npm test
```

The Playwright suite runs in desktop and mobile Chromium. It covers routine creation, timer changes, information dialogs, session controls, preference persistence/reset, and malformed stored data.

When editing the inline JavaScript in `index.html`, update its SHA-256 value in the Content Security Policy. A stale hash blocks the script, causing the Playwright flow tests to fail.

## Deployment

Pushes to `main` run the Playwright tests and `npm audit`. If they pass, `.github/workflows/pages.yml` deploys `index.html` through GitHub Pages. Automated Dependabot pull requests run the same checks without deploying.

The workflow uses only GitHub's built-in `GITHUB_TOKEN`; the app itself needs no secrets or environment variables.

## Project Structure

```text
index.html                 Static application
tests/mindfulness.spec.js  Playwright browser flows
tests/server.js            Local static test server
playwright.config.js       Browser test configuration
.github/workflows/         CI and GitHub Pages deployment
```

## Forks And Issues

You are welcome to fork this repository and create your own version, design, routines, or other changes under the MIT License.

If you find a bug or have a suggestion for this version, [open an issue](https://github.com/ungb/daily-mindfulness/issues). Please do not include private health information in an issue because issues are public.

Community pull requests are not accepted and are automatically closed. If you have already fixed a bug in your fork, describe the fix or link to the relevant commit in an issue so it can be reviewed and reproduced here. Automated Dependabot maintenance pull requests are the only exception.

## License

Released under the [MIT License](LICENSE).
