import * as meta from "./package.json" assert { type: "json" };

// ------ JavaScript
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';

// ------ CSS
import sass from 'rollup-plugin-sass';

// ------ global
import resolve from '@rollup/plugin-node-resolve';


const plugins = [
  eslint({
    include: ['src/**/*.js']
  }),
  babel({
    babelHelpers: 'bundled',
    include: 'src/**',
    presets: ['@babel/preset-env']
  }),
  // terser(),
  sass({ output: true }),
  resolve(),
  commonjs()
];

const config = {
  input: 'src/index.js',
  external: Object.keys(meta.default.dependencies || {}).filter(key => /^d3-/.test(key)),
  output: {
    file: `dist/${meta.default.name}.js`,
    name: "d3",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.default.homepage} v${meta.default.version} Copyright ${(new Date).getFullYear()} ${meta.default.author.name}`,
    globals: Object.assign({}, ...Object.keys(meta.default.dependencies || {}).filter(key => /^d3-/.test(key)).map(key => ({[key]: "d3"})))
  },
  watch: {
    chokidar: false,
    include: ['src/**', 'styles/**', 'example/*.html', 'example/data/*.*']
  },
  plugins
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${meta.default.name}.min.js`
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
