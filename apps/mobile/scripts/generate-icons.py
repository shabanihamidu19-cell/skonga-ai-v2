#!/usr/bin/env python3
"""Generate placeholder icon.png, adaptive-icon.png, splash.png under apps/mobile/assets.
Requires: pip install pillow
"""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "assets"
ROOT.mkdir(parents=True, exist_ok=True)

BG = (13, 15, 20, 255)
ACCENT = (139, 92, 246, 255)
TEXT = (238, 241, 247, 255)


def font(size: int):
    for name in ("DejaVuSans-Bold.ttf", "Arial Bold.ttf", "Arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_icon(size: int, path: Path) -> None:
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    m = size // 10
    d.rounded_rectangle([m, m, size - m, size - m], radius=size // 6, fill=ACCENT)
    f = font(size // 2)
    text = "S"
    box = d.textbbox((0, 0), text, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((size - tw) / 2, (size - th) / 2 - box[1]), text, fill=TEXT, font=f)
    img.save(path, "PNG")
    print("wrote", path)


def make_splash(w: int, h: int, path: Path) -> None:
    img = Image.new("RGBA", (w, h), BG)
    d = ImageDraw.Draw(img)
    s = min(w, h) // 4
    x, y = (w - s) // 2, (h - s) // 2 - h // 20
    d.rounded_rectangle([x, y, x + s, y + s], radius=s // 6, fill=ACCENT)
    f = font(s // 2)
    box = d.textbbox((0, 0), "S", font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text((x + (s - tw) / 2, y + (s - th) / 2 - box[1]), "S", fill=TEXT, font=f)
    label = font(max(28, s // 8))
    title = "SKONGA AI"
    box = d.textbbox((0, 0), title, font=label)
    tw = box[2] - box[0]
    d.text(((w - tw) / 2, y + s + 28), title, fill=TEXT, font=label)
    img.save(path, "PNG")
    print("wrote", path)


if __name__ == "__main__":
    make_icon(1024, ROOT / "icon.png")
    make_icon(1024, ROOT / "adaptive-icon.png")
    make_splash(1284, 2778, ROOT / "splash.png")
