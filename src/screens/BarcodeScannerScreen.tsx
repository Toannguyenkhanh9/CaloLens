// FILE: src/screens/BarcodeScannerScreen.tsx
import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Camera} from 'react-native-camera-kit';

import {findFoodByBarcode} from '../nutrition/foodLibrary';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const BORDER = '#F1D9C8';

export const BarcodeScannerScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [permissionGranted, setPermissionGranted] = useState(Platform.OS === 'ios');
  const [manualCode, setManualCode] = useState('');
  const [handling, setHandling] = useState(false);
  const lastCodeRef = useRef('');

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setPermissionGranted(true);
      return;
    }
    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
    if (await PermissionsAndroid.check(permission)) {
      setPermissionGranted(true);
      return;
    }
    const result = await PermissionsAndroid.request(permission, {
      title: t('foodTools.cameraPermission', 'Camera permission'),
      message: t('foodTools.barcodeCameraPermissionBody', 'CaloLens needs camera access to scan product barcodes.'),
      buttonPositive: t('common.allow', 'Allow'),
      buttonNegative: t('common.cancel', 'Cancel'),
    });
    setPermissionGranted(result === PermissionsAndroid.RESULTS.GRANTED);
  }, [t]);

  useFocusEffect(useCallback(() => {
    requestPermission();
    return () => {
      lastCodeRef.current = '';
    };
  }, [requestPermission]));

  const handleCode = async (rawCode: string) => {
    const code = String(rawCode || '').trim().replace(/\s/g, '');
    if (!code || handling || lastCodeRef.current === code) return;
    lastCodeRef.current = code;
    try {
      setHandling(true);
      const food = await findFoodByBarcode(code);
      if (food) {
        navigation.replace('FoodPortion', {food});
        return;
      }
      Alert.alert(
        t('foodTools.productNotFoundTitle', 'Product not found'),
        t('foodTools.productNotFoundBody', 'Create this product once and CaloLens will recognize the barcode next time.'),
        [
          {
            text: t('common.cancel', 'Cancel'),
            style: 'cancel',
            onPress: () => {
              lastCodeRef.current = '';
            },
          },
          {
            text: t('foodTools.createProduct', 'Create product'),
            onPress: () => navigation.replace('CustomFood', {barcode: code}),
          },
        ],
      );
    } finally {
      setHandling(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#21170F" />
      <View style={styles.cameraWrap}>
        {permissionGranted ? (
          <Camera
            style={styles.camera}
            cameraType={'back' as any}
            scanBarcode
            showFrame
            laserColor={NEON}
            frameColor="#FFFFFF"
            onReadCode={(event: any) => handleCode(
              event?.nativeEvent?.codeStringValue ||
              event?.nativeEvent?.codeString ||
              '',
            )}
          />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionIcon}>▦</Text>
            <Text style={styles.permissionTitle}>{t('foodTools.cameraRequiredTitle', 'Camera access is required')}</Text>
            <Text style={styles.permissionText}>{t('foodTools.cameraRequiredBody', 'Allow camera access or enter the barcode below.')}</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>{t('common.allow', 'Allow camera')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View pointerEvents="none" style={styles.cameraHeader}>
          <Text style={styles.cameraKicker}>{t('foodTools.barcodeKicker', 'BARCODE SCANNER')}</Text>
          <Text style={styles.cameraTitle}>{t('foodTools.barcodeTitle', 'Center the barcode in the frame')}</Text>
        </View>
      </View>

      <View style={styles.manualCard}>
        <Text style={styles.manualTitle}>{t('foodTools.enterBarcode', 'Enter barcode manually')}</Text>
        <View style={styles.manualRow}>
          <TextInput
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="number-pad"
            placeholder="893..."
            placeholderTextColor="#8A948C"
            style={styles.manualInput}
          />
          <TouchableOpacity style={styles.lookupButton} onPress={() => handleCode(manualCode)}>
            <Text style={styles.lookupText}>{t('foodTools.lookup', 'Look up')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.manualHint}>{t('foodTools.barcodeHint', 'Products you create are stored locally and can be found by this barcode later.')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  cameraWrap: {flex: 1, minHeight: 390, backgroundColor: '#21170F', overflow: 'hidden'},
  camera: {flex: 1},
  cameraHeader: {position: 'absolute', top: 22, left: 18, right: 18},
  cameraKicker: {color: NEON, fontSize: 10, fontWeight: '900', letterSpacing: 1},
  cameraTitle: {color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 5, maxWidth: 290},
  permissionBox: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30},
  permissionIcon: {color: NEON, fontSize: 54},
  permissionTitle: {color: '#FFFFFF', fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 12},
  permissionText: {color: '#E9D8CC', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7},
  permissionButton: {minWidth: 160, minHeight: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: NEON, borderRadius: 999, marginTop: 15},
  permissionButtonText: {color: '#10230F', fontSize: 12, fontWeight: '900'},
  manualCard: {backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 13, paddingTop: 15, paddingBottom: 22, marginTop: -18},
  manualTitle: {color: TEXT, fontSize: 15, fontWeight: '900', marginBottom: 9},
  manualRow: {flexDirection: 'row'},
  manualInput: {flex: 1, minHeight: 48, backgroundColor: '#FFF8F2', borderRadius: 14, borderWidth: 1, borderColor: BORDER, color: TEXT, fontSize: 14, fontWeight: '800', paddingHorizontal: 12, marginRight: 7},
  lookupButton: {minWidth: 90, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: NEON, borderRadius: 14},
  lookupText: {color: '#10230F', fontSize: 11, fontWeight: '900'},
  manualHint: {color: MUTED, fontSize: 9, lineHeight: 14, marginTop: 8},
});

export default BarcodeScannerScreen;
