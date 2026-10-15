#!/usr/bin/env python3
"""
gen-baking-physics-corpus.py
Independent Python reference implementation generating baking thermodynamics,
DDT, ice mass, and Q10 kinetics truth tables for cross-language validation.
Apps4Brew Studio — Deterministic Verification Corpus.
"""

import json
import os
import math

def js_round(val):
    """Mirror JavaScript's Math.round (round half up)"""
    return math.floor(val + 0.5)

def calculate_ddt(ddt, flour, room, starter=None, friction=2.0):
    if starter is not None:
        target = 4.0 * ddt - (flour + room + starter + friction)
    else:
        target = 3.0 * ddt - (flour + room + friction)
    rounded = round(target, 1)
    if rounded > 45.0:
        status = "too_hot_danger"
    elif rounded < 4.0:
        status = "requires_ice"
    else:
        status = "normal"
    return {
        "targetDDT": ddt,
        "flourTemp": flour,
        "roomTemp": room,
        "starterTemp": starter,
        "frictionFactor": friction,
        "expectedWaterTemp": rounded,
        "expectedStatus": status,
    }

def calculate_ice(total_water, tap_temp, target_temp):
    if target_temp >= tap_temp:
        return {
            "totalWaterGrams": total_water,
            "tapWaterTempC": tap_temp,
            "targetWaterTempC": target_temp,
            "expectedIceGrams": 0,
            "expectedWaterGrams": total_water,
        }
    latent_heat = 80.0 + tap_temp
    ice = total_water * ((tap_temp - target_temp) / latent_heat)
    ice_rounded = js_round(ice)
    return {
        "totalWaterGrams": total_water,
        "tapWaterTempC": tap_temp,
        "targetWaterTempC": target_temp,
        "expectedIceGrams": ice_rounded,
        "expectedWaterGrams": total_water - ice_rounded,
    }

def calculate_q10(base_hours, actual_temp, base_temp=24.0):
    exponent = (base_temp - actual_temp) / 10.0
    factor = 2.0 ** exponent
    adapted_unrounded = base_hours * factor
    adapted_hours = round(adapted_unrounded, 2)
    diff_minutes = js_round((adapted_unrounded - base_hours) * 60)
    return {
        "baseHours": base_hours,
        "actualTempC": actual_temp,
        "baseCalibrationTempC": base_temp,
        "expectedAdaptedHours": adapted_hours,
        "expectedDiffMinutes": diff_minutes,
    }

def calculate_feeding(yield_grams, ratio):
    s_part, f_part, w_part = ratio
    total_parts = s_part + f_part + w_part
    one_part = yield_grams / total_parts
    s = js_round(one_part * s_part)
    f = js_round(one_part * f_part)
    w = js_round(one_part * w_part)
    return {
        "targetYieldGrams": yield_grams,
        "ratio": ratio,
        "expectedStarterGrams": s,
        "expectedFlourGrams": f,
        "expectedWaterGrams": w,
    }

def generate_corpus():
    corpus = {
        "meta": {
            "generator": "scripts/gen-baking-physics-corpus.py",
            "version": "1.0.0",
            "standard": "Apps4Brew Independent Physics Reference"
        },
        "ddtCases": [],
        "iceCases": [],
        "q10Cases": [],
        "feedingCases": []
    }

    # 1. DDT cases (3-factor and 4-factor matrix)
    for ddt in [23.0, 24.5, 26.0, 28.0]:
        for flour in [18.0, 21.0, 25.0]:
            for room in [19.0, 23.0, 27.0, 32.0]:
                for friction in [1.5, 3.0]:
                    corpus["ddtCases"].append(calculate_ddt(ddt, flour, room, None, friction))
                    corpus["ddtCases"].append(calculate_ddt(ddt, flour, room, 22.0, friction))

    # Extreme DDT edge cases (sub-zero water required, over-hot danger)
    corpus["ddtCases"].append(calculate_ddt(24.0, 30.0, 32.0, 28.0, 5.0)) # extreme hot
    corpus["ddtCases"].append(calculate_ddt(28.0, 15.0, 16.0, None, 1.0)) # extreme cold

    # 2. Ice requirement cases
    for water in [300, 450, 700, 1200, 2500, 5000]:
        for tap in [16.0, 19.0, 22.0, 25.0]:
            for target in [0.0, 3.0, 5.0, 8.0, 12.0, 18.0, 24.0]:
                corpus["iceCases"].append(calculate_ice(water, tap, target))

    # 3. Q10 cases
    for base in [1.5, 3.0, 4.0, 6.0, 8.0, 12.0, 16.0]:
        for temp in [14.0, 18.0, 20.0, 22.0, 24.0, 26.0, 28.0, 30.0, 34.0]:
            corpus["q10Cases"].append(calculate_q10(base, temp))

    # 4. Starter feeding cases
    for y in [50, 100, 150, 200, 300, 500, 800, 1200]:
        for r in [[1, 1, 1], [1, 2, 2], [1, 3, 3], [1, 4, 4], [1, 5, 5], [1, 10, 10], [2, 5, 5]]:
            corpus["feedingCases"].append(calculate_feeding(y, r))

    return corpus

if __name__ == "__main__":
    out_dir = os.path.join("src", "core", "__tests__", "fixtures")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "baking-physics-corpus.json")
    corpus = generate_corpus()
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2)
    print(f"Generated {len(corpus['ddtCases'])} DDT cases, {len(corpus['iceCases'])} ice cases, {len(corpus['q10Cases'])} Q10 cases, {len(corpus['feedingCases'])} feeding cases.")
    print(f"Written to {out_file}")
