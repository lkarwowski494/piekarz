import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BreadAcademyModal } from '../BreadAcademyModal';
import { _resetMemStore, getCompletedLessons } from '../../data/sqlite-store';
import { getBreadSchoolLessons } from '../../core/bread-school';

describe('BreadAcademyModal Component (SCI, BIB, TRE)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    _resetMemStore();
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
    jest.clearAllMocks();
  });

  it('renders modal when visible is true and shows the close button and tabs', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'close-modal' })).toBeDefined();
    expect(root.findByProps({ testID: 'academy-tab-school' })).toBeDefined();
    expect(root.findByProps({ testID: 'academy-tab-techniques' })).toBeDefined();
  });

  it('allows toggling lesson completion in Bread School tab', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const lessonCard = root.findByProps({ testID: 'lesson-card-1' });
    expect(lessonCard).toBeDefined();

    // Expand lesson 1
    const expandBtn = root.findByProps({ testID: 'expand-lesson-btn-1' });
    await act(async () => {
      expandBtn.props.onPress();
    });

    const toggleBtn = root.findByProps({ testID: 'toggle-lesson-completed-btn-1' });
    await act(async () => {
      toggleBtn.props.onPress();
    });

    // Verify toggle re-rendered
    expect(root.findByProps({ testID: 'toggle-lesson-completed-btn-1' })).toBeDefined();
  });

  it('switches to Techniques tab and displays technique cards', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const techTab = root.findByProps({ testID: 'academy-tab-techniques' });

    await act(async () => {
      techTab.props.onPress();
    });

    const autolyseCard = root.findByProps({ testID: 'tech-card-BIB-01' });
    expect(autolyseCard).toBeDefined();
  });

  // BR-NAUK-001, kryteria 2–3 (F-44, ZM-11; D-034 wybór 4b) [M1-audytor-generalny-032]
  const allText = (root: renderer.ReactTestInstance): string =>
    root
      .findAll((n) => (n.type as unknown) === 'Text')
      .map((n) => {
        const flat = (c: unknown): string =>
          typeof c === 'string' || typeof c === 'number' ? String(c) : Array.isArray(c) ? c.map(flat).join('') : '';
        return flat(n.props.children);
      })
      .join('\n');
  const rankTitles = ['Uczeń Piekarski', ...getBreadSchoolLessons().map((l) => l.rankTitlePl)];

  it('shows no baker rank, rank badge or rank progress bar, also after a lesson is completed', async () => {
    await act(async () => {
      tree = renderer.create(<BreadAcademyModal visible={true} onClose={mockOnClose} />);
    });
    const root = tree!.root;
    await act(async () => {
      root.findByProps({ testID: 'expand-lesson-btn-1' }).props.onPress();
    });
    await act(async () => {
      root.findByProps({ testID: 'toggle-lesson-completed-btn-1' }).props.onPress();
    });
    const text = allText(root);
    for (const title of rankTitles) expect(text).not.toContain(title);
    // Odznaka rangi miała 🏅; ikona przy „Kryterium zaliczenia” lekcji to nie ranga.
    expect(text).not.toMatch(/🏅 (?!Kryterium zaliczenia:)/u);
    expect(root.findAll((n) => n.props?.style && JSON.stringify(n.props.style).includes('"width":"')).length).toBe(0);
  });

  it('a lesson marked as read stays marked after the Academy is opened again (lesson_progress)', async () => {
    await act(async () => {
      tree = renderer.create(<BreadAcademyModal visible={true} onClose={mockOnClose} />);
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'expand-lesson-btn-2' }).props.onPress();
    });
    await act(async () => {
      await tree!.root.findByProps({ testID: 'toggle-lesson-completed-btn-2' }).props.onPress();
    });
    act(() => tree!.unmount());
    expect(await getCompletedLessons()).toEqual([2]);
    await act(async () => {
      tree = renderer.create(<BreadAcademyModal visible={true} onClose={mockOnClose} />);
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'expand-lesson-btn-2' }).props.onPress();
    });
    expect(allText(tree!.root)).toContain('Lekcja ukończona (stuknij, aby cofnąć)');
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-modal' });

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
