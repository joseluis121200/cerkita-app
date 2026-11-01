"""Genera los iconos y el splash de Cerca (Coral Cereza + Marfil). Uso: python scripts/generate-icons.py
Requiere Pillow (pip install pillow). Dibuja un círculo abierto (el "círculo" de seres queridos)
con un corazón dentro. Se dibuja a 4x y se reduce para que los bordes salgan suaves."""
import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / 'assets' / 'images'
CORAL_TOP = (244, 63, 94)    # #F43F5E
CORAL_BOTTOM = (225, 29, 72)  # #E11D48
WHITE = (255, 255, 255, 255)
SS = 4  # supersampling


def gradient(size):
    img = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        color = tuple(round(CORAL_TOP[i] + (CORAL_BOTTOM[i] - CORAL_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (size, y)], fill=color)
    return img


def heart_points(cx, cy, scale):
    points = []
    for i in range(720):
        t = math.tau * i / 720
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        points.append((cx + x * scale, cy - y * scale))
    return points


def symbol(size, color, ring_ratio=0.30, stroke_ratio=0.055, heart_ratio=0.0085):
    """Anillo abierto + corazón, centrado, sobre fondo transparente."""
    big = size * SS
    img = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    c = big / 2
    r = big * ring_ratio
    w = big * stroke_ratio
    # Anillo con una pequeña apertura arriba a la derecha: un círculo que siempre deja entrar a alguien.
    draw.arc([c - r, c - r, c + r, c + r], start=-60, end=250, fill=color, width=round(w))
    # PIL dibuja el trazo hacia dentro del recuadro: el centro del trazo está en r - w/2.
    mid = r - w / 2
    for angle in (-60, 250):
        a = math.radians(angle)
        x, y = c + mid * math.cos(a), c + mid * math.sin(a)
        draw.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=color)
    draw.polygon(heart_points(c, c + big * 0.01, big * heart_ratio), fill=color)
    return img.resize((size, size), Image.LANCZOS)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    # Icono de tienda (iOS exige 1024 sin transparencia).
    icon = gradient(1024).convert('RGBA')
    icon.alpha_composite(symbol(1024, WHITE))
    icon.convert('RGB').save(OUT / 'icon.png')
    # Android adaptativo: el símbolo dentro de la zona segura (66 % central).
    symbol(1024, WHITE, ring_ratio=0.24, stroke_ratio=0.045, heart_ratio=0.0068).save(OUT / 'android-icon-foreground.png')
    symbol(1024, WHITE, ring_ratio=0.24, stroke_ratio=0.045, heart_ratio=0.0068).save(OUT / 'android-icon-monochrome.png')
    gradient(1024).save(OUT / 'android-icon-background.png')
    # Splash: símbolo coral sobre el fondo marfil que pone app.json.
    symbol(1024, CORAL_BOTTOM + (255,), ring_ratio=0.40, stroke_ratio=0.07, heart_ratio=0.011).save(OUT / 'splash-icon.png')
    icon.convert('RGB').resize((48, 48), Image.LANCZOS).save(OUT / 'favicon.png')
    print('Iconos generados en', OUT)


if __name__ == '__main__':
    main()
