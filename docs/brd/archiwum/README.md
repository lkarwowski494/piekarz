# Archiwum: BRD 0.1 (eksport z Dysku Google)

Nieaktualne, zastąpione krótkim zestawem z `docs/brd/00_START.md`; oryginały na Dysku.

- Przeniesiono 2026-10-19 (`git mv`, nic nie usunięto): 26 plików `Piekarz_BRD_0.1___*`, które powielały krótki zestaw z `docs/brd/` pod innymi nazwami i w starszej treści (różnice m.in. w 00_START, A1, D1; tytuł 00b „DEC-01_40”).
- Kanoniczny jest krótki zestaw w `docs/brd/` (spis w `00_START.md`). Pliki tutaj służą tylko do porównania z historią; nie są aktualizowane i nie są wejściem dla żadnej roli.
- Decyzja właściciela 2026-10-19 (plan napraw M1, decyzja 5, wariant a); zadanie M1-audytor-generalny-033, znalezisko 01-odkrywanie-018.
- *Dlaczego:* dwie kopie tego samego rozdziału pozwalały następnej roli wziąć nieaktualną wersję.

Krok właściciela: `scripts/fetch-brd-docs.mjs` zapisuje eksport z Dysku do `docs/brd/` i pomija tylko pliki o tej samej nazwie, więc ponowne uruchomienie odtworzy tam pliki `Piekarz_BRD_0.1___*`. Przed synchronizacją Dysku z repo uruchom eksport do katalogu tymczasowego i przenieś zmiany ręcznie do krótkiego zestawu (albo zaktualizuj dokumenty na Dysku z krótkiego zestawu).
