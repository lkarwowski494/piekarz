set -e
cd $SCRATCH/web && CI=1 timeout 600 npx expo export --platform web --output-dir $SCRATCH/web-dist > $SCRATCH/web-export.log 2>&1
mkdir -p $SCRATCH/web-dist/fonts && cp $SCRATCH/web/assets/fonts/SofiaSansSemiCondensed-wght.ttf $SCRATCH/web-dist/fonts/
echo eksport-ok
