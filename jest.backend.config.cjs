// .cjs extension deliberately — root package.json sets "type": "module",
// and a plain jest.config.js would be parsed as ESM, breaking this
// CommonJS-style config (module.exports). Same class of ambiguity that
// broke the backend's own build before it was fixed (see CHANGELOG
// [0.1.1.0], M1.6) — side-stepped here the same way, by being explicit
// about the file's own module system rather than fighting the root one.
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/backend/**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.backend.json" }],
  },
  // The harness (src/harness/*.ts) uses ESM-style relative imports ending
  // in .js that refer to sibling .ts files (e.g. "./state.js" from
  // graph.ts) — real Node ESM and tsx both remap that at runtime, but
  // ts-jest's CJS-oriented resolver doesn't. Only relevant to backend code
  // that touches GraphService's dynamic import() of the harness.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
