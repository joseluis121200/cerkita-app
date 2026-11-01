// Identidad de marca de Cerca para acompañantes y miembros: base marfil + Coral Cereza, con
// bloques de color con fuerza (Tinta Noche, degradados) y una paleta secundaria expresiva.
// La pantalla de la persona acompañada usa su propio tema sereno (ui-elder/theme.ts).
export const familyColors = {
  background: '#F6F4F0', // marfil piedra
  surface: '#FFFFFF',
  surfaceWarm: '#FAF8F5',
  border: '#EAE6DF',
  text: '#16161A', // carbón tinta
  textMuted: '#6E6A63', // gris cálido
  primary: '#E11D48', // Coral Cereza: botones y texto de marca (4,7:1 con blanco)
  primaryPressed: '#BE123C',
  onPrimary: '#FFFFFF',
  accent: '#F43F5E', // coral brillante solo decorativo: racha, corazones, iconos
  accentSoft: '#FFE4E8',
  accentSurface: '#FFF5F6',
  calm: '#16161A', // confirmaciones serenas en tinta, sin verde chillón
  calmSoft: '#D1FAE5', // esmeralda suave: confirmaciones de bienestar
  calmText: '#065F46',
  // Bloques de impacto y paleta secundaria expresiva
  night: '#181826', // Tinta Noche
  indigo: '#272343', // Índigo Profundo
  onNight: '#FFFFFF',
  onNightMuted: '#B9B8C9',
  gold: '#FFB800', // Ámbar Oro: destellos sobre fondos oscuros
  amber: '#F59E0B', // rachas y logros
  violet: '#7C3AED', // Guiño del día
  violetSoft: '#EDE9FE',
  emerald: '#10B981', // bienestar confirmado
  mandarin: '#F97316',
  coralLight: '#FB7185',
  warningSoft: '#FBF3E4',
  warningText: '#7A5513',
  warningBorder: '#F1E2C4',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  dangerPressed: '#F9D7D3',
  calmPressed: '#2E2E33',
  overlay: 'rgba(255,255,255,0.92)', // etiquetas sobre fotos
  nightCell: 'rgba(255,255,255,0.10)', // celdas sobre fondos oscuros
  filmChip: 'rgba(24,24,38,0.78)', // etiqueta de hora estilo carrete
  white: '#FFFFFF',
} as const;

export const familySpacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const familyRadius = { sm: 12, md: 18, lg: 26, pill: 999 } as const;

export const familyType = { title: 28, heading: 20, body: 16, small: 14, tiny: 12 } as const;

// Sombra suave para tarjetas "postal" (iOS + Android).
export const familyShadow = {
  shadowColor: '#16161A',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
} as const;

// Degradados (tuplas de al menos 2 colores, como exige expo-linear-gradient).
export const familyGradients = {
  coral: ['#F43F5E', '#FB7185', '#F97316'],
  night: ['#181826', '#272343'],
  wink: ['#7C3AED', '#F43F5E'],
} as const;

// Sombra cálida y marcada para las postales tipo Polaroid.
export const polaroidShadow = {
  shadowColor: '#7C2D12',
  shadowOpacity: 0.16,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 6,
} as const;
