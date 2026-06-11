const MAX_WIDTH = 720;
const JPEG_QUALITY = 0.55;

function downscale(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
  if (!dataUrl.startsWith('data:image')) return Promise.resolve(dataUrl);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / (img.naturalWidth || maxWidth));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((img.naturalWidth || maxWidth) * scale));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || maxWidth) * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Compress scan captures before API upload (Netlify payload limit). */
export async function compressScanImages(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map(u => downscale(u, MAX_WIDTH, JPEG_QUALITY)));
}

export { MAX_WIDTH as SCAN_MAX_WIDTH, JPEG_QUALITY as SCAN_JPEG_QUALITY };
