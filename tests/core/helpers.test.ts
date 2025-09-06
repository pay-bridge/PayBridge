import { getURL, toDateTime, getErrorRedirect, calculateTrialEndUnixTimestamp } from '@/core/helpers';

describe('helpers utility', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env.NEXT_PUBLIC_SITE_URL = '';
    process.env.NEXT_PUBLIC_VERCEL_URL = '';
  });

  describe('getURL', () => {
    it('should return the correct URL in different environments', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
      expect(getURL('/path')).toBe('http://localhost:3000/path');

      process.env.NEXT_PUBLIC_SITE_URL = ''; // Unset to test Vercel URL
      process.env.NEXT_PUBLIC_VERCEL_URL = 'https://paybridge.vercel.app';
      expect(getURL('/path')).toBe('https://paybridge.vercel.app/path');
    });
  });

  describe('toDateTime', () => {
    it('should convert a UNIX timestamp to a Date object', () => {
      const timestamp = 1672531199;
      const date = new Date(timestamp * 1000);
      expect(toDateTime(timestamp)).toEqual(date);
    });
  });

  describe('getErrorRedirect', () => {
    it('should construct the correct redirect URL with error parameters', () => {
      const redirect = getErrorRedirect('/path', 'Error', 'Something went wrong');
      const url = new URL(redirect, 'http://localhost');
      expect(url.pathname).toBe('/path');
      expect(url.searchParams.get('error')).toBe('Error');
      expect(url.searchParams.get('error_description')).toBe('Something went wrong');
    });
  });

  describe('calculateTrialEndUnixTimestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate the correct future timestamp', () => {
      const days = 7;
      const now = new Date();
      jest.setSystemTime(now);

      const trialEnd = new Date(now.getTime() + (days + 1) * 24 * 60 * 60 * 1000);
      const timestamp = Math.floor(trialEnd.getTime() / 1000);
      expect(calculateTrialEndUnixTimestamp(days)).toBeCloseTo(timestamp, 0);
    });
  });
});
