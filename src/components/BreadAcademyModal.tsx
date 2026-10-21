import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import { getBreadSchoolLessons } from '../core/bread-school';
import { guardSave } from '../lib/save-guard';
import {
  filterTechniques,
  TechniqueCategory,
} from '../core/baking-techniques';
import {
  getCompletedLessons,
  toggleLessonProgress,
} from '../data/sqlite-store';
import { AcademyHeader, AcademyTab } from './academy/AcademyHeader';
import { BreadSchoolSection } from './academy/BreadSchoolSection';
import { TechniquesLibrarySection } from './academy/TechniquesLibrarySection';

interface BreadAcademyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function BreadAcademyModal({ visible, onClose }: BreadAcademyModalProps) {
  const [activeTab, setActiveTab] = useState<AcademyTab>('school');

  // School state
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  // Techniques state
  const [techCategory, setTechCategory] = useState<TechniqueCategory | 'all'>('all');

  const loadProgress = useCallback(async () => {
    const list = await getCompletedLessons();
    setCompletedLevels(list);
  }, []);

  useEffect(() => {
    if (visible) {
      loadProgress();
    }
  }, [visible, loadProgress]);

  const lessons = useMemo(() => getBreadSchoolLessons(), []);
  const techniques = useMemo(() => filterTechniques(techCategory), [techCategory]);

  // Nieudany zapis postępu: „Nie zapisano”, nie cichy sukces [M1-audytor-generalny-120]
  const handleToggleLesson = guardSave(async (level: number) => {
    await toggleLessonProgress(level);
    await loadProgress();
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Nagłówek: tytuł, zamknięcie, zakładki; bez rang (BR-NAUK-001) [M1-audytor-generalny-032] */}
        <AcademyHeader
          onClose={onClose}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: SZKOŁA CHLEBA (SCI) */}
          {activeTab === 'school' && (
            <BreadSchoolSection
              lessons={lessons}
              completedLevels={completedLevels}
              onToggleLesson={handleToggleLesson}
            />
          )}

          {/* TAB 2: BIBLIOTEKA TECHNIK (BIB) */}
          {activeTab === 'techniques' && (
            <TechniquesLibrarySection
              techniques={techniques}
              techCategory={techCategory}
              onCategoryChange={setTechCategory}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 36,
  },
});
