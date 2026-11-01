import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useElderContext } from '@/features/auth-pairing';
import { GoodMorningButton, GreetingConfirmation, useButtonPressedToday, useFamilyCheckins, useGreeting } from '@/features/checkin-engine';
import { useElders } from '@/features/elder-config';
import { ElderPostcardNav, PhotoFrame, useElderPostcards } from '@/features/moments';
import { ElderScreen, ElderText, elderColors } from '@/shared/ui-elder';
import { formatLongDate, localDateIn, localTimeIn, timeToMinutes } from '@/shared/utils/dates';
import { successFeedback } from '@/shared/utils/haptics';

// Pantalla única de la persona acompañada: un marco de revista con las postales de hoy (pase con
// dos botones grandes si hay varias) y un solo botón protagonista. Sin menús ni gestos.
export default function LovedOneHome() {
  const session = useElderContext();
  const familyId = session?.familyId;
  const timeZone = session?.timezone ?? 'Europe/Madrid';
  const { postcards, isMemory, isLoading } = useElderPostcards(familyId, timeZone);
  const [index, setIndex] = useState(0);
  const current = postcards[Math.min(index, Math.max(postcards.length - 1, 0))] ?? null;
  const checkins = useFamilyCheckins(familyId);
  const elders = useElders(familyId);
  const pressedToday = useButtonPressedToday(timeZone);
  const greeting = useGreeting(familyId ?? '', { id: session?.elderId ?? '', timezone: timeZone });
  const autoSent = useRef(false);

  const today = localDateIn(timeZone);
  const todayRow = checkins.data?.find((c) => c.elderId === session?.elderId && c.localDate === today);
  const greeted = todayRow?.status === 'ok';
  const myConfig = elders.data?.find((e) => e.id === session?.elderId);

  // Ver la postal dentro de la ventana de la mañana ya cuenta como señal (CONTEXT.md 3.2.4).
  useEffect(() => {
    if (current === null || greeted || autoSent.current || myConfig === undefined) {
      return;
    }
    if (timeToMinutes(localTimeIn(timeZone)) >= timeToMinutes(myConfig.windowStart)) {
      autoSent.current = true;
      greeting.mutate('photo_opened');
    }
  }, [current, greeted, myConfig, timeZone, greeting]);

  if (session === null) {
    return null;
  }

  function sayGoodMorning() {
    greeting.mutate('morning_button', { onSuccess: () => successFeedback() });
  }

  return (
    <ElderScreen>
      <View style={styles.topRow}>
        <ElderText color={elderColors.textSoft} style={styles.date}>
          {formatLongDate(new Date(), timeZone)}
        </ElderText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajustes del móvil, para quien te acompaña"
          delayLongPress={4000}
          onLongPress={() => router.push('/elder-settings')}
          hitSlop={12}
          style={styles.settings}
        >
          <Settings size={18} color={elderColors.border} />
        </Pressable>
      </View>
      <ElderText variant="hero">{`¡Buenos días, ${session.elderName}!`}</ElderText>

      {current !== null ? (
        <PhotoFrame photo={{ moment: current, isMemory }} timeZone={timeZone} />
      ) : (
        <View style={styles.empty}>
          <ElderText variant="large" center>
            {isLoading ? 'Cargando tu postal de hoy…' : 'Muy pronto tu círculo te mandará la primera postal 💌'}
          </ElderText>
        </View>
      )}

      {!isMemory && postcards.length >= 2 && (
        <ElderPostcardNav
          index={Math.min(index, postcards.length - 1)}
          total={postcards.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(postcards.length - 1, i + 1))}
        />
      )}

      <View style={styles.action}>
        {pressedToday ? (
          <GreetingConfirmation at={todayRow?.confirmedAt ?? null} timeZone={timeZone} />
        ) : (
          <GoodMorningButton onPress={sayGoodMorning} loading={greeting.isPending && greeting.variables === 'morning_button'} />
        )}
      </View>
    </ElderScreen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { flex: 1, textTransform: 'capitalize' },
  settings: { padding: 8 },
  empty: {
    minHeight: 260,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: elderColors.border,
    backgroundColor: elderColors.frame,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  action: { marginTop: 4 },
});
