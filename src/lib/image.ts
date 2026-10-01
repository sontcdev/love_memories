export async function compressImage(
    file: File,
    targetSizeKB: number = 50,
    maxWidth: number = 1920
): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = document.createElement("img");

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            let { width, height } = img;
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            let quality = 0.9;
            let minQuality = 0.1;
            let maxQuality = 1.0;
            const targetBytes = targetSizeKB * 1024;

            const findOptimalQuality = (attempts: number = 0): void => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to compress image"));
                            return;
                        }

                        if (blob.size <= targetBytes || attempts >= 8) {
                            const compressedFile = new File([blob], file.name, {
                                type: "image/jpeg",
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                            return;
                        }

                        if (blob.size > targetBytes) {
                            maxQuality = quality;
                            quality = (minQuality + quality) / 2;
                        } else {
                            minQuality = quality;
                            quality = (maxQuality + quality) / 2;
                        }

                        findOptimalQuality(attempts + 1);
                    },
                    "image/jpeg",
                    quality
                );
            };

            findOptimalQuality();
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error("Không thể tải ảnh"));
        };
        img.src = URL.createObjectURL(file);
    });
}
