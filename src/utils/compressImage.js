const compressImageToDataUrl = async (
  file,
  { maxBlobSize, maxDataUrlLength, maxDimension = 1600, sizeError = "Image could not be compressed to the size limit" } = {}
) => {
  const imageUrl = URL.createObjectURL(file);
  const image = await new Promise((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = () => reject(new Error("Failed to load image"));
    imageElement.src = imageUrl;
  }).finally(() => URL.revokeObjectURL(imageUrl));

  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  let width = Math.max(1, Math.round(image.naturalWidth * scale));
  let height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Failed to process image");

  let quality = 0.82;
  while (true) {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    let blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.type !== "image/webp") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    }
    if (!blob) throw new Error("Failed to process image");

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Failed to read image"));
      };
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(blob);
    });

    const fitsBlobSize = maxBlobSize === undefined || blob.size <= maxBlobSize;
    const fitsDataUrlLength = maxDataUrlLength === undefined || dataUrl.length <= maxDataUrlLength;
    if (fitsBlobSize && fitsDataUrlLength) return dataUrl;

    if (quality > 0.34) {
      quality = Math.max(0.3, quality - 0.12);
    } else {
      const nextWidth = Math.max(1, Math.floor(width * 0.8));
      const nextHeight = Math.max(1, Math.floor(height * 0.8));
      if (nextWidth === width && nextHeight === height) throw new Error(sizeError);
      width = nextWidth;
      height = nextHeight;
      quality = 0.82;
    }
  }
};

export default compressImageToDataUrl;
