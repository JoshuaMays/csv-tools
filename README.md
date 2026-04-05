# CSV Tools

A web-based CSV tool suite for working with CSV files in the browser. Built with [TanStack Start](https://tanstack.com/start) and React, deployed to Cloudflare Workers.

## Features

### CSV Validation

Validate CSV files against simple, user-defined schemas:

- **Column presence** — ensure required columns exist
- **Data types** — check that values match expected types (string, number, date, boolean, etc.)
- **Constraints** — enforce rules like required fields, min/max values, regex patterns, and allowed values
- **Row-level reporting** — see exactly which rows and columns have errors

More tools will be added over time (diffing, transformation, merging, etc.).

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **i18n:** ParaglideJS
- **Linting/Formatting:** ESLint + Prettier

## Getting Started

```bash
npm install
npm run dev
```

## Previewing a Production Build Locally

```bash
npm run build
npm run preview  # serves via vite preview (matches Cloudflare Workers runtime)
```

## Deploying to Cloudflare Workers

```bash
source terraform/.env  # loads CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID
npm run deploy         # builds and runs wrangler deploy
```

## Building for Production

```bash
npm run build
```

Worker scripts are compiled to `public/` by esbuild before Vite runs (see [Scripts](#scripts)).

## Scripts

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Compile workers then start the Vite dev server      |
| `npm run build`     | Compile workers then run the Vite production build  |
| `npm run deploy`    | Build and deploy to Cloudflare Workers via Wrangler |
| `npm run test`      | Run the Vitest test suite                           |
| `npm run typecheck` | Type-check without emitting                         |
| `npm run lint`      | ESLint                                              |
| `npm run format`    | Prettier                                            |
| `npm run codegen`   | Recompile ParaglideJS i18n messages                 |

## Web Workers

CSV parsing and validation run in dedicated Web Workers so they don't block the UI thread.

Because `@cloudflare/vite-plugin` intercepts the standard `new Worker(new URL(..., import.meta.url))` pattern (it uses the same syntax for server-side Cloudflare module workers), the worker entry points are compiled separately by esbuild before the Vite build runs:

```
scripts/build-workers.mjs   ← esbuild step
  src/workers/csv.worker.ts       → public/csv-worker.js
  src/workers/validator.worker.ts → public/validator-worker.js
```

The compiled files are plain IIFE bundles served as static assets. They are referenced by a simple absolute URL (`new Worker('/csv-worker.js')`) which the Cloudflare plugin does not intercept.

The compiled files are excluded from version control (`.gitignore`) and are generated fresh on every `dev` and `build` run.

## License

MIT
