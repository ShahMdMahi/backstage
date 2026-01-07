/**
 * Avatar validation utilities
 * Validates avatar images for size (max 50KB) and dimensions (300x300px)
 * Compresses images to 70% quality
 */

export interface AvatarValidationResult {
  success: boolean;
  error?: string;
  compressedBase64?: string;
}

/**
 * Validates and compresses an image file for avatar upload
 * @param file - The image file to validate
 * @returns Promise with validation result and compressed image
 */
export async function validateAvatarFile(
  file: File
): Promise<AvatarValidationResult> {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error: "Please select a valid image file",
    };
  }

  // Check file size first (must be 50KB or less)
  const maxSize = 50 * 1024; // 50KB in bytes
  if (file.size > maxSize) {
    return {
      success: false,
      error: `Image is too large (${(file.size / 1024).toFixed(1)}KB). Maximum is 50KB.`,
    };
  }

  // Check dimensions (300x300px)
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width !== 300 || dimensions.height !== 300) {
      return {
        success: false,
        error: "Image must be exactly 300x300 pixels",
      };
    }
  } catch {
    return {
      success: false,
      error: "Failed to validate image dimensions",
    };
  }

  // Try to compress the image to 70% quality for better optimization
  try {
    const compressedBase64 = await compressImage(file, 0.7);

    // Check if compressed image is smaller than original
    const compressedSize = getBase64Size(compressedBase64);

    if (compressedSize < file.size) {
      // Use compressed version if it's smaller
      return {
        success: true,
        compressedBase64,
      };
    }

    // Use original if compression didn't reduce size
    const originalBase64 = await fileToBase64(file);
    return {
      success: true,
      compressedBase64: originalBase64,
    };
  } catch {
    // If compression fails, use original (already validated to be under 50KB)
    const originalBase64 = await fileToBase64(file);
    return {
      success: true,
      compressedBase64: originalBase64,
    };
  }
}

/**
 * Get image dimensions from a file
 * @param file - The image file
 * @returns Promise with width and height
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Compress an image file to a specific quality
 * @param file - The image file to compress
 * @param quality - Quality from 0 to 1 (0.7 = 70%)
 * @returns Promise with compressed base64 string
 */
function compressImage(file: File, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Convert to JPEG with specified quality
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert file to base64 string
 * @param file - The file to convert
 * @returns Promise with base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Calculate the size of a base64 string in bytes
 * @param base64String - The base64 string
 * @returns Size in bytes
 */
function getBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const base64 = base64String.split(",")[1] || base64String;

  // Calculate size: (length * 3/4) - padding
  const padding = (base64.match(/=/g) || []).length;
  return base64.length * 0.75 - padding;
}

/**
 * Validates a base64 image string
 * @param base64String - The base64 image string
 * @returns Promise with validation result
 */
export async function validateAvatarBase64(
  base64String: string
): Promise<AvatarValidationResult> {
  try {
    // Check dimensions
    const dimensions = await getImageDimensionsFromBase64(base64String);
    if (dimensions.width !== 300 || dimensions.height !== 300) {
      return {
        success: false,
        error: "Image must be exactly 300x300 pixels",
      };
    }

    // Check size (50KB = 51200 bytes)
    const size = getBase64Size(base64String);
    const maxSize = 50 * 1024;

    if (size <= maxSize) {
      return {
        success: true,
        compressedBase64: base64String,
      };
    }

    return {
      success: false,
      error: `Image is too large (${(size / 1024).toFixed(1)}KB). Maximum is 50KB.`,
    };
  } catch {
    return {
      success: false,
      error: "Failed to validate image",
    };
  }
}

/**
 * Get image dimensions from a base64 string
 * @param base64String - The base64 image string
 * @returns Promise with width and height
 */
function getImageDimensionsFromBase64(
  base64String: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = base64String;
  });
}
