// ============================================================================
// Piekarz — profil zakwasu w karcie z wierszami (karty/README.md §2–§4: Karta + WierszKarty, wartości 17 pt
// cyframi tabelarycznymi) [M3 p2]. „Edytuj” na pasie ekranu (makieta zakwasy.html, stan „z zakwasem”).
// Mąka i hydratacja, wiek, ostatnie dokarmienie, miejsce (bez bloku statystyk, §12a) [M1-audytor-generalny-111].
// ============================================================================

import React from 'react';
import { t, tPlural } from '../../lib/i18n';
import { StoredStarter } from '../../data/db';
import { formatTextUnits, UnitSystem } from '../../lib/unit-converter';
import { Karta } from '../../ui/karty/Karta';
import { WierszKarty } from '../../ui/karty/WierszKarty';
import { IkonaKarty } from '../../ui/karty/IkonaKarty';

export interface StarterProfileCardProps {
  starter: StoredStarter;
  ageDays: number;
  lastFedLabel: string;
  unitSystem: UnitSystem;
}

export function StarterProfileCard({ starter, ageDays, lastFedLabel, unitSystem }: StarterProfileCardProps) {
  const hydratacja = `${t('Hydratacja')} ${starter.hydration}%`;
  return (
    <Karta testID="karta-profil" tytul={t('Profil zakwasu')} ikona={<IkonaKarty nazwa="info" />} bezWypelnienia>
      {starter.flourType ? (
        <WierszKarty testID="profil-maka" etykieta={starter.flourType} podpis={hydratacja} linia={false} />
      ) : (
        <WierszKarty testID="profil-maka" etykieta={hydratacja} linia={false} />
      )}
      <WierszKarty
        testID="profil-wiek"
        etykieta={t('Wiek zakwasu')}
        wartosc={tPlural(ageDays, { one: '{n} dzień', few: '{n} dni', many: '{n} dni', other: '{n} dnia' })}
      />
      <WierszKarty testID="profil-dokarmienie" etykieta={t('Ostatnie dokarmienie')} wartosc={lastFedLabel} />
      <WierszKarty
        testID="profil-miejsce"
        etykieta={t('Miejsce przechowywania')}
        wartosc={starter.storageState === 'FRIDGE' ? formatTextUnits(t('W lodówce (4°C)'), unitSystem) : t('Temperatura pokojowa')}
      />
    </Karta>
  );
}
