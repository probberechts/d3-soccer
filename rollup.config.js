import * as meta from "./package.json";

// ------ JavaScript
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';

// ------ postCSS
import postcss from 'rollup-plugin-postcss';
import atImport from 'postcss-import';
import selector from 'postcss-custom-selectors';
import customProperties from 'postcss-custom-properties';
import sorting from 'postcss-sorting';
import nested from 'postcss-nested';
import stylelint from 'rollup-plugin-stylelint';

// ------ global
import resolve from 'rollup-plugin-node-resolve';


const plugins = [
  eslint({
    exclude: ['src/styles/*.css']
  }),
  stylelint({
    include: ['src/styles/*.css']
  }),
  babel({
    exclude: ['node_modules/**'],
    include: 'src/**',
    presets: ['@babel/preset-env']
  }),
  postcss({
    extract: false,
    modules: true,
    plugins: [
      atImport(),
      selector(),
      customProperties(),
      sorting(),
      nested()
    ],
    extensions: ['.css'],
    minimize: true
  }),
  // terser(),
  resolve(),
  commonjs()
];

const config = {
  input: 'src/index.js',
  external: Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key)),
  output: {
    file: `dist/${meta.name}.js`,
    name: "d3",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).filter(key => /^d3-/.test(key)).map(key => ({[key]: "d3"})))
  },
  watch: {
    chokidar: false,
    include: ['src/**', 'example/*.html', 'example/data/*.*']
  },
  plugins
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.name}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  }, 
];
