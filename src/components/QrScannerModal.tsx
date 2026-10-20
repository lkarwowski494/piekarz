// ============================================================================
// Piekarz (Crust) — Skaner Kodów QR Aparatem (Offline QR Scanner)
// DEC-20 / HIG: Odczyt kodów QR receptur offline za pomocą expo-camera
// Apps4Brew Studio — 100% Offline-First.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../ui/theme';
import { t } from '../lib/i18n';

export interface QrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanRecipe: (scannedData: string) => void;
}

export function QrScannerModal({
  visible,
  onClose,
  onScanRecipe,
}: QrScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanRecipe(data.trim());
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setScanned(false);
      onClose();
    }, 400);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container} testID="qr-scanner-modal">
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            testID="close-scanner-btn"
            accessibilityRole="button"
            accessibilityLabel={t('Anuluj')}
            onPress={onClose}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>{t('Anuluj')}</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('Skanuj Kod QR')}</Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {!permission?.granted ? (
          <View style={styles.permissionBox} testID="camera-permission-box">
            <Text style={styles.permissionTitle}>{t('Dostęp do Aparatu')}</Text>
            <Text style={styles.permissionDesc}>
              {t('Aparat jest potrzebny, aby natychmiast zeskanować kod QR receptury od innego piekarza w 100% offline.')}
            </Text>
            <Pressable
              testID="request-camera-permission-btn"
              style={styles.permissionBtn}
              onPress={requestPermission}
              accessibilityRole="button"
              accessibilityLabel={t('Zezwól na dostęp do aparatu')}
            >
              <Text style={styles.permissionBtnText}>{t('Zezwól na dostęp do aparatu')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cameraWrapper}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Viewfinder Overlay */}
            <View style={styles.overlay}>
              <View style={styles.viewfinder} testID="camera-viewfinder">
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.hintText}>
                {t('Skieruj obiektyw na kod QR receptury')}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#1A110A',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3A2718',
  },
  cancelBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#D4924B',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 17,
    fontWeight: '700',
    color: '#FBF8F3',
  },
  headerRightSpacer: {
    width: 48,
  },
  permissionBox: {
    flex: 1,
    backgroundColor: theme.colors.tlo,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontFamily: theme.typography.krojTytulow,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.tusz,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 15,
    color: theme.colors.tusz2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  permissionBtn: {
    backgroundColor: theme.colors.akcent,
    borderRadius: theme.radius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  permissionBtnText: {
    color: theme.colors.naAkcencie,
    fontSize: 16,
    fontWeight: '700',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  viewfinder: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#D4924B',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  hintText: {
    color: '#FBF8F3',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(26, 17, 10, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
