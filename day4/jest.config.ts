import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};

export default config;
