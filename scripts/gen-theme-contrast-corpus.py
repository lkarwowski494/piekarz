#!/usr/bin/env python3
"""
gen-theme-contrast-corpus.py
Independent Python reference implementation generating WCAG 2.1 contrast ratios
and relative luminance for theme tokens (RD-ENG-02 & BR-TEST-014).
"""

import json
import os
import math

def hex_to_rgb(hex_str):
    clean = hex_str.lstrip('#')
    if len(clean) == 3:
        clean = ''.join([c*2 for c in clean])
    bigint = int(clean, 16)
    r = (bigint >> 16) & 255
    g = (bigint >> 8) & 255
    b = bigint & 255
    return r, g, b

def channel_to_linear(c):
    norm = c / 255.0
    if norm <= 0.04045:
        return norm / 12.92
    else:
        return math.pow((norm + 0.055) / 1.055, 2.4)

def relative_luminance(hex_str):
    r, g, b = hex_to_rgb(hex_str)
    r_lin = channel_to_linear(r)
    g_lin = channel_to_linear(g)
    b_lin = channel_to_linear(b)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin

def contrast_ratio(hex1, hex2):
    lum1 = relative_luminance(hex1)
    lum2 = relative_luminance(hex2)
    l1 = max(lum1, lum2)
    l2 = min(lum1, lum2)
    return (l1 + 0.05) / (l2 + 0.05)

def generate_contrast_corpus():
    # Canonical Apps4Craft Basalt tokens
    tokens = {
        "background": "#121214",
        "surface": "#1C1C1F",
        "surfaceCard": "#242428",
        "backgroundSecondary": "#1C1C1F",
        "textPrimary": "#F4EFEA",
        "textSecondary": "#A09C96",
        "textMuted": "#686561",
        "accent": "#D49B42",
        "border": "#2E2E34",
    }

    pairs = [
        {"fg": "textPrimary", "bg": "background", "target": "AAA", "minRatio": 7.0},
        {"fg": "textPrimary", "bg": "surface", "target": "AAA", "minRatio": 7.0},
        {"fg": "textPrimary", "bg": "surfaceCard", "target": "AAA", "minRatio": 7.0},
        {"fg": "textPrimary", "bg": "backgroundSecondary", "target": "AAA", "minRatio": 7.0},
        {"fg": "textSecondary", "bg": "background", "target": "AA", "minRatio": 4.5},
        {"fg": "textSecondary", "bg": "surfaceCard", "target": "AA", "minRatio": 4.5},
        {"fg": "accent", "bg": "background", "target": "AA_Large_or_UI", "minRatio": 3.0},
    ]

    results = []
    for p in pairs:
        fg_hex = tokens[p["fg"]]
        bg_hex = tokens[p["bg"]]
        ratio = contrast_ratio(fg_hex, bg_hex)
        results.append({
            "foregroundToken": p["fg"],
            "foregroundHex": fg_hex,
            "backgroundToken": p["bg"],
            "backgroundHex": bg_hex,
            "expectedContrastRatio": round(ratio, 2),
            "wcagTarget": p["target"],
            "minRequiredRatio": p["minRatio"],
            "passes": ratio >= p["minRatio"],
        })

    payload = {
        "meta": {
            "generator": "scripts/gen-theme-contrast-corpus.py",
            "version": "1.0.0",
            "description": "WCAG 2.1 Contrast Ratios (Python Reference Oracle)",
            "pairCount": len(results),
        },
        "pairs": results,
    }

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'ui', '__tests__', 'fixtures')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'theme-contrast-corpus.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(results)} theme contrast pairs -> {out_file}")

if __name__ == '__main__':
    generate_contrast_corpus()
