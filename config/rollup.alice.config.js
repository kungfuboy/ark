import { terser } from 'rollup-plugin-terser'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'packages/alice/src/index.ts',
    output: {
      format: 'cjs',
      file: 'dist/alice.js',
      sourcemap: true,
      exports: 'default'
    },
    // plugins: [esbuild({ target: 'esnext' }), terser()],
    plugins: [esbuild({ target: 'esnext' })],
    external: ['lodash/fp', 'fs', 'readline', 'js-md5', 'colors/safe', 'uid']
  }
]
