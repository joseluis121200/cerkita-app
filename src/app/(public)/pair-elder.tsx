import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CodeSlots, GiantKeypad, QrScanner, usePairElderDevice } from '@/features/auth-pairing';
import { toUserMessage } from '@/shared/api/errors';
import { isDemoMode } from '@/shared/api/mode';
import { ElderButton, ElderScreen, ElderText, elderColors } from '@/shared/ui-elder';
import { successFeedback } from '@/shared/utils/haptics';

// Móvil de la persona acompañada: teclea los 6 números (o escanea el QR) y queda unido al círculo.
export default function PairElder() {
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pair = usePairElderDevice();

  function submit(value: string) {
    setError(null);
    pair.mutate(value, {
      onSuccess: () => {
        successFeedback();
        router.replace('/');
      },
      onError: (pairError) => {
        setError(toUserMessage(pairError));
        setCode('');
      },
    });
  }

  function addDigit(digit: string) {
    if (pair.isPending || code.length >= 6) {
      return;
    }
    const next = code + digit;
    setCode(next);
    if (next.length === 6) {
      submit(next);
    }
  }

  if (scanning) {
    return (
      <ElderScreen>
        <ElderText variant="title">Escanea el código</ElderText>
        <QrScanner
          onCode={(scanned) => {
            setScanning(false);
            setCode(scanned);
            submit(scanned);
          }}
          onCancel={() => setScanning(false)}
        />
      </ElderScreen>
    );
  }

  return (
    <ElderScreen>
      <ElderText variant="title">Escribe el código de 6 números que te han dado</ElderText>
      <CodeSlots value={code} />
      {pair.isPending && <ElderText center>Comprobando el código…</ElderText>}
      {error !== null && (
        <View accessibilityLiveRegion="assertive">
          <ElderText color={elderColors.memory} center>
            {error}
          </ElderText>
        </View>
      )}
      <GiantKeypad onDigit={addDigit} onDelete={() => setCode(code.slice(0, -1))} />
      <ElderButton title="Escanear código QR" variant="secondary" onPress={() => setScanning(true)} />
      {isDemoMode && (
        <ElderText variant="body" color={elderColors.textSoft} center>
          Modo prueba: genera un código desde «Seres queridos» en la vista de acompañante.
        </ElderText>
      )}
      <ElderButton title="Volver" variant="secondary" onPress={() => router.back()} />
    </ElderScreen>
  );
}
