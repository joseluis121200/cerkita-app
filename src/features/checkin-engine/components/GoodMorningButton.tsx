import { ElderButton } from '@/shared/ui-elder';

type Props = { onPress: () => void; loading: boolean };

export function GoodMorningButton({ onPress, loading }: Props) {
  return (
    <ElderButton
      title="Mandar los buenos días al círculo ☀️"
      onPress={onPress}
      loading={loading}
      accessibilityLabel="Mandar los buenos días a tu círculo"
      accessibilityHint="Tus seres queridos recibirán tu saludo al momento"
    />
  );
}
