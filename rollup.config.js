// rollup.config.js
import copy from 'rollup-plugin-copy'

export default {
  plugins: [
    copy({
      targets: [
        { src: 'public/**/*', dest: 'dist/public' }
      ]
    })
  ]
}
