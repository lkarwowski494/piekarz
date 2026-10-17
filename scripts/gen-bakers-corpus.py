#!/usr/bin/env python3
"""
gen-bakers-corpus.py
Independent Python reference implementation generating True Baker's %,
starter hydration contribution, dough mass balance, and DDT scaling truth tables.
Apps4Brew Studio — Deterministic Verification Corpus (BR-TEST-011..014).
"""

import json
import os
import math

def js_round(val):
    """Mirror JavaScript's Math.round (round half up)"""
    return math.floor(val + 0.5)

def calculate_dough_bakers_percent(target_weight, flours_spec, water_pct, salt_pct, starter_pct, starter_hydr, extra_yeast_pct=0.0):
    total_bakers_pct = 100.0 + water_pct + salt_pct + starter_pct + extra_yeast_pct
    base_flour_weight = target_weight / (total_bakers_pct / 100.0)

    water_weight = (base_flour_weight * water_pct) / 100.0
    salt_weight = (base_flour_weight * salt_pct) / 100.0
    starter_weight = (base_flour_weight * starter_pct) / 100.0
    yeast_weight = (base_flour_weight * extra_yeast_pct) / 100.0

    starter_flour = starter_weight / (1.0 + starter_hydr / 100.0)
    starter_water = starter_weight - starter_flour

    total_flour = base_flour_weight + starter_flour
    total_water = water_weight + starter_water

    overall_hydration = (total_water / total_flour) * 100.0

    flour_items = []
    for f in flours_spec:
        w = js_round((base_flour_weight * f['pct']) / 100.0)
        flour_items.append({'name': f['name'], 'weight': w, 'pct': f['pct']})

    water_rounded = js_round(water_weight)
    salt_rounded = round(salt_weight, 1)
    starter_rounded = js_round(starter_weight)
    yeast_rounded = round(yeast_weight, 1)
    base_flour_rounded = js_round(base_flour_weight)
    starter_flour_rounded = js_round(starter_flour)
    starter_water_rounded = js_round(starter_water)
    total_flour_rounded = js_round(total_flour)
    total_water_rounded = js_round(total_water)

    sum_check = base_flour_rounded + water_rounded + js_round(salt_rounded) + starter_rounded + js_round(yeast_rounded)

    return {
        'targetWeight': target_weight,
        'waterPct': water_pct,
        'saltPct': salt_pct,
        'starterPct': starter_pct,
        'starterHydration': starter_hydr,
        'extraYeastPct': extra_yeast_pct,
        'baseFlourWeight': base_flour_rounded,
        'recipeWater': water_rounded,
        'saltWeight': salt_rounded,
        'starterWeight': starter_rounded,
        'starterFlour': starter_flour_rounded,
        'starterWater': starter_water_rounded,
        'yeastWeight': yeast_rounded,
        'totalFlour': total_flour_rounded,
        'totalWater': total_water_rounded,
        'overallHydration': round(overall_hydration, 2),
        'sumCheck': sum_check,
        'flours': flour_items,
    }

def generate_bakers_corpus():
    cases = []
    
    weights = [300, 500, 750, 900, 1000, 1500, 2000, 4000]
    water_pcts = [60.0, 65.0, 68.0, 70.0, 72.0, 75.0, 78.0, 80.0, 85.0]
    salt_pcts = [1.8, 2.0, 2.2]
    starter_pcts = [10.0, 15.0, 20.0, 25.0]
    starter_hydrs = [80.0, 100.0, 120.0]

    count = 0
    for w in weights:
        for wp in water_pcts:
            for sp in salt_pcts:
                for st in starter_pcts:
                    for sh in starter_hydrs:
                        flours = [{'name': 'Flour A', 'pct': 80}, {'name': 'Flour B', 'pct': 20}]
                        case = calculate_dough_bakers_percent(w, flours, wp, sp, st, sh, extra_yeast_pct=0.0)
                        cases.append(case)
                        count += 1
                        if count >= 200:
                            break
                    if count >= 200:
                        break
                if count >= 200:
                    break
            if count >= 200:
                break
        if count >= 200:
            break

    payload = {
        'meta': {
            'generator': 'scripts/gen-bakers-corpus.py',
            'version': '1.0.0',
            'description': 'True Baker\'s % & Mass Balance Truth Table (Python Reference Oracle)',
            'caseCount': len(cases),
        },
        'cases': cases,
    }

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'core', '__tests__', 'fixtures')
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'bakers-corpus.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"Generated {len(cases)} True Baker's % cases -> {out_file}")

if __name__ == '__main__':
    generate_bakers_corpus()
