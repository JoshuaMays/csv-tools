// Pre-compiles Web Worker entry points to public/ as plain IIFE bundles.
// Using IIFE format avoids `type: "module"` on new Worker() and sidesteps
// the @cloudflare/vite-plugin interception of new Worker(new URL(...)) patterns.
// The public/ files are served as static assets by both the Vite dev server
// and the Cloudflare Workers runtime (via dist/client/).
import { build } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, statSync } from 'fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'src')

// Resolve @/ path aliases without relying on esbuild's tsconfig support.
// esbuild's tsconfig path resolution varies by version (it's a transitive dep
// from Vite, so the version is not pinned) and can fail with moduleResolution: bundler.
function resolveWithExtensions(base) {
  for (const suffix of [
    '',
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '/index.ts',
    '/index.js',
    '/_index.js',
    '/_index.ts',
  ]) {
    const full = base + suffix
    if (existsSync(full) && statSync(full).isFile()) return full
  }
  return null
}

const atAliasPlugin = {
  name: 'at-alias',
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => {
      const resolved = resolveWithExtensions(resolve(src, args.path.slice(2)))
      if (resolved) return { path: resolved }
    })
  },
}

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
      plugins: [atAliasPlugin],
      define: {
        // Paraglide runtime checks import.meta.env?.SSR — tell it we're in the browser
        'import.meta.env.SSR': 'false',
      },
    }),
  ),
)

console.log('Workers compiled to public/')
