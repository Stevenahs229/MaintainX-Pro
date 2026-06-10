import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import catalog from '../../data/explicitImages.json';

export const INDUSTRIAL_FALLBACK = catalog.defaultEquipment[0] || '/pictures/accueil.jpg';

/** Prefer bundled local assets over legacy external URLs. */
export function normalizeImageSrc(src?: string | null): string {
  if (!src) return INDUSTRIAL_FALLBACK;
  if (src.startsWith('/pictures/')) return src;
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  if (/^https?:\/\//i.test(src)) return INDUSTRIAL_FALLBACK;
  return src.startsWith('/') ? src : `/${src}`;
}

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement>;

export default function SafeImage({ src, alt = '', onError, ...props }: SafeImageProps) {
  const [current, setCurrent] = useState(() => normalizeImageSrc(src));

  useEffect(() => {
    setCurrent(normalizeImageSrc(src));
  }, [src]);

  return (
    <img
      {...props}
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={e => {
        if (current !== INDUSTRIAL_FALLBACK) setCurrent(INDUSTRIAL_FALLBACK);
        onError?.(e);
      }}
    />
  );
}
