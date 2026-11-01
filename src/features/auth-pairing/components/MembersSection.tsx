import { useState } from 'react';

import { AppText, Card } from '@/shared/ui-family';

import { useMembers } from '../family-hooks';
import type { FamilyMember } from '../schemas';
import { MemberActionsSheet } from './MemberActionsSheet';
import { MemberRow } from './MemberRow';

type Props = { familyId: string; myUserId: string; isAdmin: boolean };

export function MembersSection({ familyId, myUserId, isAdmin }: Props) {
  const members = useMembers(familyId);
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const people = (members.data ?? []).filter((m) => m.role !== 'elder');

  return (
    <Card>
      <AppText variant="heading">{`Personas del círculo (${people.length}/10)`}</AppText>
      <AppText variant="muted">
        Los acompañantes configuran el saludo de tus seres queridos y reciben los avisos. Todos pueden mandar su postal diaria.
      </AppText>
      {people.map((member) => (
        <MemberRow key={member.id} member={member} isMe={member.userId === myUserId} canManage={isAdmin} onOpenActions={setSelected} />
      ))}
      <MemberActionsSheet familyId={familyId} member={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
