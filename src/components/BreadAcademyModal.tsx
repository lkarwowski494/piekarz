import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../ui/theme';
import {
  getBreadSchoolLessons,
  calculateBakerRank,
} from '../core/bread-school';
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
  const rankInfo = useMemo(() => calculateBakerRank(completedLevels), [completedLevels]);

  const handleToggleLesson = async (level: number) => {
    await toggleLessonProgress(level);
    await loadProgress();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header with Title, Close, Rank, Tab Nav */}
        <AcademyHeader
          onClose={onClose}
          rankInfo={rankInfo}
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 36,
  },
});
