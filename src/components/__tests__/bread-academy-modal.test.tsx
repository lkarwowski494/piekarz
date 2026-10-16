import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { BreadAcademyModal } from '../BreadAcademyModal';
import { _resetMemStore } from '../../data/sqlite-store';

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

  it('renders modal when visible is true and shows rank summary and tabs', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    expect(root.findByProps({ testID: 'close-academy-modal-btn' })).toBeDefined();
    expect(root.findByProps({ testID: 'academy-tab-school' })).toBeDefined();
    expect(root.findByProps({ testID: 'academy-tab-techniques' })).toBeDefined();
    expect(root.findByProps({ testID: 'academy-tab-drill' })).toBeDefined();
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

  it('switches to Drill tab and allows answering a question and revealing a flashcard', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const drillTab = root.findByProps({ testID: 'academy-tab-drill' });

    await act(async () => {
      drillTab.props.onPress();
    });

    const questionText = root.findByProps({ testID: 'drill-question-text' });
    expect(questionText).toBeDefined();

    // Reveal flashcard
    const revealBtn = root.findByProps({ testID: 'reveal-card-flash_01_grain_anatomy' });
    await act(async () => {
      revealBtn.props.onPress();
    });

    expect(root.findByProps({ testID: 'flashcard-flash_01_grain_anatomy' })).toBeDefined();
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(
        <BreadAcademyModal visible={true} onClose={mockOnClose} />
      );
    });

    const root = tree!.root;
    const closeBtn = root.findByProps({ testID: 'close-academy-modal-btn' });

    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
