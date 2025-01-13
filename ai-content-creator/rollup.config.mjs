import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/plugin.ts',
  output: {
    dir: 'com.elgato.ai-content-creator.sdPlugin',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSources: true
    }),
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs()
  ],
  external: ['ws', 'openai']
}; 