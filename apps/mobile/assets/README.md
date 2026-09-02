# SKONGA mobile assets

Place final brand files here before store builds:

| File | Size | Use |
| --- | --- | --- |
| `icon.png` | 1024×1024 | App icon (iOS + Android) |
| `adaptive-icon.png` | 1024×1024 | Android adaptive foreground |
| `splash.png` | 1284×2778 (or similar) | Splash screen |
| `favicon.png` | 48×48 | Optional web |

## Generate from SVG masters

```bash
# from repo root
cd apps/mobile
# optional: convert SVG → PNG with your design tool or:
npx @expo/image-utils  # or use Figma export
```

SVG masters live in `assets/masters/`.

After replacing PNGs, point `app.json`:

```json
"icon": "./assets/icon.png",
"splash": { "image": "./assets/splash.png", "backgroundColor": "#0d0f14", "resizeMode": "contain" },
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0d0f14"
  }
}
```

Then rebuild with EAS so icons ship in the binary.
