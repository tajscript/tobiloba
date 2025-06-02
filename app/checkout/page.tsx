"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/cartContext';
import { ArrowLeft, Lock, CreditCard, Truck, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const CheckoutForm: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state'];
    return required.every(field => customerInfo[field as keyof CustomerInfo].trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    if (!validateForm()) {
      setPaymentError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: 'ngn',
          items: items,
          customerInfo: customerInfo
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment');
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.postalCode,
              country: customerInfo.country === 'Nigeria' ? 'NG' : customerInfo.country,
            }
          }
        }
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setOrderComplete(true);
        clearCart();
        
        // // Send confirmation email (optional)
        // fetch('/api/send-confirmation', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     paymentIntentId: paymentIntent.id,
        //     customerInfo,
        //     items,
        //     totalPrice
        //   }),
        // }).catch(console.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An error occurred while processing your payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-[70vh] bg-primary text-background">
        <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h1 className="text-3xl font-bold text-secondary mb-4">Your Cart is Empty</h1>
            <p className="text-lg mb-6">Add some items to your cart before checking out.</p>
            <Link 
              href="/shop"
              className="bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-[70vh] bg-primary text-background">
        <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="bg-green-100 text-green-800 p-4 rounded-full mb-6">
              <Shield size={48} />
            </div>
            <h1 className="text-3xl font-bold text-secondary mb-4">Order Complete!</h1>
            <p className="text-lg mb-6">Thank you for your purchase! You'll receive a confirmation email shortly.</p>
            <div className="space-x-4">
              <Link 
                href="/shop"
                className="bg-secondary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-primary text-background">
      <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/cart"
            className="flex items-center gap-2 text-secondary hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-secondary">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-background text-primary p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name *"
                  value={customerInfo.firstName}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name *"
                  value={customerInfo.lastName}
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-background text-primary p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Truck size={20} />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address *"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={customerInfo.state}
                    onChange={handleInputChange}
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  <select
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-background text-primary p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Information
              </h2>
              <div className="mb-4">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                  className="p-3 border border-gray-300 rounded-md"
                />
              </div>
              
              {paymentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {paymentError}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Lock size={16} />
                Your payment information is secure and encrypted
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSubmit}
              disabled={!stripe || isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-secondary text-primary hover:bg-opacity-90'
              }`}
            >
              {isProcessing ? 'Processing...' : `Complete Order - ₦${totalPrice.toLocaleString()}`}
            </button>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-background text-primary p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size || 'original'}`} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.type} {item.size && `• ${item.size}`}
                      </p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-secondary">Check you email</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-background text-primary p-4 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-green-600" size={20} />
                <span className="font-medium">Secure Checkout</span>
              </div>
              <p className="text-sm text-gray-600">
                Your personal and payment information is protected with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;