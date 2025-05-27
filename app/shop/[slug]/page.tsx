"use client";

import { ChevronRight, ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, use } from 'react';
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { useCart } from '@/contexts/cartContext';

const Page = ({ params }: { params: Promise<{ slug: string }> }) => {
    // Unwrap the params Promise using React.use()
    const { slug } = use(params);

    const [product, setProduct] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [justAdded, setJustAdded] = useState<boolean>(false);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            const client = createClient();
            const productData = await client.getByUID("featured_arts", slug);
            setProduct(productData);
        };
        fetchData();
    }, [slug]);

    if (!product) return <div className='min-h-[70vh] flex items-center justify-center w-full bg-primary text-background text-lg'>Loading...</div>;

    const data = product.data;
    const isPrint = data.art_type === "PRINT";
    const isSoldOut = data.sold_out;

    const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = data.print_options.find(
            (item: any) => item.print_size[0]?.text === e.target.value
        );
        setSelectedSize(e.target.value);
        setSelectedPrice(selected?.print_price || 0);
    };

    const handleAddToCart = async () => {
        if (isPrint && (!selectedSize || selectedPrice === 0)) {
            alert('Please select a size before adding to cart');
            return;
        }

        setIsAdding(true);

        try {
            // For multiple quantities, add each item individually
            for (let i = 0; i < quantity; i++) {
                const cartItem = {
                    id: product.id,
                    title: data.title[0]?.text || 'Untitled',
                    price: isPrint ? selectedPrice : data.amount,
                    image: data.image.url || '',
                    size: isPrint ? selectedSize : data.size,
                    type: data.art_type as "PRINT" | "ORIGINAL",
                    slug: slug,
                };

                addToCart(cartItem);
            }

            // Show success feedback
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);

            // Reset quantity for prints
            if (isPrint) {
                setQuantity(1);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding item to cart. Please try again.');
        } finally {
            setIsAdding(false);
        }
    };

    const totalPrice = isPrint ? selectedPrice * quantity : data.amount;

    return (
        <div className="min-h-[70vh] bg-primary text-background">
            <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-sm sm:text-base mb-5">
                    <Link href="/shop" className="text-secondary hover:underline">Shop</Link>
                    <ChevronRight />
                    <span>{data.title[0]?.text}</span>
                </div>

                {/* Art Image and Info */}
                <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-10">
                    <div>
                        <PrismicNextImage field={data.image} className="w-full object-cover rounded-2xl" />
                    </div>

                    <div className="space-y-4 flex flex-col items-center">
                        <h1 className="text-xl text-secondary">
                            <PrismicRichText field={data.title} />
                        </h1>

                        {isPrint ? (
                            <>
                                <div>
                                    <label className="block mb-1 text-center">Size:</label>
                                    <select
                                        className="p-2 bg-transparent text-background border border-background rounded-md w-full"
                                        onChange={handleSizeChange}
                                        value={selectedSize || ''}
                                    >
                                        <option value="" className='bg-background text-primary p-1'>-- Choose Size --</option>
                                        {data.print_options.map((item: any, index: number) => (
                                            <option key={index} value={item.print_size[0]?.text} className='bg-background text-primary'>
                                                {item.print_size[0]?.text} - ${item.print_price?.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-1 mt-3 text-center">Quantity:</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="p-2 w-20 bg-transparent text-background border border-background rounded-md text-center focus:outline-none"
                                    />
                                </div>

                                <div className="mt-2 font-bold text-lg">
                                    Total: ${totalPrice?.toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-xl font-bold">${data.amount?.toLocaleString()}</div>
                                <div className="text-lg font-medium">Size: {data.size}</div>
                            </>
                        )}

                        {/* Cart Button */}
                        <div className="mt-5 space-y-3">
                            {isSoldOut ? (
                                <div className="text-red-500 font-semibold text-lg">Sold Out</div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAdding || (isPrint && !selectedSize)}
                                    className={`w-full flex items-center justify-center gap-2 py-2 px-6 font-semibold transition-color rounded-full ease-in-out duration-300 cursor-pointer ${justAdded
                                        ? 'bg-secondary text-primary'
                                        : isAdding || (isPrint && !selectedSize)
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-primary'
                                        }`}
                                >
                                    {justAdded ? (
                                        <>
                                            <Check size={20} />
                                            ADDED TO CART!
                                        </>
                                    ) : isAdding ? (
                                        'Adding...'
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} />
                                            ADD TO CART
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="text-center sm:text-lg">
                            <PrismicRichText field={data.description} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;