import * as settings from '@/core/users/auth-helpers/settings';

describe('auth-helpers/settings', () => {
  it('getAuthTypes returns correct toggles', () => {
    expect(settings.getAuthTypes()).toEqual({ allowOauth: true, allowEmail: true, allowPassword: true });
  });

  it('getViewTypes returns correct view types', () => {
    expect(settings.getViewTypes()).toEqual([
      'email_signin',
      'password_signin',
      'forgot_password',
      'update_password',
      'signup',
    ]);
  });

  it('getDefaultSignInView returns password_signin if preferred is not set', () => {
    expect(settings.getDefaultSignInView(null)).toBe('password_signin');
  });

  it('getDefaultSignInView returns preferred if valid', () => {
    expect(settings.getDefaultSignInView('signup')).toBe('signup');
  });

  it('getRedirectMethod returns client', () => {
    expect(settings.getRedirectMethod()).toBe('client');
  });
}); 