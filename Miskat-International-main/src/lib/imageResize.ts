export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality?: number; // 0-1, default 0.85
  format?: 'image/jpeg' | 'image/webp';
}

export const RESIZE_PRESETS = {
  product: { maxWidth: 800, maxHeight: 800, quality: 0.85 } as ResizeOptions,
  heroBanner: { maxWidth: 1920, maxHeight: 600, quality: 0.85 } as ResizeOptions,
  promoBanner: { maxWidth: 960, maxHeight: 600, quality: 0.85 } as ResizeOptions,
  category: { maxWidth: 200, maxHeight: 200, quality: 0.85 } as ResizeOptions,
};

export function resizeImage(file: File, options: ResizeOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const { maxWidth, maxHeight, quality = 0.85, format = 'image/jpeg' } = options;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to resize image'));
        },
        format,
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function generateFileName(prefix: string): string {
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
}
