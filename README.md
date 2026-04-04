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

## Testing

```bash
npm run test
```

## Linting & Formatting

```bash
npm run lint
npm run format
npm run check
```

## License

MIT
