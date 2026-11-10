/**
 * Rock-solid, fast image compressor and optimizer.
 * Supports File, Blob, and base64 string inputs.
 * Guarantees never returning an empty string if a valid file was provided.
 */
export async function compressImage(
  fileOrUrl: File | Blob | string,
  maxDimension = 1000,
  quality = 0.82,
  options: {
    aspectRatio?: 'square' | 'banner' | 'maintain' | number;
    padding?: boolean;
    bgColor?: string;
  } = {}
): Promise<string> {
  // If already a hosted cloud or CDN URL (and not data: or blob:), return directly
  if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://'))) {
    return fileOrUrl;
  }

  // Helper to read File/Blob to base64
  const readFileAsDataUrl = (blobOrFile: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blobOrFile);
    });
  };

  try {
    let sourceBase64 = '';
    let mimeType = 'image/jpeg';

    if (typeof fileOrUrl === 'string') {
      if (fileOrUrl.startsWith('data:')) {
        sourceBase64 = fileOrUrl;
        const match = fileOrUrl.match(/data:([^;]+);/);
        if (match) mimeType = match[1];
      } else if (fileOrUrl.startsWith('blob:')) {
        try {
          const res = await fetch(fileOrUrl);
          const b = await res.blob();
          mimeType = b.type || 'image/jpeg';
          sourceBase64 = await readFileAsDataUrl(b);
        } catch {
          sourceBase64 = '';
        }
      } else {
        sourceBase64 = fileOrUrl;
      }
    } else if (typeof fileOrUrl === 'object' && fileOrUrl !== null && 'size' in fileOrUrl) {
      mimeType = (fileOrUrl as any).type || 'image/jpeg';
      sourceBase64 = await readFileAsDataUrl(fileOrUrl as Blob);
    }

    if (!sourceBase64) {
      return '';
    }

    // Downscale via canvas safely with 2.5s hard timeout guarantee
    return new Promise((resolve) => {
      let resolved = false;
      const safeResolve = (val: string) => {
        if (resolved) return;
        resolved = true;
        resolve(val || sourceBase64);
      };

      const fallbackTimer = setTimeout(() => {
        safeResolve(sourceBase64);
      }, 2500);

      const img = new Image();

      img.onload = () => {
        try {
          const origWidth = img.naturalWidth || img.width;
          const origHeight = img.naturalHeight || img.height;

          if (!origWidth || !origHeight) {
            clearTimeout(fallbackTimer);
            safeResolve(sourceBase64);
            return;
          }

          let targetWidth = origWidth;
          let targetHeight = origHeight;
          const maxD = Math.max(200, maxDimension || 1000);

          let drawWidth = origWidth;
          let drawHeight = origHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (options.aspectRatio === 'square' || options.aspectRatio === 1) {
            targetWidth = maxD;
            targetHeight = maxD;
            const scale = Math.min(maxD / origWidth, maxD / origHeight);
            drawWidth = Math.round(origWidth * scale);
            drawHeight = Math.round(origHeight * scale);
            offsetX = Math.round((maxD - drawWidth) / 2);
            offsetY = Math.round((maxD - drawHeight) / 2);
          } else if (options.aspectRatio === 'banner' || options.aspectRatio === 16 / 9) {
            targetWidth = maxD;
            targetHeight = Math.round((maxD * 9) / 16);
            const scale = Math.min(targetWidth / origWidth, targetHeight / origHeight);
            drawWidth = Math.round(origWidth * scale);
            drawHeight = Math.round(origHeight * scale);
            offsetX = Math.round((targetWidth - drawWidth) / 2);
            offsetY = Math.round((targetHeight - drawHeight) / 2);
          } else {
            if (origWidth > origHeight) {
              if (origWidth > maxD) {
                targetWidth = maxD;
                targetHeight = Math.round((origHeight * maxD) / origWidth);
              }
            } else {
              if (origHeight > maxD) {
                targetHeight = maxD;
                targetWidth = Math.round((origWidth * maxD) / origHeight);
              }
            }
            drawWidth = targetWidth;
            drawHeight = targetHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            clearTimeout(fallbackTimer);
            safeResolve(sourceBase64);
            return;
          }

          const isTransparent = mimeType.includes('png') || mimeType.includes('webp') || mimeType.includes('svg');
          if (options.bgColor && options.bgColor !== 'transparent') {
            ctx.fillStyle = options.bgColor;
            ctx.fillRect(0, 0, targetWidth, targetHeight);
          } else {
            ctx.clearRect(0, 0, targetWidth, targetHeight);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          const outputMime = isTransparent ? 'image/png' : 'image/webp';

          let resultDataUrl = '';
          try {
            resultDataUrl = canvas.toDataURL(outputMime, quality);
            if (!resultDataUrl || resultDataUrl === 'data:,') {
              resultDataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            resultDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          clearTimeout(fallbackTimer);
          safeResolve(resultDataUrl || sourceBase64);
        } catch (canvasErr) {
          console.warn("[imageCompressor] Canvas drawing notice:", canvasErr);
          clearTimeout(fallbackTimer);
          safeResolve(sourceBase64);
        }
      };

      img.onerror = (imgErr) => {
        console.warn("[imageCompressor] Image loading notice:", imgErr);
        clearTimeout(fallbackTimer);
        safeResolve(sourceBase64);
      };

      img.src = sourceBase64;
    });
  } catch (err) {
    console.warn("[imageCompressor] Compression exception:", err);
    return '';
  }
}
