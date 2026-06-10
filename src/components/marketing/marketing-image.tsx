'use client';

import { IMAGES } from '@/lib/images';
import { cn } from '@/lib/utils';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type MarketingImageProps = Omit<ImageProps, 'quality'> & {
  cinematic?: boolean;
};

export function MarketingImage({ className, cinematic, alt, src, onError, ...props }: MarketingImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      alt={alt}
      src={imgSrc}
      quality={90}
      className={cn(cinematic && 'brightness-[1.06] contrast-[1.04] saturate-[1.1]', className)}
      onError={(e) => {
        setImgSrc(IMAGES.fallback);
        onError?.(e);
      }}
      {...props}
    />
  );
}
