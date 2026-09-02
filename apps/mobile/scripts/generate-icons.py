#!/usr/bin/env python3
"""Generate placeholder icon.png, adaptive-icon.png, splash.png under apps/mobile/assets.
Requires: pip install pillow
"""
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "assets"
ROOT.mkdir(parents=True, exist_ok=True)


def make_icon(size: int, path: Path) -> None:
    img = Image.new("RGBA", (size, size), (13, 15, 20, 255))
    d = ImageDraw.Draw(img)
    m = size // 10
    d.ellipse([m, m, size - m, size - m], fill=(139, 92, 246, 255))
    img.save(path, "PNG")
    print("wrote", path)


def make_splash(w: int, h: int, path: Path) -> None:
    img = Image.new("RGBA", (w, h), (13, 15, 20, 255))
    d = ImageDraw.Draw(img)
    s = min(w, h) // 4
    x, y = (w - s) // 2, (h - s) // 2
    d.ellipse([x, y, x + s, y + s], fill=(139, 92, 246, 255))
    img.save(path, "PNG")
    print("wrote", path)


if __name__ == "__main__":
    make_icon(1024, ROOT / "icon.png")
    make_icon(1024, ROOT / "adaptive-icon.png")
    make_splash(1284, 2778, ROOT / "splash.png")
