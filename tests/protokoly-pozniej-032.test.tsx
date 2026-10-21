/**
 * Protokoły ratunkowe Doktora są PÓŹNIEJ do czasu źródeł (wybór właściciela 032 b, 2026-10-21): ekran Doktora nie
 * pokazuje sekcji, a opis sklepu w żadnej z 34 lokalizacji nie ma zdania o protokołach [M1-audytor-generalny-032; 03-zakres-505].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import DoctorScreen from '../app/doktor';
import { wejscieWidoczne } from '../src/lib/wejscia-pozniej';

jest.setTimeout(20000);
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const METADANE = join(__dirname, '..', 'docs', 'wydanie', 'metadane');

/** Zdanie o protokołach w każdej lokalizacji opisu przed zmianą (stan e544eec; dowód: akapit Doktora Chleba). */
const ZDANIA: Record<string, string> = {
  'cs.json': 'Čtyři záchranné postupy pomohou, když má těsto během kvašení potíže.',
  'da.json': 'Fire redningsprotokoller hjælper, når dejen har problemer under fermenteringen.',
  'de-DE.json': 'Vier Rettungsprotokolle helfen, wenn der Teig während der Gärung Probleme macht.',
  'el.json': 'Τέσσερα πρωτόκολλα διάσωσης βοηθούν όταν η ζύμη έχει πρόβλημα κατά τη ζύμωση.',
  'en-AU.json': 'Four rescue protocols help with dough that is in trouble during fermentation.',
  'en-CA.json': 'Four rescue protocols help with dough that is in trouble during fermentation.',
  'en-GB.json': 'Four rescue protocols help with dough that is in trouble during fermentation.',
  'en-US.json': 'Four rescue protocols help with dough that is in trouble during fermentation.',
  'es-ES.json': 'Cuatro protocolos de rescate te ayudan cuando la masa tiene problemas durante la fermentación.',
  'es-MX.json': 'Cuatro protocolos de rescate te ayudan cuando la masa tiene problemas durante la fermentación.',
  'fi.json': 'Neljä pelastusohjetta auttaa, kun taikinassa on ongelmia käymisen aikana.',
  'fr-CA.json': 'Quatre protocoles de sauvetage vous aident quand la pâte a un problème pendant la fermentation.',
  'fr-FR.json': 'Quatre protocoles de sauvetage vous aident quand la pâte a un problème pendant la fermentation.',
  'hr.json': 'Četiri protokola spašavanja pomažu kad tijesto ima problem tijekom fermentacije.',
  'hu.json': 'Négy mentőprotokoll segít, ha a tésztával gond van erjedés közben.',
  'id.json': 'Empat protokol penyelamatan membantu saat adonan bermasalah selama fermentasi.',
  'it.json': "Quattro protocolli di soccorso ti aiutano quando l'impasto ha problemi durante la fermentazione.",
  'ja.json': '4つのレスキュー手順が、発酵中にトラブルが起きた生地に役立ちます。',
  'ko.json': '발효 중 반죽에 문제가 생기면 4가지 응급 프로토콜이 도움이 돼요.',
  'ms.json': 'Empat protokol penyelamat membantu apabila doh bermasalah semasa penapaian.',
  'nl-NL.json': 'Vier reddingsprotocollen helpen als het deeg tijdens de fermentatie in de problemen komt.',
  'no.json': 'Fire redningsprotokoller hjelper når deigen får problemer under gjæringen.',
  'pl.json': 'Cztery protokoły ratunkowe pomagają, gdy ciasto ma kłopot w trakcie fermentacji.',
  'pt-BR.json': 'Quatro protocolos de resgate ajudam quando a massa tem problemas durante a fermentação.',
  'pt-PT.json': 'Quatro protocolos de salvamento ajudam quando a massa tem problemas durante a fermentação.',
  'ro.json': 'Patru protocoale de salvare te ajută când aluatul are probleme în timpul fermentării.',
  'ru.json': 'Четыре протокола спасения помогут, если с тестом что-то не так во время брожения.',
  'sk.json': 'Štyri záchranné protokoly pomôžu, keď má cesto počas kvasenia problém.',
  'sl.json': 'Štirje reševalni protokoli pomagajo, ko ima testo težave med fermentacijo.',
  'sv.json': 'Fyra räddningsprotokoll hjälper när degen får problem under jäsningen.',
  'tr.json': 'Dört kurtarma protokolü, fermantasyon sırasında hamurda sorun çıktığında yardımcı olur.',
  'uk.json': 'Чотири рятувальні протоколи допоможуть, коли з тістом проблеми під час ферментації.',
  'vi.json': 'Bốn quy trình cứu nguy giúp bạn khi bột gặp vấn đề trong lúc lên men.',
  'zh-Hant.json': '發酵過程中麵團出狀況時，四套救援流程可以幫上忙。',
};

describe('032 b: protokoły ratunkowe Doktora PÓŹNIEJ (ekran i opis sklepu)', () => {
  it('wejście protokołów jest ukryte, a ekran Doktora nie ma sekcji ani kafelków protokołów', async () => {
    expect(wejscieWidoczne('protokoly-ratunkowe')).toBe(false);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<DoctorScreen />);
      await Promise.resolve();
    });
    const ids = tree!.root.findAll((n) => typeof n.props?.testID === 'string').map((n) => String(n.props.testID));
    expect(ids.filter((id) => id.startsWith('recovery-'))).toEqual([]);
    act(() => tree?.unmount());
  });

  it('34 lokalizacje opisu: lista zdań pokrywa wszystkie pliki metadanych', () => {
    expect(readdirSync(METADANE).filter((f) => f.endsWith('.json')).sort()).toEqual(Object.keys(ZDANIA).sort());
  });

  it.each(Object.entries(ZDANIA))('%s: opis bez zdania o protokołach, akapit Doktora bez pustych miejsc', (plik, zdanie) => {
    const opis: string = JSON.parse(readFileSync(join(METADANE, plik), 'utf8')).opis;
    expect(opis).not.toContain(zdanie);
    expect(opis).not.toMatch(/ {2}| \n|\n /);
  });
});
