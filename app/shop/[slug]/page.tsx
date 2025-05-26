"use client"

import { use } from 'react';
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from "@/prismicio";
import { useEffect, useState } from "react";
import { PrismicRichText } from '@prismicio/react';

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const client = createClient();
            const productData = await client.getByUID("featured_arts", slug);
            setProduct(productData);
        };
        fetchData();
    }, [slug]);

    return (
        <div className='min-h-[70vh] bg-primary text-background'>
            <div className='max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20'>
                <div className='flex items-center gap-1 text-sm sm:text-base'>
                    <Link href="/shop">Shop</Link>
                    <div><ChevronRight /></div>
                    <span className='text-secondary'>{product?.data?.title && <PrismicRichText field={product.data.title} />}</span>
                </div>
            </div>
        </div>
    )
}
