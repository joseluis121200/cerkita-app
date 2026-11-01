import * as ImagePicker from 'expo-image-picker';

import type { PickedPhoto } from './schemas';

export type PickSource = 'camera' | 'library';

export type PickResult = { status: 'picked'; photo: PickedPhoto } | { status: 'cancelled' } | { status: 'denied' };

// Cámara o galería del móvil. La calidad alta aquí: la compresión real la hace compressPhoto.
export async function pickPhoto(source: PickSource): Promise<PickResult> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { status: 'denied' };
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, allowsEditing: false };
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) {
    return { status: 'cancelled' };
  }
  const asset = result.assets[0];
  if (asset === undefined) {
    return { status: 'cancelled' };
  }
  return { status: 'picked', photo: { uri: asset.uri, width: asset.width, height: asset.height } };
}
