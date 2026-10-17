# Rejestr Decyzji Projektowych — Piekarz (noble-pasteur)

Stan bieżący projektu na dzień 17.10.2026. Dokument prowadzony zgodnie z Zasadą 6 Uniwersalnych Zasad i rolą Sekretarza Dokumentacji.

---

### [DEC-001] 17.10.2026 — Wybór Standardu Zasad i Ról (Opcja A)
- **Status:** ZATWIERDZONE przez Właściciela
- **Źródło:** *Biblioteka zasad i ról* (Dysk Google, ID: `1a9PD_1dVpY5Ct3XTkJPQoB-3iqPwVD__wbL7Fe-xOUw`)
- **Wybrany zestaw:** Opcja A („Rzemieślniczy Inżynier + Badacz Chleba”)
- **Aktywne moduły dziedzinowe:**
  1. `aplikacje (oprogramowanie)` — rygor TDD, testy błędu najpierw czerwone na kodzie sprzed poprawki, reguła limitów CI, małe moduły (≤ 20 KB), polityki sklepów (Apple App Store 2.3.7, 5.1.3), 100% offline-first.
  2. `research i treści merytoryczne` — precyzja wzorów True Baker's %, 4-DDT, absorpcji mąk i mikrobiologii zakwasu oparta na literaturze fachowej (Hamelman, Calvel, DiMuzio); zakaz zgadywania i halucynacji liczb.
  3. `trzy zasady ogólne z modułu gier` — jedno źródło prawdy z generatorami; „udokumentowane” ≠ „zweryfikowane”; warianty i archiwa jako jawnie oznaczone kopie obok kanonu.
- **Aktywne role projektowe:**
  - **Programista** (wdrożenie wg planu, minimalny zakres, TDD)
  - **Analityk produktu / Projektant UX** (specyfikacja przepływów, min. 2 opcje z kompromisem)
  - **Badacz merytoryczny** (weryfikacja liczb i wzorów u źródeł)
  - **Tester E2E / Integracji UI** (weryfikacja klikalności, regresji i testów interakcji)
  - **Audytor** (niezależny audyt z dowodami i oceną realności problemów)
  - **Wydawca** (TestFlight, App Store Connect, wersjonowanie i metadata)
  - **Sekretarz dokumentacji** (zapis decyzji z datami)
- **Kompromis:** Większy rygor formalny przed każdym commitem i zmianą parametrów ciasta w zamian za 100% stabilność i bezbłędność kalkulatorów.

---

### [DEC-002] 17.10.2026 — Decyzje Audytu Zgodności z Zasadami
- **Status:** ZATWIERDZONE przez Właściciela
- **Postanowienia:**
  1. **Znalezisko 1 (.gitignore):** Wybrano Opcję 1.A — dopisano `.env` oraz `.env.*` do `.gitignore` w celu prewencji wycieku sekretów.
  2. **Znalezisko 2 (Branding Paywall):** Wybrano Opcję 2.A — zmieniono badge w `PaywallModal.tsx` na `APPS4CRAFT PASS` dla 100% spójności ze standardem Apps4Craft Studio.
  3. **Znalezisko 3 (Monetyzacja vs TestFlight):** Wybrano Opcję 3.A — publikacja na TestFlight w obecnej formie z symulowanym paszportem (optymalne do testów beta limitu bochenków), wdrożenie StoreKit zaplanowane jako osobny krok przed publicznym wydaniem w App Store.
  4. **Znalezisko 4 (Rozmiar modułów > 20 KB):** Wybrano Opcję 4.A — zachowanie stabilnej, w 100% przetestowanej struktury ekranów przed wysyłką buildu na TestFlight; dekompozycja na mniejsze subkomponenty po zatwierdzeniu buildu na urządzeniu fizycznym.

