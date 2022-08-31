import { terser } from 'rollup-plugin-terser'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'packages/mikasa/src/index.ts',
    output: {
      format: 'cjs',
      file: 'dist/mikasa.js',
      sourcemap: true,
      exports: 'default'
    },
    // plugins: [esbuild({ target: 'esnext' }), terser()],
    plugins: [esbuild({ target: 'esnext' })],
    external: ['lodash/fp', 'fs', 'readline', 'js-md5', 'colors/safe', 'uid']
  },
  {
    input: 'packages/tifa/src/index.ts',
    output: {
      format: 'cjs',
      file: 'dist/tifa.js',
      sourcemap: true,
      exports: 'default'
    },
    // plugins: [esbuild({ target: 'esnext' }), terser()],
    plugins: [esbuild({ target: 'esnext' })],
    external: ['lodash/fp', 'fs', 'readline', 'js-md5', 'colors/safe', 'uid']
  }
]
