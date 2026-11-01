// Cuenta para los revisores de App Store y Google Play (ver GUIA_PUBLICACION_TIENDAS.md, fase 7).
// El código NO está aquí: es el secreto REVIEW_OTP_CODE de la Edge Function review-login.
export const REVIEW_ACCOUNT_EMAIL = 'revisor@cercaapp.es';

export function isReviewAccount(email: string): boolean {
  return email.trim().toLowerCase() === REVIEW_ACCOUNT_EMAIL;
}
