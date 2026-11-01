import { QrCode } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppText, Button, Card, familyColors, familySpacing } from '@/shared/ui-family';

import type { PairingCode } from '../schemas';

type Props = {
  elderName: string;
  isPaired: boolean;
  pairing: PairingCode | null;
  loading: boolean;
  onGenerate: () => void;
};

function formatCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

function formatHour(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

// Código de 6 cifras + QR para vincular el móvil del mayor sin emails ni contraseñas.
export function PairingCodeCard({ elderName, isPaired, pairing, loading, onGenerate }: Props) {
  return (
    <Card tone="warm">
      <View style={styles.header}>
        <QrCode size={22} color={familyColors.accent} />
        <AppText variant="heading">Unir su móvil al círculo</AppText>
      </View>
      <AppText variant="muted">
        {isPaired
          ? `El móvil de ${elderName} ya está unido al círculo. Si cambia de móvil, genera un código nuevo: el antiguo dejará de funcionar.`
          : `En el móvil de ${elderName}: abre Cerca, pulsa «Tengo un código» y escanea este QR o dicta los 6 números.`}
      </AppText>
      {pairing !== null && (
        <View style={styles.codeBox}>
          <View style={styles.qr}>
            <QRCode value={`cerca-pair:${pairing.code}`} size={180} backgroundColor={familyColors.white} color={familyColors.text} />
          </View>
          <Text style={styles.code} accessibilityLabel={`Código ${pairing.code.split('').join(' ')}`}>
            {formatCode(pairing.code)}
          </Text>
          <AppText variant="tiny">{`Válido hasta las ${formatHour(pairing.validUntil)} · un solo uso`}</AppText>
        </View>
      )}
      <Button
        title={pairing === null ? 'Generar código para su móvil' : 'Generar otro código'}
        variant={pairing === null ? 'primary' : 'secondary'}
        loading={loading}
        onPress={onGenerate}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.sm },
  codeBox: { alignItems: 'center', gap: familySpacing.sm, paddingVertical: familySpacing.md },
  qr: { padding: 12, backgroundColor: familyColors.white, borderRadius: 16 },
  code: { fontSize: 44, fontWeight: '800', letterSpacing: 4, color: familyColors.text, fontVariant: ['tabular-nums'] },
});
