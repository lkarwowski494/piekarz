-- Baza buildu 1014 (v1.0.0-b1014 = f42c0d8; 1015 = 2b0db0f i 1016 bez zmian w src/data): schemat po migracjach 1–5
-- i dane zapisane kodem zapisu tego buildu (initDatabase, createStarterWithEntry, addStarterEntry, saveRecipe,
-- saveFlourInventoryItem, saveBakeLog, setAppSetting, toggleLessonProgress, saveBakeSession). Zrzut jak sqlite3 .dump.
-- Bez danych osobowych. Generator: audit/M3-2026-10-22/role/08-d1 (etap 1). Nie edytować ręcznie.
PRAGMA journal_mode = WAL;
BEGIN;
CREATE TABLE schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL,
      description TEXT NOT NULL
    );
INSERT INTO "schema_migrations" (version, applied_at, description) VALUES (1, '2026-10-01T00:00:00.000Z', 'Initial artisan bread schema v1.0');
INSERT INTO "schema_migrations" (version, applied_at, description) VALUES (2, '2026-10-01T00:00:00.000Z', 'Sensory crumb scores and starter feeding ratio v1.1');
INSERT INTO "schema_migrations" (version, applied_at, description) VALUES (3, '2026-10-01T00:00:00.000Z', 'Cryptographic tamper seal signature for app_access v2.0');
INSERT INTO "schema_migrations" (version, applied_at, description) VALUES (4, '2026-10-01T00:00:00.000Z', 'Last feeding ratio of a starter');
INSERT INTO "schema_migrations" (version, applied_at, description) VALUES (5, '2026-10-01T00:00:00.000Z', 'Starter entry log (ADR-008)');
CREATE TABLE bakes (
          id TEXT PRIMARY KEY NOT NULL,
          recipe_name TEXT NOT NULL,
          started_at INTEGER NOT NULL,
          finished_at INTEGER,
          ambient_temp REAL,
          actual_ddt REAL,
          rating_stars INTEGER,
          notes TEXT
        , crumb_score INTEGER, crust_score INTEGER, taste_profile TEXT, sensory_profile TEXT);
INSERT INTO "bakes" (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile) VALUES ('bake_1', 'Mój chleb mieszany', 1799222400000, 1799308800000, 22, 25.5, 4, 'Ładne ucho', 4, 5, 'balanced', '{"crustCrispness":5,"crumbElasticity":4,"acidity":3,"openCrumb":4,"caramelization":5}');
INSERT INTO "bakes" (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile) VALUES ('bake_2', 'Pszenny weekendowy', 1799568000000, 1799654400000, NULL, NULL, 2, 'Za krótko w piekarniku', 2, NULL, 'mild', NULL);
INSERT INTO "bakes" (id, recipe_name, started_at, finished_at, ambient_temp, actual_ddt, rating_stars, notes, crumb_score, crust_score, taste_profile, sensory_profile) VALUES ('bake_3', 'Chleb pszenny na zakwasie', 1799740800000, 1799827200000, NULL, NULL, 5, NULL, NULL, NULL, NULL, NULL);
CREATE TABLE starters (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          flour_type TEXT NOT NULL,
          hydration REAL NOT NULL DEFAULT 100.0,
          birth_date INTEGER NOT NULL,
          storage_state TEXT NOT NULL DEFAULT 'ROOM_TEMP',
          last_fed_at INTEGER
        , feeding_ratio TEXT DEFAULT '1:1:1', last_feed_ratio TEXT, setup_started_at INTEGER, setup_completed_at INTEGER);
INSERT INTO "starters" (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at, feeding_ratio, last_feed_ratio, setup_started_at, setup_completed_at) VALUES ('starter_lodowka', 'Zakwas żytni', 'Żytnia typ 2000', 100, 1794816000000, 'FRIDGE', NULL, '1:1:1', NULL, 1794816000000, 1795507200000);
INSERT INTO "starters" (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at, feeding_ratio, last_feed_ratio, setup_started_at, setup_completed_at) VALUES ('starter_blat', 'Zakwas pszenny', 'Pszenna typ 750', 100, 1796544000000, 'ROOM_TEMP', NULL, '1:1:1', NULL, NULL, NULL);
CREATE TABLE recipes (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          formula_json TEXT NOT NULL,
          target_ddt REAL NOT NULL DEFAULT 25.0,
          notes TEXT,
          is_built_in INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL
        );
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('country_loaf_72', 'Wiejski chleb codzienny na zakwasie', '{"flours":[{"name":"Mąka pszenna chlebowa typ 750","percentage":80,"type":"pszenna_750"},{"name":"Mąka żytnia typ 720","percentage":20,"type":"zytnia_720"}],"waterPercentage":68,"saltPercentage":2,"starterPercentage":20,"starterHydration":100,"targetDoughWeightGrams":900}', 25, 'Wypiek w garnku żeliwnym. 4 serie składań zwojowych w odstępach 30 minut. Garowanie w lodówce 12–16 godzin.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('tartine_high_hydration_80', 'Mistrzowski wiejski w stylu Tartine, 80%', '{"flours":[{"name":"Mąka pszenna Manitoba","percentage":90,"type":"pszenna_manitoba"},{"name":"Mąka pszenna razowa typ 2000","percentage":10,"type":"pszenna_razowa"}],"waterPercentage":76,"saltPercentage":2,"starterPercentage":20,"starterHydration":100,"targetDoughWeightGrams":950}', 26, 'Wymaga mąki o zawartości białka minimum 13%. Autoliza 60 minut bez soli. Bardzo delikatne składania zwojowe.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('san_francisco_sourdough', 'Chleb w stylu San Francisco o wyrazistej kwasowości', '{"flours":[{"name":"Mąka pszenna chlebowa typ 750","percentage":90,"type":"pszenna_750"},{"name":"Mąka żytnia typ 2000","percentage":10,"type":"zytnia_2000"}],"waterPercentage":70,"saltPercentage":2.1,"starterPercentage":15,"starterHydration":100,"targetDoughWeightGrams":920}', 24, 'Wydłużona fermentacja w chłodzie (18–24 h w 4°C). Niższą temperaturę fermentacji wiąże się z kwasem octowym. Wypiek z mocnym zaparowaniem.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('pain_de_campagne', 'Francuski Pain de Campagne (Chleb Wiejski)', '{"flours":[{"name":"Mąka pszenna chlebowa typ 750","percentage":75,"type":"pszenna_750"},{"name":"Mąka pszenna typ 1850 (Graham)","percentage":15,"type":"pszenna_graham"},{"name":"Mąka żytnia typ 720","percentage":10,"type":"zytnia_720"}],"waterPercentage":69,"saltPercentage":2,"starterPercentage":20,"starterHydration":100,"targetDoughWeightGrams":930}', 24.5, 'Klasyczna trójkombinacja mąk: pszenna jasna, graham i żytnia chlebowa. 3 serie delikatnego stretch & fold, garowanie w owalnym koszyku.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('baguette_tradition_poolish', 'Bagietka paryska na poolishu', '{"flours":[{"name":"Mąka pszenna typ 650 (Bułkowa)","percentage":100,"type":"pszenna_650"}],"waterPercentage":72,"saltPercentage":2,"starterPercentage":0,"extraYeastPercentage":0.2,"targetDoughWeightGrams":750}', 22.5, 'Zaczyn Poolish (20% mąki i 100% hydratacji). Pieczenie na rozgrzanej płycie stalowej lub szamocie z intensywnym zaparowaniem.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('ciabatta_con_biga', 'Włoska Ciabatta z Bigą (Wysoka Hydratacja 82%)', '{"flours":[{"name":"Mąka pszenna Manitoba","percentage":100,"type":"pszenna_manitoba"}],"waterPercentage":82,"saltPercentage":2.2,"starterPercentage":0,"extraYeastPercentage":0.3,"targetDoughWeightGrams":850}', 23, 'Biga (sztywny zaczyn 50% hydratacji) dojrzewający 16 h w 18°C. Do ciasta właściwego dodaj 3% oliwy z oliwek. Nie odgazowuj ciasta przed pieczeniem.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('focaccia_genovese', 'Focaccia Genovese z solanką i rozmarynem', '{"flours":[{"name":"Mąka pszenna typ 650 (Bułkowa)","percentage":85,"type":"pszenna_650"},{"name":"Mąka z pszenicy durum (Semolina)","percentage":15,"type":"durum"}],"waterPercentage":80,"saltPercentage":2.2,"starterPercentage":0,"extraYeastPercentage":0.5,"targetDoughWeightGrams":900}', 24, 'Przełóż na obficie naoliwioną blachę. Przed włożeniem do pieca polej emulsją solankową (woda, oliwa, sól) i energicznie ugnieć palcami tworząc wgłębienia.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('rye_100_pan', 'Tradycyjny chleb 100% żytni razowy', '{"flours":[{"name":"Mąka żytnia typ 2000","percentage":100,"type":"zytnia_2000"}],"waterPercentage":78,"saltPercentage":1.8,"starterPercentage":30,"starterHydration":100,"targetDoughWeightGrams":1000}', 28, 'Wymieszaj i przełóż bezpośrednio do wysmarowanej i posypanej otrębami keksówki. Jednorazowy rozrost w cieple do podwojenia (ok. 3–4 h). Według King Arthur Baking upieczony chleb żytni na zakwasie powinien odpocząć 24 godziny przed krojeniem, dla najlepszej jakości.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('borodinsky_rye', 'Chleb Borodyński (Żytni na słodzie z kolendrą)', '{"flours":[{"name":"Mąka żytnia typ 2000","percentage":85,"type":"zytnia_2000"},{"name":"Mąka żytnia typ 720","percentage":15,"type":"zytnia_720"}],"waterPercentage":82,"saltPercentage":1.8,"starterPercentage":35,"starterHydration":100,"targetDoughWeightGrams":1050}', 29, 'Wymaga zaparzenia czerwonego słodu żytniego wrzątkiem wraz ze zmieloną kolendrą. Wierzch przed pieczeniem posyp całymi ziarnami kolendry.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('spelt_ancient_seeded', 'Pradawny chleb orkiszowy z prażonymi ziarnami', '{"flours":[{"name":"Mąka orkiszowa","percentage":70,"type":"orkisz_630"},{"name":"Mąka orkiszowa typ 2000","percentage":30,"type":"orkisz_2000"}],"waterPercentage":68,"saltPercentage":2,"starterPercentage":20,"starterHydration":100,"targetDoughWeightGrams":920}', 24, 'Ziarna upraż na suchej patelni i zalej ciepłą wodą na 2 h przed dodaniem do ciasta przy laminacji. Orkisz wyrabiaj delikatnie, unikaj nadmiernego naciągania.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('lievito_madre_panettone_brioche', 'Rzemieślnicza maślana brioszka na Lievito Madre', '{"flours":[{"name":"Mąka pszenna Manitoba","percentage":100,"type":"pszenna_manitoba"}],"waterPercentage":46,"saltPercentage":1.2,"starterPercentage":30,"starterHydration":50,"targetDoughWeightGrams":800}', 25, 'Lievito Madre odśwież 3 razy co 4 h przed zarobieniem ciasta. Masło (25%) dodawaj stopniowo porcjami pod koniec wyrabiania, gdy siatka glutenowa jest już w pełni rozwinięta.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('graham_bread_honey', 'Chleb Graham z miodem i siemieniem', '{"flours":[{"name":"Mąka pszenna typ 1850 (Graham)","percentage":60,"type":"pszenna_graham"},{"name":"Mąka pszenna chlebowa typ 750","percentage":40,"type":"pszenna_750"}],"waterPercentage":72,"saltPercentage":2,"starterPercentage":20,"starterHydration":100,"targetDoughWeightGrams":900}', 25, 'Dodatek łyżki miodu wspomaga fermentację i łagodzi kwasowość. Grube otręby z Grahama wymagają 45-minutowej autolizy.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('no_knead_night', 'Chleb nocny bez wyrabiania (drożdżowy)', '{"flours":[{"name":"Mąka pszenna typ 650 (Bułkowa)","percentage":100,"type":"pszenna_650"}],"waterPercentage":75,"saltPercentage":2,"starterPercentage":0,"extraYeastPercentage":0.25,"targetDoughWeightGrams":880}', 22, 'Wymieszaj składniki w misce łyżką. Przykryj folią i zostaw na 12–16 godzin w temperaturze pokojowej. Bez składania.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('pizza_napoletana_48h', 'Pizza Napoletana Verace (48 h)', '{"flours":[{"name":"Mąka pszenna włoska Tipo 00","percentage":100,"type":"tipo_00"}],"waterPercentage":65,"saltPercentage":2.8,"starterPercentage":0,"extraYeastPercentage":0.08,"targetDoughWeightGrams":1000}', 23, 'Fermentacja: 2 h na blacie, porcjowanie w kulki 250g, 46 h w lodówce (4°C). Wyjmij 2 h przed pieczeniem.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('sweet_chalka', 'Maślana chałka drożdżowa', '{"flours":[{"name":"Mąka pszenna typ 550 (Luksusowa)","percentage":100,"type":"pszenna_550"}],"waterPercentage":45,"saltPercentage":1,"starterPercentage":0,"extraYeastPercentage":1.2,"targetDoughWeightGrams":750}', 26, 'Wyrabiaj z dodatkiem masła i cukru. Po wyrośnięciu zapleć warkocz, posmaruj roztrzepanym jajkiem i posyp kruszonką.', 1, 0);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('recipe_user_1', 'Mój chleb mieszany', '{"flours":[{"name":"Mąka pszenna typ 750","percentage":80},{"name":"Mąka żytnia typ 2000","percentage":20}],"waterPercentage":72,"saltPercentage":2,"starterPercentage":20,"targetDoughWeightGrams":900}', 25, 'Dłużej garować', 0, 1798704000000);
INSERT INTO "recipes" (id, name, formula_json, target_ddt, notes, is_built_in, created_at) VALUES ('recipe_user_2', 'Pszenny weekendowy', '{"flours":[{"name":"Mąka pszenna typ 750","percentage":100}],"waterPercentage":68,"saltPercentage":2,"starterPercentage":20,"targetDoughWeightGrams":900}', 24, NULL, 0, 1798790400000);
CREATE TABLE flour_inventory (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          stock_grams REAL NOT NULL DEFAULT 0.0,
          brand TEXT,
          protein_pct REAL,
          updated_at INTEGER NOT NULL
        );
INSERT INTO "flour_inventory" (id, name, stock_grams, brand, protein_pct, updated_at) VALUES ('flour_750', 'Mąka pszenna typ 750', 2500, NULL, 12, 1799136000000);
INSERT INTO "flour_inventory" (id, name, stock_grams, brand, protein_pct, updated_at) VALUES ('flour_2000', 'Mąka żytnia typ 2000', 800, 'Młyn', NULL, 1799136000000);
CREATE TABLE lesson_progress (
          level_id INTEGER PRIMARY KEY NOT NULL,
          completed_at INTEGER NOT NULL
        );
INSERT INTO "lesson_progress" (level_id, completed_at) VALUES (1, 1798272000000);
INSERT INTO "lesson_progress" (level_id, completed_at) VALUES (2, 1798358400000);
CREATE TABLE app_access (
          id TEXT PRIMARY KEY NOT NULL,
          trial_started_at INTEGER NOT NULL,
          trial_days INTEGER NOT NULL DEFAULT 14,
          subscription_tier TEXT NOT NULL DEFAULT 'none',
          subscription_expires_at INTEGER,
          completed_bakes_count INTEGER NOT NULL DEFAULT 0,
          signature TEXT
        );
CREATE TABLE app_settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
INSERT INTO "app_settings" (key, value) VALUES ('language', 'pl');
INSERT INTO "app_settings" (key, value) VALUES ('unit_system', 'metric');
INSERT INTO "app_settings" (key, value) VALUES ('godziny_snu', 'early_bird');
INSERT INTO "app_settings" (key, value) VALUES ('selected_baking_vessel', 'dutch_oven');
INSERT INTO "app_settings" (key, value) VALUES ('has_completed_onboarding', 'true');
INSERT INTO "app_settings" (key, value) VALUES ('przypomnienia_karmienia', '1');
INSERT INTO "app_settings" (key, value) VALUES ('active_bake_session', '{"version":2,"steps":[{"id":"starter_feed","name":"Dokarmienie zakwasu (osiągnięcie szczytu)","category":"starter_feed","durationMin":360,"isPassive":true,"rekaNaStarcie":true,"instructions":"Dokarm zakwas mąką i letnią wodą. Odstaw w ciepłe miejsce do podwojenia objętości.","plannedStart":1800000000000,"plannedEnd":1800021600000},{"id":"autolyse","name":"Autoliza (mąka + woda)","category":"autolyse","durationMin":45,"isPassive":true,"rekaNaStarcie":true,"instructions":"Połącz mąkę i wodę do zwilżenia. Przykryj i odstaw do spontanicznego rozwinięcia glutenu.","plannedStart":1800021600000,"plannedEnd":1800024300000},{"id":"mix","name":"Wymieszanie z solą i zakwasem","category":"mix","durationMin":15,"isPassive":false,"instructions":"Dodaj aktywny zakwas i sól. Wyrabiaj do połączenia i uzyskania gładkiej struktury. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.","plannedStart":1800024300000,"plannedEnd":1800025200000},{"id":"bulk_ferment","name":"Fermentacja burzliwa ze składaniami","category":"bulk_ferment","durationMin":299,"isPassive":false,"instructions":"Wykonaj 4 serie składań co 30–45 minut.","plannedStart":1800025200000,"plannedEnd":1800043140000},{"id":"pre_shape","name":"Formowanie wstępne","category":"pre_shape","durationMin":10,"isPassive":false,"instructions":"Wyłóż ciasto na blat, nadaj wstępny kształt kuli i napnij powierzchnię.","plannedStart":1800043140000,"plannedEnd":1800043740000},{"id":"bench_rest","name":"Odpoczynek na desce","category":"bench_rest","durationMin":20,"isPassive":true,"instructions":"Pozostaw ciasto pod przykryciem, aby gluten się rozluźnił przed ostatecznym formowaniem.","plannedStart":1800043740000,"plannedEnd":1800044940000},{"id":"final_shape","name":"Formowanie ostateczne i koszyk","category":"final_shape","durationMin":15,"isPassive":false,"instructions":"Uformuj batard lub boule, napnij mocno skórkę i przełóż do koszyka oprószonego mąką ryżową.","plannedStart":1800044940000,"plannedEnd":1800045840000},{"id":"final_proof","name":"Garowanie chłodnicze w lodówce","category":"final_proof","durationMin":840,"isPassive":true,"instructions":"Wstaw koszyk w szczelnej torbie do lodówki (4–6°C). Długa fermentacja nada chlebowi głęboki aromat.","plannedStart":1800045840000,"plannedEnd":1800096240000},{"id":"preheat_oven","name":"Nagrzewanie pieca i garnka żeliwnego","category":"preheat_oven","durationMin":45,"isPassive":true,"rekaNaStarcie":true,"instructions":"Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.","plannedStart":1800096240000,"plannedEnd":1800098940000},{"id":"bake","name":"Wypiek z parą i rumienienie","category":"bake","durationMin":45,"isPassive":false,"instructions":"Przełóż bochenek na papier, natnij żyletką pod kątem 30°. Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).","plannedStart":1800098940000,"plannedEnd":1800101640000},{"id":"cool","name":"Studzenie na kratce","category":"cool","durationMin":120,"isPassive":true,"instructions":"Wyjmij na metalową kratkę. Według King Arthur Baking chleb w czasie studzenia oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić; pokrojony za wcześnie może być gumowaty.","plannedStart":1800101640000,"plannedEnd":1800108840000}],"stepIdx":1,"dutchOvenPhase":"lid_on","timerEndsAt":null,"pausedLeftSec":1234,"recipeName":"Mój chleb mieszany","startedAt":1800000000000,"bake":{"id":"bake_live","recipeName":"Mój chleb mieszany","startedAt":1800000000000,"currentStageId":"autolyse","ambientTempC":22,"recipeFormula":{"flours":[{"name":"Mąka pszenna typ 750","percentage":80},{"name":"Mąka żytnia typ 2000","percentage":20}],"waterPercentage":72,"saltPercentage":2,"starterPercentage":20,"targetDoughWeightGrams":900},"starterId":"starter_blat","zaczetyZDostepem":true,"steps":[{"id":"starter_feed","name":"Dokarmienie zakwasu (osiągnięcie szczytu)","category":"starter_feed","durationMin":360,"isPassive":true,"rekaNaStarcie":true,"instructions":"Dokarm zakwas mąką i letnią wodą. Odstaw w ciepłe miejsce do podwojenia objętości.","plannedStart":1800000000000,"plannedEnd":1800021600000},{"id":"autolyse","name":"Autoliza (mąka + woda)","category":"autolyse","durationMin":45,"isPassive":true,"rekaNaStarcie":true,"instructions":"Połącz mąkę i wodę do zwilżenia. Przykryj i odstaw do spontanicznego rozwinięcia glutenu.","plannedStart":1800021600000,"plannedEnd":1800024300000},{"id":"mix","name":"Wymieszanie z solą i zakwasem","category":"mix","durationMin":15,"isPassive":false,"instructions":"Dodaj aktywny zakwas i sól. Wyrabiaj do połączenia i uzyskania gładkiej struktury. Nie próbuj surowego ciasta ani mąki. Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.","plannedStart":1800024300000,"plannedEnd":1800025200000},{"id":"bulk_ferment","name":"Fermentacja burzliwa ze składaniami","category":"bulk_ferment","durationMin":299,"isPassive":false,"instructions":"Wykonaj 4 serie składań co 30–45 minut.","plannedStart":1800025200000,"plannedEnd":1800043140000},{"id":"pre_shape","name":"Formowanie wstępne","category":"pre_shape","durationMin":10,"isPassive":false,"instructions":"Wyłóż ciasto na blat, nadaj wstępny kształt kuli i napnij powierzchnię.","plannedStart":1800043140000,"plannedEnd":1800043740000},{"id":"bench_rest","name":"Odpoczynek na desce","category":"bench_rest","durationMin":20,"isPassive":true,"instructions":"Pozostaw ciasto pod przykryciem, aby gluten się rozluźnił przed ostatecznym formowaniem.","plannedStart":1800043740000,"plannedEnd":1800044940000},{"id":"final_shape","name":"Formowanie ostateczne i koszyk","category":"final_shape","durationMin":15,"isPassive":false,"instructions":"Uformuj batard lub boule, napnij mocno skórkę i przełóż do koszyka oprószonego mąką ryżową.","plannedStart":1800044940000,"plannedEnd":1800045840000},{"id":"final_proof","name":"Garowanie chłodnicze w lodówce","category":"final_proof","durationMin":840,"isPassive":true,"instructions":"Wstaw koszyk w szczelnej torbie do lodówki (4–6°C). Długa fermentacja nada chlebowi głęboki aromat.","plannedStart":1800045840000,"plannedEnd":1800096240000},{"id":"preheat_oven","name":"Nagrzewanie pieca i garnka żeliwnego","category":"preheat_oven","durationMin":45,"isPassive":true,"rekaNaStarcie":true,"instructions":"Wstaw garnek żeliwny do piekarnika i rozgrzej do 240°C.","plannedStart":1800096240000,"plannedEnd":1800098940000},{"id":"bake","name":"Wypiek z parą i rumienienie","category":"bake","durationMin":45,"isPassive":false,"instructions":"Przełóż bochenek na papier, natnij żyletką pod kątem 30°. Piecz 20 min pod pokrywką (240°C) + 25 min bez (210°C).","plannedStart":1800098940000,"plannedEnd":1800101640000},{"id":"cool","name":"Studzenie na kratce","category":"cool","durationMin":120,"isPassive":true,"instructions":"Wyjmij na metalową kratkę. Według King Arthur Baking chleb w czasie studzenia oddaje wilgoć, a miękisz potrzebuje tego czasu, żeby się ustalić; pokrojony za wcześnie może być gumowaty.","plannedStart":1800101640000,"plannedEnd":1800108840000}]}}');
CREATE TABLE pending_ops (
          id TEXT PRIMARY KEY NOT NULL,
          op_type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING'
        );
CREATE TABLE starter_entries (
          id TEXT PRIMARY KEY NOT NULL,
          starter_id TEXT NOT NULL REFERENCES starters(id) ON DELETE CASCADE,
          kind TEXT NOT NULL CHECK (kind IN ('feeding', 'observation')),
          occurred_at INTEGER NOT NULL CHECK (occurred_at > 0),
          feed_ratio TEXT,
          flour_grams REAL CHECK (flour_grams IS NULL OR flour_grams > 0),
          water_grams REAL CHECK (water_grams IS NULL OR water_grams > 0),
          signs TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(signs) AND json_type(signs) = 'array'),
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          CHECK (kind = 'feeding' OR (feed_ratio IS NULL AND flour_grams IS NULL AND water_grams IS NULL))
        );
INSERT INTO "starter_entries" (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at) VALUES ('e_l_1', 'starter_lodowka', 'feeding', 1794816000000, '1:1:1', 50, 50, '[]', 1794816000000, 1794816000000);
INSERT INTO "starter_entries" (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at) VALUES ('e_l_2', 'starter_lodowka', 'observation', 1795507200000, NULL, NULL, NULL, '["bubbles","doubled"]', 1795507200000, 1795507200000);
INSERT INTO "starter_entries" (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at) VALUES ('e_l_3', 'starter_lodowka', 'feeding', 1799481600000, '1:5:5', 100, 100, '[]', 1799481600000, 1799481600000);
INSERT INTO "starter_entries" (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at) VALUES ('e_b_1', 'starter_blat', 'feeding', 1799913600000, '1:2:2', 40, 40, '[]', 1796544000000, 1796544000000);
INSERT INTO "starter_entries" (id, starter_id, kind, occurred_at, feed_ratio, flour_grams, water_grams, signs, created_at, updated_at) VALUES ('e_b_2', 'starter_blat', 'observation', 1799935200000, NULL, NULL, NULL, '["rose"]', 1799935200000, 1799935200000);
CREATE INDEX idx_bakes_started_at ON bakes(started_at DESC);
CREATE INDEX idx_starters_last_fed_at ON starters(last_fed_at DESC);
CREATE INDEX idx_recipes_is_built_in ON recipes(is_built_in, created_at DESC);
CREATE INDEX idx_flour_inventory_name ON flour_inventory(name);
CREATE INDEX idx_pending_ops_status ON pending_ops(status, created_at ASC);
CREATE INDEX idx_starter_entries_starter_kind_at ON starter_entries(starter_id, kind, occurred_at DESC);
PRAGMA user_version = 5;
COMMIT;
