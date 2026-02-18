import esbuild, { BuildOptions } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// PATHS
const ROOT_DIR = path.join(fileURLToPath(import.meta.url), '../../../')
const NODE_MODULES = path.join(ROOT_DIR, 'node_modules')

// SCRIPT FLAGS
const PREACT = process.env.PREACT === 'true'
const WATCH = process.env.WATCH === 'true'

console.log(`scripts/build/index.ts PREACT=${PREACT} WATCH=${WATCH}`)

const options: BuildOptions = {
  format: 'esm',
  entryPoints: [path.join(process.cwd(), 'src/index.tsx')],
  bundle: true,
  outfile: path.join(process.cwd(), 'dist/index.js'),
  minify: true,
  platform: 'browser',
  sourcemap: true,
  target: ['esnext'],
  tsconfig: path.join(process.cwd(), 'src/tsconfig.json'),
  logLevel: 'info',
  jsx: 'automatic',
  plugins: [],
  alias: {
    '~/agnostic': '../src/agnostic',
    '~/components': '../src/components',
    '~/node': '../src/node',
    ...(PREACT ? {
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    } : {
      'react': path.join(NODE_MODULES, 'react'),
      'react-dom': path.join(NODE_MODULES, 'react-dom'),
      'react/jsx-runtime': path.join(NODE_MODULES, 'react/jsx-runtime')
    })
  }
}

if (WATCH) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
  console.log('watching...')
} else {
  await esbuild.build(options)
  console.log('built.')
}
