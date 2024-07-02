import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'
import path from 'node:path'

export default {
  input: Object.fromEntries(
    globSync('src/components/**/*.js').map((file) => [
      // This remove `src/` as well as the file extension from each
      // file, so e.g. src/nested/foo.js becomes nested/foo
      path.relative(
        'src/components',
        file.slice(0, file.length - path.extname(file).length)
      ),
      // This expands the relative paths to absolute paths, so e.g.
      // src/nested/foo becomes /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url))
    ])
  ),
  output: {
    dir: 'dist',
    sourcemap: false
  },
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx']
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    postcss({
      extract: false,
      modules: true,
      minimize: true,
      use: ['sass']
    }),
    terser()
  ]
}
