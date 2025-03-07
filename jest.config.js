module.exports = {
  // TypeScript files will be handled by ts-jest, and JavaScript files will be handled by babel-jest.
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: [
    'raf/polyfill.js',
    'jest-canvas-mock',
    '<rootDir>/node_modules/regenerator-runtime/runtime'
  ],
  setupFilesAfterEnv: [require.resolve('./test_utils/setupTests.js')],
  testPathIgnorePatterns: [
    '/e2e_tests/',
    '/coverage/',
    '/dist/',
    '/node_modules/'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es|@neo4j/browser-lambda-parser|react-dnd|dnd-core|monaco-editor|internmap|d3-[^-]+)'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|html|css)$':
      '<rootDir>/test_utils/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/test_utils/__mocks__/styleMock.js',
    '^browser-styles(.*)$': '<rootDir>/src/browser/styles$1',
    '^browser-components(.*)$': '<rootDir>/src/browser/components$1',
    '^browser-services(.*)$': '<rootDir>/src/browser/services$1',
    '^browser-hooks(.*)$': '<rootDir>/src/browser/hooks$1',
    'worker-loader': '<rootDir>/test_utils/__mocks__/workerLoaderMock.js',
    'project-root(.*)$': '<rootDir>$1',
    '^monaco-editor$':
      '<rootDir>/node_modules/monaco-editor/esm/vs/editor/editor.main.js'
  },
  modulePaths: ['<rootDir>/src', '<rootDir>/src/shared'],
  collectCoverageFrom: ['**/src/**/*.ts', '**/src/**/*.tsx'],
  coverageThreshold: {
    global: {
      statements: 45,
      branches: 35,
      functions: 35,
      lines: 45
    }
  },
  globals: {
    SEGMENT_KEY: 'a-segment-key'
  }
}
