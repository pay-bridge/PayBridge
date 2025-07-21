import * as clientAuth from '@/core/users/auth-helpers/client';

const signInWithOAuthMock = jest.fn();
jest.mock('@/core/users/supabase/client', () => ({
  createClient: () => ({
    auth: { signInWithOAuth: signInWithOAuthMock }
  })
}));
jest.mock('@/core/helpers', () => ({
  ...jest.requireActual('@/core/helpers'),
  getURL: jest.fn(() => 'http://localhost/auth/callback'),
}));
jest.mock('@/core/users/auth-helpers/server', () => ({
  redirectToPath: jest.fn(() => Promise.resolve('redirected')),
}));

describe('auth-helpers/client', () => {
  it('handleRequest calls preventDefault, requestFunc, and router.push', async () => {
    const preventDefault = jest.fn();
    const formData = new window.FormData();
    const requestFunc = jest.fn().mockResolvedValue('/redirect');
    const push = jest.fn();
    const router = { push };
    const e = { preventDefault, currentTarget: document.createElement('form') } as any;
    await clientAuth.handleRequest(e, requestFunc, router as any);
    expect(preventDefault).toHaveBeenCalled();
    expect(requestFunc).toHaveBeenCalledWith(expect.any(FormData));
    expect(push).toHaveBeenCalledWith('/redirect');
  });

  it('handleRequest calls redirectToPath if no router', async () => {
    const preventDefault = jest.fn();
    const formData = new window.FormData();
    const requestFunc = jest.fn().mockResolvedValue('/redirect');
    const e = { preventDefault, currentTarget: document.createElement('form') } as any;
    const { redirectToPath } = require('@/core/users/auth-helpers/server');
    await clientAuth.handleRequest(e, requestFunc, null);
    expect(redirectToPath).toHaveBeenCalledWith('/redirect');
  });

  it('signInWithOAuth calls preventDefault and supabase.auth.signInWithOAuth', async () => {
    const preventDefault = jest.fn();
    const form = document.createElement('form');
    const input = document.createElement('input');
    input.name = 'provider';
    input.value = 'github';
    form.appendChild(input);
    const e = { preventDefault, currentTarget: form } as any;
    await clientAuth.signInWithOAuth(e);
    expect(preventDefault).toHaveBeenCalled();
    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: 'http://localhost/auth/callback' },
    });
  });
}); 