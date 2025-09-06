import * as serverAuth from '@/core/users/auth-helpers/server';

const signOutMock = jest.fn();
const signInWithOtpMock = jest.fn();
const resetPasswordForEmailMock = jest.fn();
const signInWithPasswordMock = jest.fn();
const signUpMock = jest.fn();
const updateUserMock = jest.fn();

jest.mock('@/core/users/supabase/server', () => ({
  createClient: () => ({
    auth: {
      signOut: signOutMock,
      signInWithOtp: signInWithOtpMock,
      resetPasswordForEmail: resetPasswordForEmailMock,
      signInWithPassword: signInWithPasswordMock,
      signUp: signUpMock,
      updateUser: updateUserMock,
    },
  }),
}));
jest.mock('next/headers', () => ({
  cookies: () => ({ set: jest.fn() })
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));
jest.mock('@/core/helpers', () => ({
  getURL: jest.fn(() => 'http://localhost/callback'),
  getErrorRedirect: jest.fn((path, error, desc) => `/redirect?error=${error}&desc=${desc}`),
  getStatusRedirect: jest.fn((path, status, desc) => `/redirect?status=${status}`),
}));
jest.mock('@/core/users/auth-helpers/settings', () => ({
  getAuthTypes: jest.fn(() => ({ allowPassword: true })),
}));

describe('auth-helpers/server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SignOut returns /signin on success', async () => {
    signOutMock.mockResolvedValue({ error: null });
    const result = await serverAuth.SignOut(new FormData());
    expect(result).toBe('/signin');
  });

  it('SignOut returns error redirect on error', async () => {
    signOutMock.mockResolvedValue({ error: { message: 'fail' } });
    const result = await serverAuth.SignOut(new FormData());
    expect(result).toContain('Hmm... Something went wrong.');
  });

  it('signInWithEmail returns error redirect for invalid email', async () => {
    const formData = new FormData();
    formData.set('email', 'invalid');
    const result = await serverAuth.signInWithEmail(formData);
    expect(result).toContain('Invalid email address.');
  });

  it('signInWithEmail returns error redirect on signInWithOtp error', async () => {
    signInWithOtpMock.mockResolvedValue({ error: { message: 'otp error' }, data: null });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    const result = await serverAuth.signInWithEmail(formData);
    expect(result).toContain('You could not be signed in.');
  });

  it('signInWithEmail returns status redirect on success', async () => {
    signInWithOtpMock.mockResolvedValue({ error: null, data: { user: {} } });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    const result = await serverAuth.signInWithEmail(formData);
    expect(result).toContain('Success!');
  });

  it('requestPasswordUpdate returns error redirect for invalid email', async () => {
    const formData = new FormData();
    formData.set('email', 'invalid');
    const result = await serverAuth.requestPasswordUpdate(formData);
    expect(result).toContain('Invalid email address.');
  });

  it('requestPasswordUpdate returns error redirect on error', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: { message: 'reset error' }, data: null });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    const result = await serverAuth.requestPasswordUpdate(formData);
    expect(result).toContain('reset error');
  });

  it('requestPasswordUpdate returns status redirect on success', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null, data: { user: {} } });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    const result = await serverAuth.requestPasswordUpdate(formData);
    expect(result).toContain('Success!');
  });

  it('signInWithPassword returns error redirect on error', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: 'pw error' }, data: {} });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'pw');
    const result = await serverAuth.signInWithPassword(formData);
    expect(result).toContain('Sign in failed.');
  });

  it('signInWithPassword returns status redirect on success', async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null, data: { user: {} } });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'pw');
    const result = await serverAuth.signInWithPassword(formData);
    expect(result).toContain('Success!');
  });

  it('signUp returns error redirect for invalid email', async () => {
    const formData = new FormData();
    formData.set('email', 'invalid');
    formData.set('password', 'pw');
    const result = await serverAuth.signUp(formData);
    expect(result).toContain('Invalid email address.');
  });

  it('signUp returns error redirect on error', async () => {
    signUpMock.mockResolvedValue({ error: { message: 'signup error' }, data: {} });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'pw');
    const result = await serverAuth.signUp(formData);
    expect(result).toContain('Sign up failed.');
  });

  it('signUp returns status redirect on session', async () => {
    signUpMock.mockResolvedValue({ error: null, data: { session: {} } });
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', 'pw');
    const result = await serverAuth.signUp(formData);
    expect(result).toContain('Success!');
  });

  it('updatePassword returns error redirect if passwords do not match', async () => {
    const formData = new FormData();
    formData.set('password', 'pw1');
    formData.set('passwordConfirm', 'pw2');
    const result = await serverAuth.updatePassword(formData);
    expect(result).toContain('Passwords do not match.');
  });

  it('updatePassword returns error redirect on error', async () => {
    updateUserMock.mockResolvedValue({ error: { message: 'update error' }, data: {} });
    const formData = new FormData();
    formData.set('password', 'pw');
    formData.set('passwordConfirm', 'pw');
    const result = await serverAuth.updatePassword(formData);
    expect(result).toContain('Your password could not be updated.');
  });

  it('updatePassword returns status redirect on success', async () => {
    updateUserMock.mockResolvedValue({ error: null, data: { user: {} } });
    const formData = new FormData();
    formData.set('password', 'pw');
    formData.set('passwordConfirm', 'pw');
    const result = await serverAuth.updatePassword(formData);
    expect(result).toContain('Success!');
  });

  it('updateEmail returns error redirect for invalid email', async () => {
    const formData = new FormData();
    formData.set('newEmail', 'invalid');
    const result = await serverAuth.updateEmail(formData);
    expect(result).toContain('Invalid email address.');
  });

  it('updateEmail returns error redirect on error', async () => {
    updateUserMock.mockResolvedValue({ error: { message: 'email error' } });
    const formData = new FormData();
    formData.set('newEmail', 'test@example.com');
    const result = await serverAuth.updateEmail(formData);
    expect(result).toContain('email error');
  });

  it('updateEmail returns status redirect on success', async () => {
    updateUserMock.mockResolvedValue({ error: null });
    const formData = new FormData();
    formData.set('newEmail', 'test@example.com');
    const result = await serverAuth.updateEmail(formData);
    expect(result).toContain('Confirmation emails sent.');
  });

  it('updateName returns error redirect on error', async () => {
    updateUserMock.mockResolvedValue({ error: { message: 'name error' }, data: {} });
    const formData = new FormData();
    formData.set('fullName', 'Test User');
    const result = await serverAuth.updateName(formData);
    expect(result).toContain('Your name could not be updated.');
  });

  it('updateName returns status redirect on success', async () => {
    updateUserMock.mockResolvedValue({ error: null, data: { user: {} } });
    const formData = new FormData();
    formData.set('fullName', 'Test User');
    const result = await serverAuth.updateName(formData);
    expect(result).toContain('Success!');
  });
}); 