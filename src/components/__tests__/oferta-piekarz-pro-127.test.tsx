/**
 * Ekran zakupu „Piekarz Pro” w nowej szacie: stany oferta-proba, zakup-bez-proby, bez-sieci i ładowanie
 * (design-spec §11e 127, makieta docs/design/ekrany/oferta.html) [M1-audytor-generalny-127; 04-studio-projektowe-502;
 * 02-monetyzacja-506]. Ujawnienia U2–U8 z kontraktu płatności (docs/monetyzacja.md); Apple, odczyt 2026-10-21:
 * nazwa i okres subskrypcji, pełna cena odnowienia, długość próby i cena po próbie (developer.apple.com/app-store/subscriptions).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert, StyleSheet } from 'react-native';
import * as Iap from 'expo-iap';
import { PaywallModal } from '../PaywallModal';
import { setLang, t } from '../../lib/i18n';

const mockIap = (Iap as unknown as { __mock: any }).__mock;

const PROBA = [{ id: 'i1', type: 'introductory', paymentMode: 'free-trial', period: { unit: 'day', value: 14 }, periodCount: 1, displayPrice: '0 zł', price: 0 }];

function produkty(zProba: boolean) {
  mockIap.products = [
    { id: 'com.apps4brew.baker.pro.monthly', displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: zProba ? PROBA : [] },
    { id: 'com.apps4brew.baker.pro.yearly', displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: zProba ? PROBA : [] },
    { id: 'com.apps4brew.baker.pro.lifetime', displayPrice: '79,99 zł', type: 'in-app' },
  ];
}

function tekst(node: unknown): string {
  const walk = (n: unknown): string => {
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (!n || typeof n !== 'object') return '';
    if (Array.isArray(n)) return n.map(walk).join(' ');
    return walk(Reflect.get(n, 'children'));
  };
  return walk(node).replace(/\s+/g, ' ').trim();
}

/** Teksty pojedynczych węzłów Text (do kontroli literałów, wersalików i nawiasów). */
function teksty(tree: renderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll((n) => String(n.type) === 'Text')
    .map((n) => tekst(n))
    .filter(Boolean);
}

async function zamontuj(onSubscribe: () => unknown = () => undefined): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<PaywallModal visible={true} onClose={() => undefined} onSubscribe={onSubscribe as never} onRestore={() => false} />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}

const wcisnij = async (tree: renderer.ReactTestRenderer, testID: string) => {
  await act(async () => {
    await tree.root.findByProps({ testID }).props.onPress();
  });
};

describe('127: ekran zakupu „Piekarz Pro” (design-spec §11e)', () => {
  beforeEach(() => {
    mockIap.reset();
    setLang('pl');
  });
  afterAll(() => setLang('pl'));

  it.each([
    ['oferta-proba', () => produkty(true)],
    ['zakup-bez-proby', () => produkty(false)],
    ['bez-sieci', () => (mockIap.products = [])],
  ])('%s: bez plakietki, wersalików, nawiasu z angielskim terminem i kropki środkowej', async (_stan, ustaw) => {
    ustaw();
    const tree = await zamontuj();
    const wszystkie = teksty(tree);
    expect(wszystkie.join(' ')).not.toMatch(/APPS4CRAFT|Read-Only|Lifetime|[•·]/);
    for (const s of wszystkie) {
      const litery = s.replace(/[^\p{L}]/gu, '');
      if (litery.length > 1) expect(litery).not.toBe(litery.toLocaleUpperCase('pl'));
      expect(s).not.toMatch(/\([A-Z][A-Za-z-]+\)/);
    }
    expect(tekst(tree.toJSON())).toContain(t('Piekarz Pro'));
    expect(tree.root.findAllByProps({ testID: 'manage-subscriptions-btn' })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: 'read-only-continue-btn' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('oferta-proba: długość próby, ceny po próbie, ujawnienia U2–U8 i „Zacznij okres próbny” (BR-ZAK-003 Przed startem próby)', async () => {
    produkty(true);
    const tree = await zamontuj();
    const caly = tekst(tree.toJSON());
    expect(tekst(tree.root.findByProps({ testID: 'offer-trial-length' }))).toBe('Okres próbny: 14 dni');
    expect(caly).toContain(t('{cena} rocznie po próbie', { cena: '29,99 zł' }));
    expect(caly).toContain(t('{cena} miesięcznie po próbie', { cena: '4,99 zł' }));
    expect(caly).toContain(t('{cena} jednorazowo', { cena: '79,99 zł' }));
    for (const u of [
      'Jedna opłata. Ten plan nie potrzebuje próby; jeśli masz zaczętą próbę subskrypcji, anuluj ją, żeby za nią nie płacić.',
      'Subskrypcja odnawia się sama. Żeby nie płacić, anuluj ją najpóźniej 24 godziny przed końcem próby: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.',
      'Bez zakupu zostaną historia i twoje dane. Liczenie, plan i prowadzenie będą wymagać Piekarz Pro.',
      'Próba jest jedna na oba plany subskrypcji.',
      'Założenie zakwasu wymaga kilku dni regularnego dokarmiania; średnio trwa 7–10 dni.',
      'Zakup wymaga połączenia z App Store.',
    ])
      expect(caly).toContain(t(u));
    expect(tekst(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(t('Zacznij okres próbny'));
    await wcisnij(tree, 'plan-lifetime-btn');
    expect(tekst(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(t('Kup dostęp dożywotni'));
    act(() => tree.unmount());
  });

  it('zakup-bez-proby: „Kup plan …”, ceny bez „po próbie”, U2 krótkie i U8', async () => {
    produkty(false);
    const tree = await zamontuj();
    const caly = tekst(tree.toJSON());
    expect(caly).toContain(t('{cena} rocznie', { cena: '29,99 zł' }));
    expect(caly).toContain(t('{cena} miesięcznie', { cena: '4,99 zł' }));
    expect(caly).not.toMatch(/po próbie|Okres próbny/);
    expect(caly).toContain(t('Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.'));
    expect(caly).toContain(t('Zakup wymaga połączenia z App Store.'));
    expect(tekst(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(t('Kup plan roczny'));
    await wcisnij(tree, 'plan-monthly-btn');
    expect(tekst(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe(t('Kup plan miesięczny'));
    act(() => tree.unmount());
  });

  it('kwota do pobrania jest największym elementem opcji; opcje to radio z „checked”', async () => {
    produkty(false);
    const tree = await zamontuj();
    const roczny = tree.root.find((n) => n.props.testID === 'plan-yearly-btn' && n.props.accessibilityRole !== undefined);
    expect(roczny.props.accessibilityRole).toBe('radio');
    expect(roczny.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
    const rozmiar = (n: renderer.ReactTestInstance) => Number(StyleSheet.flatten(n.props.style)?.fontSize ?? 0);
    const wezly = roczny.findAll((n) => String(n.type) === 'Text');
    const najwiekszy = wezly.reduce((a, b) => (rozmiar(b) > rozmiar(a) ? b : a));
    expect(tekst(najwiekszy)).toBe(t('{cena} rocznie', { cena: '29,99 zł' }));
    act(() => tree.unmount());
  });

  it('BR-PRYW-001 Zakup bez sieci: komunikat o połączeniu z App Store, bez opcji i kwot, „Spróbuj ponownie” czyta ofertę jeszcze raz', async () => {
    mockIap.products = [];
    const tree = await zamontuj();
    expect(tekst(tree.root.findByProps({ testID: 'offer-no-connection' }))).toBe(
      t('Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.')
    );
    expect(tree.root.findAllByProps({ testID: 'plan-yearly-btn' })).toHaveLength(0);
    expect(tekst(tree.toJSON())).not.toMatch(/—|zł/);
    produkty(false);
    await wcisnij(tree, 'offer-retry-btn');
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    expect(tekst(tree.toJSON())).toContain(t('{cena} rocznie', { cena: '29,99 zł' }));
    act(() => tree.unmount());
  });

  it('BR-PRYW-001 Zakup bez sieci: błąd zakupu mówi, że zakup wymaga połączenia z App Store', async () => {
    produkty(false);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const tree = await zamontuj(() => Promise.reject(new Error('offline')));
    await wcisnij(tree, 'subscribe-submit-btn');
    expect(alert).toHaveBeenCalledWith(t('Zakup'), t('Nie udało się dokończyć zakupu. Zakup wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.'));
    alert.mockRestore();
    act(() => tree.unmount());
  });

  it('ładowanie: przed odpowiedzią sklepu przycisk zakupu nieaktywny i bez „—”', async () => {
    produkty(false);
    let tree: renderer.ReactTestRenderer | null = null;
    act(() => {
      tree = renderer.create(<PaywallModal visible={true} onClose={() => undefined} onSubscribe={() => undefined} />);
    });
    const przycisk = tree!.root.findByProps({ testID: 'subscribe-submit-btn' });
    expect(przycisk.props.disabled).toBe(true);
    expect(tekst(tree!.toJSON())).not.toContain('—');
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    act(() => tree!.unmount());
  });

  it('EN: „Baker Pro” jak w App Store Connect, „Free trial: 14 days”, „Start Free Trial”, „Terms of Use”', async () => {
    setLang('en');
    produkty(true);
    const tree = await zamontuj();
    const caly = tekst(tree.toJSON());
    expect(caly).toContain('Baker Pro');
    expect(caly).not.toContain('Piekarz');
    expect(tekst(tree.root.findByProps({ testID: 'offer-trial-length' }))).toBe('Free trial: 14 days');
    expect(tekst(tree.root.findByProps({ testID: 'subscribe-submit-btn' }))).toBe('Start Free Trial');
    expect(tekst(tree.root.findByProps({ testID: 'terms-of-use-btn' }))).toBe('Terms of Use');
    act(() => tree.unmount());
  });
});
