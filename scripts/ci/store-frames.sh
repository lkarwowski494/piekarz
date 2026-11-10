#!/usr/bin/env bash
# Podpisy i ramki na zrzutach do App Store (KO-033, właściciel 2026-11-10: „Ma byc jak w treningu”; D-363, D-364). Port z repo trening
# `scripts/ci/store-frames.sh` @ 2e4b0f8; zadanie „ramki” w .github/workflows/zrzuty-sklepu.yml.
# Wejście: <katalog_zrzutów>/<kod ASC>/<klasa>/NN-<ekran>.png (wynik zadania `zbierz`). Wyjście: ten sam układ w <katalog_wyjściowy>,
# obraz o TYM SAMYM rozmiarze co zrzut (rozmiary Apple bez zmian), bez kanału alfa („Images can't include alpha channels”).
# Układ: tło motywu zrzutu (docs/wydanie/zrzuty/ramki-sklepu.json: `motyw`, `kolory`), na ekranach `pro` oznaczenie „wymaga Piekarz Pro”
# w obwódce, podpis u góry (nagłówek z metadanych, jeden rozmiar na lokalizację — store-caption-layout.mjs), zrzut pomniejszony do 78%
# z zaokrągleniem i obwódką. Ramka własna — bez obudów urządzeń Apple. Lokalizacja bez podpisu ekranu: ten ekran pominięty z ostrzeżeniem.
# Kroje (ścieżki do plików statycznych Bold, przygotowuje je workflow): FONT_SOFIA, FONT_NOTO, FONT_CJK; grupa kroju według języka aplikacji.
# Narzędzia: ImageMagick 6 (`convert`, `identify`), node. Użycie: bash scripts/ci/store-frames.sh <katalog_zrzutów> <katalog_wyjściowy>
set -euo pipefail
IN="$1"; OUT="$2"; CFG="docs/wydanie/zrzuty/ramki-sklepu.json"
: "${FONT_SOFIA:?FONT_SOFIA: plik Sofia Sans Semi Condensed Bold}" "${FONT_NOTO:?FONT_NOTO: plik Noto Sans Bold}"
FONT_CJK="${FONT_CJK:-/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc}"
for f in "$FONT_SOFIA" "$FONT_NOTO" "$FONT_CJK"; do [ -f "$f" ] || { echo "::error::brak pliku kroju $f"; exit 1; }; done
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
q() { node -e 'const c=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); const v=process.argv.slice(2).reduce((o,k)=>o==null?o:o[k],c); process.stdout.write(v==null?"":Array.isArray(v)?v.join(" "):String(v))' "$CFG" "$@"; }
jezyk() { node -e 'const m=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); process.stdout.write(String(m.jezyk||""))' "docs/wydanie/metadane/$1.json"; }
CJK=" $(q kroje cjk) "; NOTO=" $(q kroje noto) "; PRO=" $(q pro) "
n=0; braki=0
for kod_dir in "$IN"/*/; do
  kod=$(basename "$kod_dir")
  [ -f "docs/wydanie/metadane/$kod.json" ] || { echo "Pomijam $kod (nie lokalizacja sklepu)"; continue; }
  lang=$(jezyk "$kod")
  case "$CJK" in *" $lang "*) FONT="$FONT_CJK" ;; *) case "$NOTO" in *" $lang "*) FONT="$FONT_NOTO" ;; *) FONT="$FONT_SOFIA" ;; esac ;; esac
  OZN=$(q oznaczenie "$kod")
  for klasa_dir in "$kod_dir"*/; do
    klasa=$(basename "$klasa_dir")
    first=$(ls "$klasa_dir"*.png 2>/dev/null | head -1); [ -n "$first" ] || continue
    mkdir -p "$OUT/$kod/$klasa"
    read -r W0 H0 < <(identify -format '%w %h\n' "$first")
    # Jeden rozmiar czcionki i podział wierszy dla całej lokalizacji i klasy (pole podpisu: 86% szerokości, 13,5% wysokości)
    node scripts/ci/store-caption-layout.mjs "$kod" "$FONT" $(( W0 * 86 / 100 )) $(( H0 * 135 / 1000 )) > "$TMP/plan.json"
    PT=$(node -e 'process.stdout.write(String(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).pointsize))' "$TMP/plan.json")
    for shot in "$klasa_dir"*.png; do
      file=$(basename "$shot"); ekran=${file%.png}
      text=$(node -e 'const p=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).podpisy[process.argv[2]]; process.stdout.write(p==null?"":p)' "$TMP/plan.json" "$ekran")
      [ -n "$text" ] || { echo "::warning::Brak podpisu: $kod/$ekran — bez ramki"; braki=$((braki + 1)); continue; }
      # label: czyta plik dla tekstu z „@” na początku i rozwija „%” — takich podpisów nie składamy (pilnuje też test)
      case "$text$OZN" in @*|*%*) echo "::error::$kod/$ekran: podpis z „@” albo „%”"; exit 1 ;; esac
      motyw=$(q motyw "$ekran"); motyw=${motyw:-jasny}
      BG=$(q kolory "$motyw" tlo); FG=$(q kolory "$motyw" tekst); LINE=$(q kolory "$motyw" obwodkaZrzutu)
      OFG=$(q kolory "$motyw" oznaczenie); OLINE=$(q kolory "$motyw" obwodkaOznaczenia)
      read -r W H < <(identify -format '%w %h\n' "$shot")
      SW=$(( W * 78 / 100 )); SH=$(( H * 78 / 100 )); R=$(( SW * 7 / 100 )); B=$(( W / 120 + 2 ))
      CAPH=$(( H * 135 / 1000 )); CAPY=$(( H * 45 / 1000 )); TOP=$(( H * 19 / 100 )); X=$(( (W - SW) / 2 ))
      convert "$shot" -resize "${SW}x${SH}!" "$TMP/s.png"
      convert -size "${SW}x${SH}" xc:black -fill white -draw "roundrectangle 0,0,$((SW - 1)),$((SH - 1)),$R,$R" "$TMP/m.png"
      convert "$TMP/s.png" "$TMP/m.png" -alpha off -compose CopyOpacity -composite "$TMP/r.png"
      convert -background none -fill "$FG" -font "$FONT" -size "$(( W * 86 / 100 ))x$CAPH" -gravity center -pointsize "$PT" label:"$text" "$TMP/c.png"
      warstwy=("$TMP/r.png" -geometry "+$X+$TOP" -compose over -composite "$TMP/c.png" -geometry "+$(( W * 7 / 100 ))+$CAPY" -compose over -composite)
      case "$PRO" in *" $ekran "*)
        [ -n "$OZN" ] || { echo "::error::$kod: brak tekstu oznaczenia Pro"; exit 1; }
        OPT=$(( H * 14 / 1000 )); PAD=$(( OPT * 6 / 10 ))
        convert -background none -fill "$OFG" -font "$FONT" -pointsize "$OPT" label:"$OZN" "$TMP/o.png"
        read -r OW OH < <(identify -format '%w %h\n' "$TMP/o.png")
        BW=$(( OW + 2 * PAD )); BH=$(( OH + PAD )); BX=$(( (W - BW) / 2 )); BY=$(( H * 10 / 1000 ))
        convert -size "${BW}x${BH}" xc:none -fill none -stroke "$OLINE" -strokewidth $(( W / 400 + 1 )) \
          -draw "roundrectangle 2,2,$((BW - 3)),$((BH - 3)),$((BH / 2)),$((BH / 2))" \
          "$TMP/o.png" -gravity center -compose over -composite "$TMP/b.png"
        warstwy+=("$TMP/b.png" -gravity northwest -geometry "+$BX+$BY" -compose over -composite) ;;
      esac
      convert -size "${W}x${H}" "xc:$BG" \
        -fill "$LINE" -draw "roundrectangle $((X - B)),$((TOP - B)),$((X + SW - 1 + B)),$((TOP + SH - 1 + B)),$((R + B)),$((R + B))" \
        "${warstwy[@]}" -alpha remove -alpha off -depth 8 -define png:color-type=2 "$OUT/$kod/$klasa/$file"
      n=$((n + 1))
    done
  done
done
echo "Ramki: $n plików, ekranów bez podpisu: $braki"
