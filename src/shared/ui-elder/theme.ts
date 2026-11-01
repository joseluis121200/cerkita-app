// Modo Persona Acompañada: marco de revista, digno y precioso. Contraste AAA:
// texto normal ≥ 7:1 y texto grande ≥ 4,5:1 (el botón Coral Cereza con blanco da 4,7:1).
export const elderColors = {
  background: '#F6F4F0',
  frame: '#FFFFFF',
  border: '#EAE6DF',
  text: '#16161A',
  textSoft: '#45413B', // 9:1 sobre marfil
  primary: '#E11D48',
  primaryPressed: '#BE123C',
  onPrimary: '#FFFFFF',
  accentSoft: '#FFE4E8',
  confirmedSurface: '#FFF5F6',
  overlay: 'rgba(255,255,255,0.94)', // etiquetas sobre la foto
  shadow: '#16161A',
  memory: '#3D3A35',
  memorySoft: '#F1ECE4',
} as const;

export const elderType = { body: 23, large: 27, title: 31, hero: 36 } as const;

// ≥ 70 dp para el botón principal; 72 dp de base para cualquier toque.
export const elderSizes = { touchMin: 72, gap: 18, radius: 30, padding: 20 } as const;
