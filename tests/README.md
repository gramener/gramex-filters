# Tests

- Use [`jest-puppeteer`](https://npmjs.com/package/jest-puppeteer) to integrate with puppeteer
- Use [`http-server`](https://npmjs.com/package/http-server) to serve the test files
- Write tests in TypeScript as `tests/*.test.ts`
  - Avoid ES Modules in tests. [Jest support for ES Modules is experimental](https://jestjs.io/docs/ecmascript-modules)
  - Compile with `esbuild tests/*.test.ts` in `npm run build`.
    - Avoid [`ts-jest`](https://npmjs.com/package/ts-jest) because it requires `jest.preset: "ts-jest"`
      that conflicts with `jest.preset: "jest-puppeteer"`.
  - Set `jest.testMatch: ["**/*.test.js"]` to test generated `*.js` and ignore `*.ts`
