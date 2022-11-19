/* eslint-disable @typescript-eslint/no-var-requires */

import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { terser } from 'rollup-plugin-terser';

/** @type {(value: string) => import('rollup').RollupOptions} */
const bundleDts = value => ({
  input: `src/${value}.ts`,
  external: id => !/^[./]/.test(id),
  plugins: [dts()],
  output: {
    format: 'es',
    file: `lib/${value}.d.ts`,
  },
});

/** @type {() => import('rollup').RollupOptions} */
const bundleJS = () => {
  return {
    input: `src/index.ts`,
    external: ['@bemedev/x-matches', 'xstate', 'dequal'],
    plugins: [esbuild(), terser({})],
    output: [
      {
        format: 'cjs',
        sourcemap: true,
        dir: `lib`,
        preserveModulesRoot: 'src',
        preserveModules: true,
        entryFileNames: '[name].js',
        exports: 'named',
      },
      {
        format: 'es',
        sourcemap: true,
        dir: `lib`,
        preserveModulesRoot: 'src',
        preserveModules: true,
        entryFileNames: '[name].mjs',
      },
    ],
  };
};

/** @type {(...values: string[]) => import('rollup').RollupOptions[]} */
const bundles = (...values) => {
  const types = values.map(bundleDts);
  const jss = bundleJS();
  const out = [...types, jss];
  return out;
};

const config = bundles('assign', 'guard', 'index', 'send');

export default config;
