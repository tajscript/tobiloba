"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cartContext';

interface CartIconProps {
  className?: string;
  showBadge?: boolean;
  size?: number;
}

const CartIcon: React.FC<CartIconProps> = ({ 
  className = '', 
  showBadge = true, 
  size = 24 
}) => {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className={`flex ${className}`}>
      <ShoppingCart size={size} className="hover:opacity-80 flex transition-opacity text-primary" />
      {showBadge && totalItems > 0 && (
        <span className="text-primary text-sm font-bold rounded-full h-5 w-5 items-center justify-center min-w-[20px]">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;