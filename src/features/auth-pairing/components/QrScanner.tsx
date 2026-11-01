import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { ElderButton, ElderText, elderColors } from '@/shared/ui-elder';

type Props = { onCode: (code: string) => void; onCancel: () => void };

/** El QR que muestra el acompañante contiene "cerca-pair:123456". También aceptamos 6 cifras sueltas. */
export function parsePairingQr(data: string): string | null {
  const match = /(\d{6})/.exec(data);
  return match?.[1] ?? null;
}

export function QrScanner({ onCode, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);

  function handleScan(result: BarcodeScanningResult) {
    if (handled.current) {
      return;
    }
    const code = parsePairingQr(result.data);
    if (code !== null) {
      handled.current = true;
      onCode(code);
    }
  }

  if (permission === null) {
    return <View style={styles.placeholder} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <ElderText center>Para leer el código QR necesitamos usar la cámara.</ElderText>
        <ElderButton title="Permitir la cámara" onPress={() => void requestPermission()} />
        <ElderButton title="Volver" variant="secondary" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScan}
      />
      <ElderText center>Apunta la cámara al código QR del móvil de quien te acompaña.</ElderText>
      <ElderButton title="Volver al teclado" variant="secondary" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 16 },
  camera: { width: '100%', aspectRatio: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: elderColors.text },
  placeholder: { width: '100%', aspectRatio: 1 },
  permission: { gap: 16 },
});
