'use client';

import { IMAGES } from '@/lib/images';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type CourseImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

export function CourseImage({ src, alt, className, fill, width, height, sizes }: CourseImageProps) {
  const [imgSrc, setImgSrc] = useState(src || IMAGES.fallback);

  useEffect(() => {
    setImgSrc(src || IMAGES.fallback);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={cn('object-cover', className)}
      onError={() => setImgSrc(IMAGES.fallback)}
    />
  );
}
