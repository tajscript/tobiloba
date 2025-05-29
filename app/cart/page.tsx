"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/cartContext';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  console.log("totalPrice", totalPrice)

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-primary text-background">
        <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
          <h3 className="text-background">
            SHOPPING CART
          </h3>

          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-lg mb-6">Uh oh! It's empty here</p>
            <Link
              href="/shop"
              className="border border-secondary text-secondary px-7 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-primary text-background">
      <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="flex items-center gap-2 text-secondary hover:underline"
            >
              <ArrowLeft size={20} />
              Continue Shopping
            </Link>
          </div>
          {/* <h1 className=" font-bold text-secondary">Shopping Cart ({totalItems})</h1> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size || 'original'}`}
                className="bg-primary text-background p-4 rounded-lg shadow-md"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">
                          <Link
                            href={`/shop/${item.slug}`}
                            className="hover:text-secondary transition-colors"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-gray-400">
                          {item.type} {item.size && `• ${item.size}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-background transition-colors cursor-pointer"
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                          className="p-1 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-medium sm:w-12">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                          className="p-1 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="">{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background text-primary p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Items ({totalItems}):</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-secondary">Check your email</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-secondary text-primary py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors mb-3">
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </button>

              <div className='w-full text-center'>
                <button
                  onClick={clearCart}
                  className=" underline text-secondary py-2 rounded-lg font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;