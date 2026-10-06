import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ArtImage from '@/components/ArtImage';
import EnquiryButton from '@/components/EnquiryButton';
import Paragraphs from '@/components/Paragraphs';
import type { Artwork } from '@/lib/types';

interface ProductDetailProps {
    artwork: Artwork;
    enquiryLabel: string;
    enquiryLink: string;
}

const ProductDetail = ({ artwork, enquiryLabel, enquiryLink }: ProductDetailProps) => {
    return (
        <div className="min-h-[70vh] bg-primary text-background">
            <div className="max-w-[1563px] mx-auto px-5 py-5 sm:p-10 lg:px-20">
                <div className="flex items-center gap-1 text-sm sm:text-base mb-5">
                    <Link href="/shop" className="text-secondary hover:underline">Shop</Link>
                    <ChevronRight />
                    <span>{artwork.title}</span>
                </div>

                <div className="grid grid-cols-1 items-center md:grid-cols-2 gap-10">
                    <div className='w-full flex items-center justify-center'>
                        <ArtImage image={artwork.image} alt={artwork.image.alt || artwork.title} priority sizes="(min-width: 768px) 50vw, 100vw" className="w-full object-cover rounded-2xl sm:w-[30rem] sm:h-[30rem] lg:w-[35rem] lg:h-[35rem]" />
                    </div>

                    <div className="space-y-4 flex flex-col items-center">
                        <h1 className="text-xl text-secondary">{artwork.title}</h1>

                        {artwork.price > 0 && <div className="text-xl font-bold">${artwork.price.toLocaleString()}</div>}
                        {artwork.size && <div className="text-lg font-medium">Size: {artwork.size}</div>}

                        <div className="mt-5 w-full flex flex-col items-center justify-center">
                            {artwork.soldOut ? (
                                <div className="text-red-500 font-semibold text-lg text-center">Sold Out</div>
                            ) : (
                                <EnquiryButton artTitle={artwork.title} label={enquiryLabel} link={enquiryLink} />
                            )}
                        </div>

                        <div className="text-center sm:text-lg">
                            <Paragraphs text={artwork.description} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
