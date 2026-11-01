// API pública de la feature elder-config.
export { AddLovedOneButton } from './components/AddLovedOneButton';
export { ElderForm } from './components/ElderForm';
export { ElderListItem } from './components/ElderListItem';
export { PairingCodeCard } from './components/PairingCodeCard';
export { RelationshipPicker } from './components/RelationshipPicker';
export { useCreateElder, useCreatePairingCode, useDeleteElder, useElders, useUpdateElder } from './hooks';
export { DEFAULT_ELDER_INPUT, describeActiveDays, lovedOneTitle, RELATIONSHIP_OPTIONS, TIME_ZONE_LABELS, WEEK_DAYS } from './schemas';
export type { Elder, ElderInput, PairingCode } from './schemas';
