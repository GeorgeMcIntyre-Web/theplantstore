import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentForm } from './payment-form';

// Mock useCart hook
jest.mock('@/hooks/use-cart', () => ({
  useCart: () => ({
    items: [
      { id: '1', product: { id: 'p1', name: 'Plant 1', price: 100 }, quantity: 2 },
    ],
    totalAmount: 200,
  }),
}));

// Mock YocoSDK
beforeAll(() => {
  window.YocoSDK = jest.fn().mockImplementation(() => ({
    showPopup: jest.fn().mockResolvedValue({ token: { id: 'tok_test' } }),
  }));
});

describe('PaymentForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const customerDetails = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
  };
  const shippingDetails = {
    address: '123 Test St',
    city: 'Testville',
    province: 'GAUTENG',
    postalCode: '0001',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch for payment API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ orderNumber: 'ORDER123' }),
      })
    ) as jest.Mock;
  });

  it('renders the payment form', () => {
    render(
      <PaymentForm
        onPaymentSuccess={mockOnSuccess}
        onPaymentError={mockOnError}
        customerDetails={customerDetails}
        shippingDetails={shippingDetails}
      />
    );
    expect(screen.getByText(/Payment Details/)).toBeInTheDocument();
    expect(screen.getByText(/Order Summary/)).toBeInTheDocument();
    expect(screen.getByText(/Customer Details/)).toBeInTheDocument();
    expect(screen.getByText(/Shipping Address/)).toBeInTheDocument();
  });

  it('submits payment and calls onPaymentSuccess', async () => {
    render(
      <PaymentForm
        onPaymentSuccess={mockOnSuccess}
        onPaymentError={mockOnError}
        customerDetails={customerDetails}
        shippingDetails={shippingDetails}
      />
    );
    // Wait for YocoSDK to load
    await waitFor(() => expect(window.YocoSDK).toBeDefined());
    const payButton = screen.getByRole('button', { name: /pay/i });
    fireEvent.click(payButton);
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles payment error', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Payment failed' }) })
    );
    render(
      <PaymentForm
        onPaymentSuccess={mockOnSuccess}
        onPaymentError={mockOnError}
        customerDetails={customerDetails}
        shippingDetails={shippingDetails}
      />
    );
    await waitFor(() => expect(window.YocoSDK).toBeDefined());
    const payButton = screen.getByRole('button', { name: /pay/i });
    fireEvent.click(payButton);
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalled();
    });
  });
}); 