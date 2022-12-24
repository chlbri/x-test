import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import typescript from 'rollup-plugin-typescript2';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  plugins: [typescript(), tsConfigPaths()],
  external: ['dequal', '@bemedev/x-matches', 'xstate', 'deepmerge'],
  output: [
    {
      format: 'es',
      file: 'lib/index.d.ts',
    },
    {
      format: 'cjs',
      sourcemap: true,
      dir: `lib`,
      preserveModulesRoot: 'src',
      preserveModules: true,
      entryFileNames: '[name].js',
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
