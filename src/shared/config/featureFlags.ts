// Interruptores de producto. Cambiar un valor aquí no requiere tocar ninguna pantalla.
export const FEATURE_FLAGS = {
  /**
   * Muestra los botones, banners y tarjetas que invitan a pasarse a Círculo Plus.
   * - true: el paywall aparece cuando alguien choca con un límite del plan gratuito.
   * - false: ocultamos TODA la promoción de Plus (útil las primeras semanas de lanzamiento).
   *   Los límites del plan gratuito siguen aplicándose en el servidor; solo cambia la interfaz.
   */
  SHOW_PLUS_UPSELL: true,
} as const;
