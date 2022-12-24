import { describe, expect, test } from 'vitest';
import { buildURL } from './functions';

describe('buildURL', () => {
  describe('Acceptance', () => {
    test('Is function', () => {
      expect(buildURL).toBeTypeOf('function');
    });

    test('Returns a string', () => {
      expect(
        buildURL({ API_KEY: '123', API_URL: 'https::/example.com' }),
      ).toBeTypeOf('string');
    });
  });
});
