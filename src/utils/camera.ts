import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

export interface PhotoCaptureResult {
  dataUrl: string;
  format: string;
  source: "native-camera" | "native-gallery" | "web-fallback";
}

/**
 * Universal photo capture utility:
 * Uses native Capacitor Camera on iOS/Android,
 * and falls back to standard HTML file/camera capture on Web and Desktop.
 */
export async function capturePhoto(options?: {
  source?: "camera" | "photos" | "prompt";
  quality?: number;
}): Promise<PhotoCaptureResult | null> {
  const isNative = Capacitor.isNativePlatform();
  const quality = options?.quality ?? 85;

  if (isNative) {
    try {
      const cameraSource =
        options?.source === "camera"
          ? CameraSource.Camera
          : options?.source === "photos"
            ? CameraSource.Photos
            : CameraSource.Prompt;

      const photo = await Camera.getPhoto({
        quality,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: cameraSource,
      });

      if (photo.dataUrl) {
        return {
          dataUrl: photo.dataUrl,
          format: photo.format || "jpeg",
          source: options?.source === "photos" ? "native-gallery" : "native-camera",
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("cancel")) {
        return null;
      }
      console.warn("Capacitor camera failed, falling back to web file input:", err);
    }
  }

  // Web / Desktop fallback
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (options?.source === "camera") {
      input.capture = "environment";
    }

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type.split("/")[1] || "jpeg",
          source: "web-fallback",
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    // Clean up if closed without selection
    window.addEventListener(
      "focus",
      () => {
        setTimeout(() => {
          if (!input.files?.length) {
            resolve(null);
          }
        }, 800);
      },
      { once: true },
    );

    input.click();
  });
}
