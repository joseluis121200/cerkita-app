import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Compresión en el propio móvil antes de subir (CONTEXT.md 3.2): lado mayor 1280 px, ≤ 180 KB.
const MAX_SIDE = 1280;
const TARGET_BYTES = 180 * 1024;
const QUALITY_STEPS = [0.78, 0.68, 0.58, 0.48, 0.4];

export type CompressedPhoto = { uri: string; width: number; height: number; bytes: number };

export async function readFileBytes(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}

export async function compressPhoto(sourceUri: string): Promise<CompressedPhoto> {
  // maxWidth/maxHeight reducen la foto al decodificarla: no se carga la original de 12 MP en memoria.
  const context = ImageManipulator.manipulate(sourceUri, { maxWidth: MAX_SIDE, maxHeight: MAX_SIDE });
  const image = await context.renderAsync();

  let best: CompressedPhoto | null = null;
  for (const quality of QUALITY_STEPS) {
    const saved = await image.saveAsync({ compress: quality, format: SaveFormat.WEBP });
    const bytes = (await readFileBytes(saved.uri)).byteLength;
    best = { uri: saved.uri, width: saved.width, height: saved.height, bytes };
    if (bytes <= TARGET_BYTES) {
      break;
    }
  }

  if (best === null) {
    throw new Error('No se pudo comprimir la foto');
  }
  return best;
}

export function formatKilobytes(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}
