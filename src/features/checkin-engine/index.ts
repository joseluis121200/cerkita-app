// API pública de la feature checkin-engine.
export { AlertCard } from './components/AlertCard';
export { CircleHeroCard } from './components/CircleHeroCard';
export { callPhone, ElderStatusCard } from './components/ElderStatusCard';
export { GoodMorningButton } from './components/GoodMorningButton';
export { GreetingConfirmation } from './components/GreetingConfirmation';
export { describeDayState } from './describe';
export {
  useButtonPressedToday,
  useCheckinQueueSync,
  useElderOverviews,
  useFamilyCheckins,
  useGreeting,
  useResolveCheckin,
} from './hooks';
export type { ElderOverview } from './hooks';
export { circleStreak, computeStreak, deriveDayState, greetingDays, isActiveDay } from './status';
export type { CheckinSource, CheckinStatus, DayCheckin, ElderDayState } from './schemas';
