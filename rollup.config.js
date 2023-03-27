const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const copy = require('rollup-plugin-copy');
const pkg = require('./package.json');

module.exports = {
  input: 'src/main.ts',
  plugins: [
    resolve({
      preferBuiltins: false,
      extensions: ['.js', '.ts', '.json'],
    }),
    typescript(),
    commonjs(),
    copy({
      targets: [
        {
          src: 'src/database/*',
          dest: 'lib/database',
        },
      ],
    }),
  ],
  output: {
    file: pkg.main,
    format: 'cjs',
  },
  external: ['fs', 'node-opencc'],
};
