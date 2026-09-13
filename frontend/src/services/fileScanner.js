function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
async function ocrImage(source, onProgress) {
    if (!window.Tesseract)
        return '';
    const result = await window.Tesseract.recognize(source, 'eng', { logger: (message) => onProgress?.(Math.round((message.progress ?? 0) * 100)) });
    return result.data.text;
}
export async function scanLocalFile(file, onProgress) {
    const previewUrl = await readAsDataUrl(file);
    if (file.type.startsWith('image/')) {
        const image = new Image();
        image.src = previewUrl;
        await new Promise((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Image could not be loaded')); });
        const text = await ocrImage(image, onProgress);
        return [{ page: 1, pageCount: 1, text, previewUrl }];
    }
    // A browser-only implementation keeps the original PDF intact for preview. If a
    // local OCR runtime is present, callers can provide extracted text; otherwise the
    // filename remains a safe classification hint instead of contacting a service.
    onProgress?.(100);
    return [{ page: 1, pageCount: 1, text: file.name.replace(/[_-]/g, ' '), previewUrl }];
}
