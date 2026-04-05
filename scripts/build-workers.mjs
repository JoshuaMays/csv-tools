// Pre-compiles Web Worker entry points to public/ as plain IIFE bundles.
// Using IIFE format avoids `type: "module"` on new Worker() and sidesteps
// the @cloudflare/vite-plugin interception of new Worker(new URL(...)) patterns.
// The public/ files are served as static assets by both the Vite dev server
// and the Cloudflare Workers runtime (via dist/client/).
import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const workers = [
  {
    entry: 'src/workers/csv.worker.ts',
    out: 'public/csv-worker.js',
  },
  {
    entry: 'src/workers/validator.worker.ts',
    out: 'public/validator-worker.js',
  },
]

await Promise.all(
  workers.map(({ entry, out }) =>
    build({
      entryPoints: [resolve(root, entry)],
      outfile: resolve(root, out),
      bundle: true,
      platform: 'browser',
      // IIFE: self-contained, no import statements, works as a classic Worker script
      format: 'iife',
      target: 'es2020',
      // esbuild reads @/* paths from tsconfig.json automatically
      tsconfig: resolve(root, 'tsconfig.json'),
      define: {
        // Paraglide runtime checks import.meta.env?.SSR — tell it we're in the browser
        'import.meta.env.SSR': 'false',
      },
    }),
  ),
)

console.log('Workers compiled to public/')
