// Use real constructor functions for PayPal SDK mocks
const MockOrdersCreateRequest = jest.fn(function (this: any) {
  this.prefer = jest.fn().mockReturnThis();
  this.requestBody = jest.fn().mockReturnThis();
});
const MockOrdersCaptureRequest = jest.fn(function (this: any) {
  this.requestBody = jest.fn().mockReturnThis();
});
const MockCapturesRefundRequest = jest.fn(function (this: any) {
  this.requestBody = jest.fn().mockReturnThis();
});

var mockExecute = jest.fn();

jest.mock('@paypal/checkout-server-sdk', () => ({
  __esModule: true,
  default: {
    core: {
      SandboxEnvironment: jest.fn(),
      LiveEnvironment: jest.fn(),
      PayPalHttpClient: jest.fn(() => ({ execute: mockExecute })),
    },
    orders: {
      OrdersCreateRequest: MockOrdersCreateRequest,
      OrdersCaptureRequest: MockOrdersCaptureRequest,
    },
    payments: {
      CapturesRefundRequest: MockCapturesRefundRequest,
    },
  }
}));

import * as paypalAdapter from '@/core/payments/adapters/paypal/adapter';

global.console = { ...global.console, error: jest.fn(), log: jest.fn() };

describe('paypal/adapter', () => {
  let paypalAdapter: typeof import('@/core/payments/adapters/paypal/adapter');

  beforeAll(async () => {
    paypalAdapter = await import('@/core/payments/adapters/paypal/adapter');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createOrder returns result on success', async () => {
    mockExecute.mockResolvedValue({ result: { id: 'order_1', status: 'CREATED' } });
    const result = await paypalAdapter.createOrder({
      amount: '10.00',
      currency: 'USD',
      returnUrl: 'https://return',
      cancelUrl: 'https://cancel',
    });
    expect(result).toEqual({ id: 'order_1', status: 'CREATED' });
    expect(MockOrdersCreateRequest).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
  });

  it('createOrder throws on PayPal error', async () => {
    mockExecute.mockRejectedValue(new Error('paypal error'));
    await expect(
      paypalAdapter.createOrder({
        amount: '10.00',
        currency: 'USD',
        returnUrl: 'https://return',
        cancelUrl: 'https://cancel',
      })
    ).rejects.toThrow('paypal error');
  });

  it('captureOrder returns result on success', async () => {
    mockExecute.mockResolvedValue({ result: { id: 'capture_1', status: 'COMPLETED' } });
    const result = await paypalAdapter.captureOrder('order_1');
    expect(result).toEqual({ id: 'capture_1', status: 'COMPLETED' });
    expect(MockOrdersCaptureRequest).toHaveBeenCalledWith('order_1');
    expect(mockExecute).toHaveBeenCalled();
  });

  it('captureOrder throws on PayPal error', async () => {
    mockExecute.mockRejectedValue(new Error('paypal error'));
    await expect(paypalAdapter.captureOrder('order_1')).rejects.toThrow('paypal error');
  });

  it('refundOrder returns result on success', async () => {
    mockExecute.mockResolvedValue({ result: { id: 'refund_1', status: 'COMPLETED' } });
    const result = await paypalAdapter.refundOrder('capture_1', '10.00', 'USD');
    expect(result).toEqual({ id: 'refund_1', status: 'COMPLETED' });
    expect(MockCapturesRefundRequest).toHaveBeenCalledWith('capture_1');
    expect(mockExecute).toHaveBeenCalled();
  });

  it('refundOrder throws on PayPal error', async () => {
    mockExecute.mockRejectedValue(new Error('paypal error'));
    await expect(paypalAdapter.refundOrder('capture_1', '10.00', 'USD')).rejects.toThrow('paypal error');
  });
}); 