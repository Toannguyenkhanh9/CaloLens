// FILE: src/screens/MealScannerScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Linking,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImageLibraryOptions,
} from 'react-native-image-picker';
import {
  CommonActions,
  useNavigation,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import i18n from '../i18n';
import '../i18n/mealScanAccessTranslations';
import '../i18n/caloLensFoodToolsTranslations';
import '../i18n/mealScanAiErrorTranslations';
import '../i18n/mealScannerPremiumTranslations';

import {
  analyzeMealPhoto,
  MealAiNotConfiguredError,
} from '../nutrition/mealAi';
import {
  showRewarded,
} from '../ads/rewarded';
import {
  useSubscription,
} from '../iap/SubscriptionProvider';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const GREEN = '#FF5A1F';
const NEON = GREEN;
const CYAN = '#F47B35';

type ParsedMealAiError = {
  code: string;
  message: string;
  retryable: boolean;
};

const getRawErrorMessage = (
  error: unknown,
) => {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error
  ) {
    return String(
      (
        error as {
          message?: unknown;
        }
      ).message ||
        '',
    );
  }

  return String(
    error ||
      '',
  );
};

const parseJsonErrorBody = (
  rawMessage: string,
): Record<string, unknown> | null => {
  const trimmed =
    rawMessage.trim();

  if (!trimmed) {
    return null;
  }

  const candidates = [
    trimmed,
  ];

  const firstBrace =
    trimmed.indexOf('{');

  const lastBrace =
    trimmed.lastIndexOf('}');

  if (
    firstBrace >= 0 &&
    lastBrace >
      firstBrace
  ) {
    candidates.push(
      trimmed.slice(
        firstBrace,
        lastBrace + 1,
      ),
    );
  }

  for (
    const candidate of candidates
  ) {
    try {
      const parsed =
        JSON.parse(
          candidate,
        );

      if (
        parsed &&
        typeof parsed ===
          'object' &&
        !Array.isArray(
          parsed,
        )
      ) {
        return parsed as Record<
          string,
          unknown
        >;
      }
    } catch {
      // Continue.
    }
  }

  return null;
};

const parseMealAiError = (
  error: unknown,
): ParsedMealAiError => {
  const rawMessage =
    getRawErrorMessage(
      error,
    );

  const responseData =
    (
      error &&
      typeof error ===
        'object' &&
      'response' in error
    )
      ? (
          error as {
            response?: {
              data?: unknown;
            };
          }
        ).response?.data
      : undefined;

  const body =
    (
      responseData &&
      typeof responseData ===
        'object' &&
      !Array.isArray(
        responseData,
      )
    )
      ? (responseData as Record<
          string,
          unknown
        >)
      : parseJsonErrorBody(
          rawMessage,
        );

  const code =
    String(
      body?.error ||
        '',
    ).trim();

  const bodyMessage =
    String(
      body?.message ||
        body?.details ||
        '',
    ).trim();

  const message =
    bodyMessage ||
    rawMessage;

  const normalized =
    `${code} ${message}`.toLowerCase();

  const retryable =
    body?.retryable ===
      true ||
    code ===
      'AI_SERVICE_BUSY' ||
    normalized.includes(
      'high demand',
    ) ||
    normalized.includes(
      'temporarily busy',
    ) ||
    normalized.includes(
      'temporarily unavailable',
    ) ||
    normalized.includes(
      'resource_exhausted',
    ) ||
    normalized.includes(
      'too many requests',
    ) ||
    normalized.includes(
      'overloaded',
    ) ||
    normalized.includes(
      '429',
    ) ||
    normalized.includes(
      '503',
    );

  return {
    code,
    message,
    retryable,
  };
};

const isSafeDisplayMessage = (
  message: string,
) => {
  const trimmed =
    message.trim();

  return (
    Boolean(trimmed) &&
    !trimmed.startsWith('{') &&
    !trimmed.startsWith('[') &&
    !trimmed.includes(
      '"error"',
    ) &&
    trimmed.length <=
      240
  );
};

export const MealScannerScreen:
React.FC = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<any>();

  const {
    isPremium,
  } = useSubscription();

  const [
    imageUri,
    setImageUri,
  ] = useState<string | null>(
    null,
  );

  const [
    analyzing,
    setAnalyzing,
  ] = useState(false);

  const [
    scanStageIndex,
    setScanStageIndex,
  ] = useState(0);

  const scanLineAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const scanPulseAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const scannerOrbitAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const scanStages =
    useMemo(
      () => [
        t(
          'mealScan.scanStageDetecting',
          'Detecting foods',
        ),
        t(
          'mealScan.scanStageEstimating',
          'Estimating portions',
        ),
        t(
          'mealScan.scanStageCalculating',
          'Calories & nutrition',
        ),
      ],
      [t],
    );

  useEffect(() => {
    if (
      !analyzing ||
      !imageUri
    ) {
      scanLineAnim.stopAnimation();
      scanPulseAnim.stopAnimation();
      scannerOrbitAnim.stopAnimation();
      scanLineAnim.setValue(0);
      scanPulseAnim.setValue(0);
      scannerOrbitAnim.setValue(0);
      setScanStageIndex(0);
      return;
    }

    const lineLoop =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            scanLineAnim,
            {
              toValue: 1,
              duration: 1700,
              easing: Easing.inOut(
                Easing.ease,
              ),
              useNativeDriver: true,
            },
          ),
          Animated.timing(
            scanLineAnim,
            {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            },
          ),
        ]),
      );

    const pulseLoop =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            scanPulseAnim,
            {
              toValue: 1,
              duration: 900,
              easing: Easing.inOut(
                Easing.ease,
              ),
              useNativeDriver: true,
            },
          ),
          Animated.timing(
            scanPulseAnim,
            {
              toValue: 0,
              duration: 900,
              easing: Easing.inOut(
                Easing.ease,
              ),
              useNativeDriver: true,
            },
          ),
        ]),
      );

    const orbitLoop =
      Animated.loop(
        Animated.timing(
          scannerOrbitAnim,
          {
            toValue: 1,
            duration: 4200,
            easing: Easing.linear,
            useNativeDriver: true,
          },
        ),
      );

    lineLoop.start();
    pulseLoop.start();
    orbitLoop.start();

    const intervalId =
      setInterval(
        () => {
          setScanStageIndex(
            prev =>
              (prev + 1) %
              scanStages.length,
          );
        },
        1400,
      );

    return () => {
      clearInterval(
        intervalId,
      );
      lineLoop.stop();
      pulseLoop.stop();
      orbitLoop.stop();
      scanLineAnim.stopAnimation();
      scanPulseAnim.stopAnimation();
      scannerOrbitAnim.stopAnimation();
    };
  }, [
    analyzing,
    imageUri,
    scanLineAnim,
    scanPulseAnim,
    scannerOrbitAnim,
    scanStages.length,
  ]);

  const openPremiumScreen =
    useCallback(() => {
      const parent =
        navigation.getParent?.();

      const parentRouteNames =
        parent
          ?.getState?.()
          ?.routeNames || [];

      if (
        parentRouteNames.includes(
          'Settings',
        )
      ) {
        parent.navigate(
          'Settings',
          {
            screen: 'Premium',
          },
        );
        return;
      }

      navigation.dispatch(
        CommonActions.navigate({
          name: 'Settings',
          params: {
            screen: 'Premium',
          },
        }),
      );
    }, [navigation]);

  const requestCameraPermission =
    async () => {
      if (
        Platform.OS !== 'android'
      ) {
        return true;
      }

      const permission =
        PermissionsAndroid
          .PERMISSIONS.CAMERA;

      const alreadyGranted =
        await PermissionsAndroid
          .check(permission);

      if (alreadyGranted) {
        return true;
      }

      const result =
        await PermissionsAndroid
          .request(
            permission,
            {
              title: t(
                'mealScan.cameraPermissionTitle',
                'Camera permission',
              ),
              message: t(
                'mealScan.cameraPermissionBody',
                'CaloLens needs camera access to scan your meal.',
              ),
              buttonPositive: t(
                'common.allow',
                'Allow',
              ),
              buttonNegative: t(
                'common.cancel',
                'Cancel',
              ),
            },
          );

      if (
        result ===
        PermissionsAndroid
          .RESULTS.GRANTED
      ) {
        return true;
      }

      if (
        result ===
        PermissionsAndroid
          .RESULTS
          .NEVER_ASK_AGAIN
      ) {
        Alert.alert(
          t(
            'mealScan.permissionBlockedTitle',
            'Camera permission blocked',
          ),
          t(
            'mealScan.permissionBlockedBody',
            'Open Settings and allow Camera access for CaloLens.',
          ),
          [
            {
              text: t(
                'common.cancel',
                'Cancel',
              ),
              style: 'cancel',
            },
            {
              text: t(
                'common.openSettings',
                'Open settings',
              ),
              onPress: () =>
                Linking.openSettings(),
            },
          ],
        );
      }

      return false;
    };

  const takePhoto =
    async () => {
      const granted =
        await requestCameraPermission();

      if (!granted) {
        return;
      }

      const options:
      CameraOptions = {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
        saveToPhotos: false,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      const result =
        await launchCamera(
          options,
        );

      if (
        result.errorCode
      ) {
        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          result.errorMessage ||
            t(
              'mealScan.photoError',
              'Unable to open the camera.',
            ),
        );
        return;
      }

      const uri =
        result.assets?.[0]
          ?.uri;

      if (uri) {
        setImageUri(uri);
      }
    };

  const choosePhoto =
    async () => {
      const options:
      ImageLibraryOptions = {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      const result =
        await launchImageLibrary(
          options,
        );

      if (
        result.errorCode
      ) {
        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          result.errorMessage ||
            t(
              'mealScan.photoError',
              'Unable to open the photo library.',
            ),
        );
        return;
      }

      const uri =
        result.assets?.[0]
          ?.uri;

      if (uri) {
        setImageUri(uri);
      }
    };

  const scanLineTranslateY =
    scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 295],
    });

  const scanPulseScale =
    scanPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.985, 1.02],
    });

  const scanPulseOpacity =
    scanPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.35],
    });

  const scannerOrbitRotate =
    scannerOrbitAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

  const scannerGlowOpacity =
    scanPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.28, 0.72],
    });

  const scannerFocusScale =
    scanPulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.92, 1.08],
    });

  const scanProgressWidth =
    `${Math.min(96, 32 + scanStageIndex * 32)}%` as const;

  const analyze =
    async () => {
      if (
        !imageUri ||
        analyzing
      ) {
        return;
      }

      try {
        setAnalyzing(true);

        if (!isPremium) {
          const rewardResult =
            await showRewarded();

          if (
            rewardResult ===
            'closed'
          ) {
            Alert.alert(
              t(
                'mealScan.rewardRequiredTitle',
                'Watch the full ad',
              ),
              t(
                'mealScan.rewardRequiredBody',
                'Watch the rewarded ad to send this photo for AI analysis.',
              ),
            );
            return;
          }

          if (
            rewardResult !==
            'earned'
          ) {
            Alert.alert(
              t(
                'mealScan.adNotReadyTitle',
                'Ad not ready',
              ),
              t(
                'mealScan.adNotReadyBody',
                'The rewarded ad is loading. Please try again in a few seconds.',
              ),
            );
            return;
          }
        }

        const foods =
          await analyzeMealPhoto({
            uri: imageUri,
            locale:
              i18n.resolvedLanguage ||
              i18n.language ||
              'en',
          });

        navigation.navigate(
          'MealReview',
          {
            imageUri,
            foods,
            source: 'ai',
          },
        );
      } catch (error: any) {
        if (
          error instanceof
          MealAiNotConfiguredError
        ) {
          Alert.alert(
            t(
              'mealScan.endpointTitle',
              'AI backend is not configured',
            ),
            t(
              'mealScan.endpointBody',
              'Set MEAL_AI_ENDPOINT in src/config/mealAiConfig.ts. API keys must stay on your backend.',
            ),
          );
          return;
        }

        const parsedError =
          parseMealAiError(
            error,
          );

        console.log(
          '[meal scan] analysis failed',
          {
            code:
              parsedError.code,
            retryable:
              parsedError.retryable,
            message:
              parsedError.message,
          },
        );

        if (
          parsedError.retryable
        ) {
          Alert.alert(
            t(
              'mealScan.analysisFailedTitle',
              'Unable to analyze meal',
            ),
            t(
              'mealScan.aiBusyBody',
              'The AI service is temporarily busy. Please wait a moment and try again.',
            ),
          );

          return;
        }

        Alert.alert(
          t(
            'mealScan.analysisFailedTitle',
            'Unable to analyze meal',
          ),
          isSafeDisplayMessage(
            parsedError.message,
          )
            ? parsedError.message
            : t(
                'mealScan.analysisFailedBody',
                'Unable to analyze this meal. Please check your connection and try again.',
              ),
        );
      } finally {
        setAnalyzing(false);
      }
    };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.kickerPill}>
          <Text style={styles.kicker}>
            {t(
              'mealScan.aiKicker',
              'AI MEAL SCANNER',
            )}
          </Text>
        </View>

        <Text style={styles.title}>
          {t(
            'mealScan.scannerTitle',
            'Scan your meal',
          )}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            'mealScan.scannerSubtitle',
            'Take one clear photo of the full meal. You can confirm each food and portion before saving.',
          )}
        </Text>

        <View
          style={[
            styles.quotaCard,
            isPremium &&
              styles.quotaCardPremium,
          ]}
        >
          <View style={styles.quotaHeader}>
            <Text style={styles.quotaIcon}>
              {isPremium ? '★' : '⚡'}
            </Text>

            <View style={styles.quotaBody}>
              <Text style={styles.quotaTitle}>
                {isPremium
                  ? t(
                      'mealScan.premiumQuotaTitle',
                      'Premium AI scans',
                    )
                  : t(
                      'mealScan.freeQuotaTitle',
                      'Free AI scans',
                    )}
              </Text>

              <Text style={styles.quotaNotice}>
                {isPremium
                  ? t(
                      'mealScan.premiumNoAdsNotice',
                      'Unlimited AI scans with no rewarded ads.',
                    )
                  : t(
                      'mealScan.rewardedNotice',
                      'Unlimited AI scans. Watch a rewarded ad before each AI analysis.',
                    )}
              </Text>

              {!isPremium ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={openPremiumScreen}
                  style={styles.premiumCta}
                >
                  <Text style={styles.premiumCtaText}>
                    {t(
                      'mealScan.upgradePremium',
                      'Upgrade Premium',
                    )}
                    {'  ·  '}
                    {t(
                      'premium.removeAds',
                      'Remove ads',
                    )}
                    {'  ›'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.previewCard}>
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image
                source={{
                  uri: imageUri,
                }}
                style={styles.preview}
              />

              {analyzing ? (
                <View
                  pointerEvents="none"
                  style={styles.liveScanOverlay}
                >
                  <View style={styles.previewShadeStrong} />

                  <Animated.View
                    style={[
                      styles.scanPulseLayer,
                      {
                        opacity:
                          scanPulseOpacity,
                        transform: [
                          {
                            scale:
                              scanPulseScale,
                          },
                        ],
                      },
                    ]}
                  />

                  <View style={styles.aiHudTop}>
                    <View style={styles.aiVisionBadge}>
                      <View style={styles.aiVisionDot} />
                      <Text style={styles.aiVisionBadgeText}>
                        {t(
                          'mealScan.aiVisionBadge',
                          'CALOLENS AI VISION',
                        )}
                      </Text>
                    </View>

                    <Animated.View
                      style={[
                        styles.aiOrbitBadge,
                        {
                          transform: [
                            {
                              rotate:
                                scannerOrbitRotate,
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.aiOrbitSpark}>✦</Text>
                    </Animated.View>
                  </View>

                  <View style={styles.scanFrame}>
                    <View style={styles.scanGrid}>
                      <View style={[styles.scanGridV, {left: '25%'}]} />
                      <View style={[styles.scanGridV, {left: '50%'}]} />
                      <View style={[styles.scanGridV, {left: '75%'}]} />
                      <View style={[styles.scanGridH, {top: '25%'}]} />
                      <View style={[styles.scanGridH, {top: '50%'}]} />
                      <View style={[styles.scanGridH, {top: '75%'}]} />
                    </View>

                    <View
                      style={[
                        styles.corner,
                        styles.cornerTL,
                        styles.cornerPremium,
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerTR,
                        styles.cornerPremium,
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerBL,
                        styles.cornerPremium,
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerBR,
                        styles.cornerPremium,
                      ]}
                    />

                    <Animated.View
                      style={[
                        styles.scanFocusRing,
                        {
                          opacity:
                            scannerGlowOpacity,
                          transform: [
                            {
                              scale:
                                scannerFocusScale,
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={styles.scanFocusInner}>
                        <View style={styles.scanFocusDot} />
                      </View>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.sparkleOne,
                        {
                          opacity:
                            scannerGlowOpacity,
                          transform: [
                            {
                              scale:
                                scannerFocusScale,
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.sparkleText}>✦</Text>
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.sparkleTwo,
                        {
                          opacity:
                            scanPulseOpacity,
                          transform: [
                            {
                              scale:
                                scanPulseScale,
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.sparkleTextSmall}>✦</Text>
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.scanLineWrap,
                        {
                          transform: [
                            {
                              translateY:
                                scanLineTranslateY,
                            },
                          ],
                        },
                      ]}
                    >
                      <View style={styles.scanLineAura} />
                      <View style={styles.scanLineGlow} />
                      <View style={styles.scanLineCore} />
                      <View style={styles.scanLineHotspot} />
                    </Animated.View>
                  </View>

                  <View style={styles.scanStatusCard}>
                    <View style={styles.scanStatusTopRow}>
                      <View style={styles.scanStatusHeader}>
                        <ActivityIndicator
                          size="small"
                          color="#FF8458"
                        />
                        <View style={styles.scanStatusTextWrap}>
                          <Text style={styles.scanStatusTitle}>
                            {t(
                              'mealScan.liveScanTitle',
                              'AI is analyzing your meal',
                            )}
                          </Text>
                          <Text style={styles.scanStatusEyebrow}>
                            {t(
                              'mealScan.liveScanSubtitle',
                              'Real-time food recognition',
                            )}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveBadgeText}>
                          {t(
                            'mealScan.liveBadge',
                            'LIVE',
                          )}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.aiProgressTrack}>
                      <View
                        style={[
                          styles.aiProgressFill,
                          {width: scanProgressWidth},
                        ]}
                      />
                    </View>

                    <View style={styles.scanStepRow}>
                      {scanStages.map((stage, index) => {
                        const isActive =
                          index === scanStageIndex;
                        const isDone =
                          index < scanStageIndex;

                        return (
                          <View
                            key={stage}
                            style={styles.scanStepItem}
                          >
                            <View
                              style={[
                                styles.scanStepCircle,
                                (isActive || isDone) &&
                                  styles.scanStepCircleActive,
                                isDone &&
                                  styles.scanStepCircleDone,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.scanStepNumber,
                                  (isActive || isDone) &&
                                    styles.scanStepNumberActive,
                                ]}
                              >
                                {isDone ? '✓' : index + 1}
                              </Text>
                            </View>
                            <Text
                              numberOfLines={2}
                              style={[
                                styles.scanStepLabel,
                                isActive &&
                                  styles.scanStepLabelActive,
                              ]}
                            >
                              {stage}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.currentScanStage}>
                      <Text style={styles.currentScanStageIcon}>✦</Text>
                      <Text style={styles.currentScanStageText}>
                        {scanStages[scanStageIndex]}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <ImageBackground
              source={require('../assets/calo_scan_sample.jpg')}
              style={styles.emptyPreview}
              imageStyle={styles.emptyPreviewImage}
              resizeMode="cover"
            >
              <View style={styles.previewShade} />
              <View style={styles.emptyScanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>

              <View style={styles.guideBubble}>
                <Text style={styles.guideBubbleIcon}>📷</Text>
                <View style={styles.guideBubbleBody}>
                  <Text style={styles.emptyTitle}>
                    {t(
                      'mealScan.photoGuideTitle',
                      'Place the full meal inside the frame',
                    )}
                  </Text>
                  <Text style={styles.emptyText}>
                    {t(
                      'mealScan.photoGuideBody',
                      'Good lighting and a top or 45° angle help the AI recognize portions.',
                    )}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.primaryButton}
            onPress={takePhoto}
            disabled={analyzing}
          >
            <Text style={styles.primaryText}>
              📷{' '}
              {t(
                'mealScan.takePhoto',
                'Take photo',
              )}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.secondaryButton}
            onPress={choosePhoto}
            disabled={analyzing}
          >
            <Text style={styles.secondaryText}>
              🖼️{' '}
              {t(
                'mealScan.choosePhoto',
                'Choose photo',
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {imageUri ? (
          <TouchableOpacity
            activeOpacity={0.86}
            style={[
              styles.analyzeButton,
              analyzing &&
                styles.disabled,
            ]}
            onPress={analyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.analyzeText}>
                  {t(
                    'mealScan.analyzing',
                    'Analyzing meal…',
                  )}
                </Text>
              </>
            ) : (
              <Text style={styles.analyzeText}>
                ✦{' '}
                {t(
                  'mealScan.analyze',
                  'Analyze with AI',
                )}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={styles.otherMethodsCard}>
          <View style={styles.otherMethodsHeader}>
            <View style={styles.otherMethodsTitleWrap}>
              <Text style={styles.otherMethodsKicker}>
                {t(
                  'foodTools.otherWaysKicker',
                  'OTHER WAYS',
                )}
              </Text>

              <Text style={styles.otherMethodsTitle}>
                {t(
                  'foodTools.otherWaysTitle',
                  'Add food another way',
                )}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() =>
                navigation.navigate(
                  'QuickAdd',
                )
              }
            >
              <Text style={styles.viewAllText}>
                {t(
                  'foodTools.viewAllMethods',
                  'View all',
                )}{'  ›'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.otherMethodsGrid}>
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.methodButton}
              onPress={() =>
                navigation.navigate(
                  'FoodSearch',
                )
              }
            >
              <View
                style={[
                  styles.methodIcon,
                  styles.methodIconSearch,
                ]}
              >
                <Text style={styles.methodIconText}>
                  ⌕
                </Text>
              </View>

              <Text style={styles.methodTitle}>
                {t(
                  'foodTools.searchFood',
                  'Search food',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.methodButton}
              onPress={() =>
                navigation.navigate(
                  'BarcodeScanner',
                )
              }
            >
              <View
                style={[
                  styles.methodIcon,
                  styles.methodIconBarcode,
                ]}
              >
                <Text style={styles.methodIconText}>
                  ▦
                </Text>
              </View>

              <Text style={styles.methodTitle}>
                {t(
                  'foodTools.scanBarcode',
                  'Scan barcode',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.methodButton}
              onPress={() =>
                navigation.navigate(
                  'MealReview',
                  {
                    foods: [],
                    source: 'manual',
                  },
                )
              }
            >
              <View
                style={[
                  styles.methodIcon,
                  styles.methodIconManual,
                ]}
              >
                <Text style={styles.methodIconText}>
                  ✎
                </Text>
              </View>

              <Text style={styles.methodTitle}>
                {t(
                  'foodTools.manualShort',
                  'Manual',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ImageBackground
          source={require('../assets/calo_guidance_food.jpg')}
          style={styles.footerVisual}
          imageStyle={styles.footerVisualImage}
        >
          <View style={styles.footerVisualTint} />
          <View style={styles.footerVisualContent}>
            <Text style={styles.footerVisualKicker}>
              {t(
                'mealScan.footerKicker',
                'SMART SCANNING',
              )}
            </Text>
            <Text style={styles.footerVisualTitle}>
              {t(
                'mealScan.footerTitle',
                'Better photos lead to better calorie estimates',
              )}
            </Text>
            <Text style={styles.footerVisualText}>
              {t(
                'mealScan.footerBody',
                'Keep the full meal visible, use good lighting and let CaloLens help you log food faster.',
              )}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {t(
              'mealScan.estimateDisclaimer',
              'Calories and nutrients are estimates. Results vary by ingredients, cooking method and actual portion size.',
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BG,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 135,
    },
    kickerPill: {
      alignSelf: 'flex-start',
      backgroundColor:
        'rgba(244, 123, 53, 0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.36)',
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    kicker: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: TEXT,
      fontSize: 31,
      fontWeight: '900',
      marginTop: 14,
    },
    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
    },
    quotaCard: {
      backgroundColor:
        '#FFF9E8',
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.30)',
      borderRadius: 18,
      padding: 13,
      marginTop: 14,
    },
    quotaCardPremium: {
      backgroundColor:
        'rgba(255, 90, 31, 0.09)',
      borderColor:
        'rgba(255, 90, 31, 0.32)',
    },
    quotaHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    quotaIcon: {
      color: NEON,
      fontSize: 20,
      fontWeight: '900',
      marginRight: 10,
    },
    quotaBody: {
      flex: 1,
    },
    quotaTitle: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    quotaNotice: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    premiumCta: {
      alignSelf: 'flex-start',
      marginTop: 9,
      paddingVertical: 4,
    },
    premiumCtaText: {
      color: NEON,
      fontSize: 11,
      fontWeight: '900',
    },
    previewCard: {
      height: 360,
      borderRadius: 24,
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor:
        '#F0D8C7',
      overflow: 'hidden',
      marginTop: 18,
    },
    previewWrap: {
      flex: 1,
    },
    preview: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    // Original pre-scan preview: keep the old CaloLens framing and guide bubble.
    emptyPreview: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: '#3D2418',
    },
    emptyPreviewImage: {
      borderRadius: 24,
    },
    previewShade: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(35, 17, 8, 0.12)',
    },
    emptyScanFrame: {
      flex: 1,
      margin: 10,
      borderRadius: 28,
      position: 'relative',
    },

    // Premium scanner frame is only shown while AI analysis is running.
    scanFrame: {
      position: 'absolute',
      top: 50,
      left: 14,
      right: 14,
      bottom: 16,
    },
    corner: {
      position: 'absolute',
      width: 46,
      height: 46,
      borderColor: '#FFFFFF',
    },
    cornerTL: {
      top: 0,
      left: 0,
      borderTopWidth: 5,
      borderLeftWidth: 5,
      borderTopLeftRadius: 14,
    },
    cornerTR: {
      top: 0,
      right: 0,
      borderTopWidth: 5,
      borderRightWidth: 5,
      borderTopRightRadius: 14,
    },
    cornerBL: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 5,
      borderLeftWidth: 5,
      borderBottomLeftRadius: 14,
    },
    cornerBR: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 5,
      borderRightWidth: 5,
      borderBottomRightRadius: 14,
    },
    liveScanOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
      padding: 14,
    },
    previewShadeStrong: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(25, 16, 11, 0.28)',
    },
    scanPulseLayer: {
      position: 'absolute',
      top: 18,
      left: 18,
      right: 18,
      bottom: 18,
      borderRadius: 30,
      borderWidth: 1,
      borderColor:
        'rgba(255,132,88,0.42)',
      backgroundColor:
        'rgba(255,90,31,0.035)',
      shadowColor: '#FF6A33',
      shadowOpacity: 0.34,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 0,
      },
    },
    aiHudTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 5,
    },
    aiVisionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(24, 17, 12, 0.76)',
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    aiVisionDot: {
      width: 7,
      height: 7,
      borderRadius: 99,
      backgroundColor: '#65D36E',
      marginRight: 7,
      shadowColor: '#65D36E',
      shadowOpacity: 0.9,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: 0},
      elevation: 5,
    },
    aiVisionBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.15,
    },
    aiOrbitBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        'rgba(255,132,88,0.52)',
      backgroundColor:
        'rgba(30,19,12,0.70)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiOrbitSpark: {
      color: '#FF8458',
      fontSize: 17,
      fontWeight: '900',
    },
    scanGrid: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.24,
    },
    scanGridV: {
      position: 'absolute',
      top: 6,
      bottom: 6,
      width: 1,
      backgroundColor:
        'rgba(255,255,255,0.22)',
    },
    scanGridH: {
      position: 'absolute',
      left: 6,
      right: 6,
      height: 1,
      backgroundColor:
        'rgba(255,255,255,0.22)',
    },
    cornerPremium: {
      borderColor: '#FF8458',
      shadowColor: '#FF6A33',
      shadowOpacity: 0.7,
      shadowRadius: 7,
      shadowOffset: {width: 0, height: 0},
      elevation: 5,
    },
    scanFocusRing: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 74,
      height: 74,
      marginLeft: -37,
      marginTop: -37,
      borderRadius: 37,
      borderWidth: 1,
      borderColor:
        'rgba(255,132,88,0.82)',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,90,31,0.05)',
    },
    scanFocusInner: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.75)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanFocusDot: {
      width: 7,
      height: 7,
      borderRadius: 99,
      backgroundColor: '#65D36E',
      shadowColor: '#65D36E',
      shadowOpacity: 0.9,
      shadowRadius: 6,
      shadowOffset: {width: 0, height: 0},
    },
    sparkleOne: {
      position: 'absolute',
      top: '28%',
      right: '18%',
    },
    sparkleTwo: {
      position: 'absolute',
      bottom: '30%',
      left: '16%',
    },
    sparkleText: {
      color: '#FFD2B8',
      fontSize: 17,
      fontWeight: '900',
      textShadowColor:
        'rgba(255,90,31,0.85)',
      textShadowRadius: 8,
    },
    sparkleTextSmall: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
      textShadowColor:
        'rgba(255,255,255,0.75)',
      textShadowRadius: 6,
    },
    scanLineWrap: {
      position: 'absolute',
      left: 8,
      right: 8,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanLineAura: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 34,
      borderRadius: 999,
      backgroundColor:
        'rgba(255, 90, 31, 0.08)',
    },
    scanLineGlow: {
      position: 'absolute',
      left: 6,
      right: 6,
      height: 18,
      borderRadius: 999,
      backgroundColor:
        'rgba(255, 132, 88, 0.22)',
    },
    scanLineCore: {
      width: '100%',
      height: 3,
      borderRadius: 999,
      backgroundColor: '#FF8458',
      shadowColor: '#FF6A33',
      shadowOpacity: 0.95,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 8,
    },
    scanLineHotspot: {
      position: 'absolute',
      width: 58,
      height: 5,
      borderRadius: 999,
      backgroundColor: '#FFFFFF',
      shadowColor: '#FFFFFF',
      shadowOpacity: 0.9,
      shadowRadius: 7,
      shadowOffset: {width: 0, height: 0},
    },
    scanStatusCard: {
      backgroundColor:
        'rgba(26, 17, 12, 0.88)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginTop: 'auto',
      shadowColor: '#000000',
      shadowOpacity: 0.24,
      shadowRadius: 14,
      shadowOffset: {width: 0, height: 7},
      elevation: 9,
    },
    scanStatusTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    scanStatusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: 8,
    },
    scanStatusTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    scanStatusTitle: {
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 16,
      fontWeight: '900',
      marginLeft: 9,
    },
    scanStatusEyebrow: {
      color:
        'rgba(255,255,255,0.58)',
      fontSize: 9,
      lineHeight: 12,
      fontWeight: '700',
      marginLeft: 9,
      marginTop: 2,
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 999,
      backgroundColor:
        'rgba(101,211,110,0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(101,211,110,0.28)',
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 99,
      backgroundColor: '#65D36E',
      marginRight: 5,
    },
    liveBadgeText: {
      color: '#BFF4C3',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    aiProgressTrack: {
      height: 5,
      borderRadius: 999,
      backgroundColor:
        'rgba(255,255,255,0.10)',
      overflow: 'hidden',
      marginTop: 11,
    },
    aiProgressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: '#FF6A33',
    },
    scanStepRow: {
      flexDirection: 'row',
      marginTop: 10,
      marginHorizontal: -4,
    },
    scanStepItem: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    scanStepCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.18)',
      backgroundColor:
        'rgba(255,255,255,0.07)',
    },
    scanStepCircleActive: {
      borderColor:
        'rgba(255,132,88,0.78)',
      backgroundColor:
        'rgba(255,90,31,0.20)',
    },
    scanStepCircleDone: {
      borderColor:
        'rgba(101,211,110,0.65)',
      backgroundColor:
        'rgba(101,211,110,0.16)',
    },
    scanStepNumber: {
      color:
        'rgba(255,255,255,0.52)',
      fontSize: 9,
      fontWeight: '900',
    },
    scanStepNumberActive: {
      color: '#FFFFFF',
    },
    scanStepLabel: {
      color:
        'rgba(255,255,255,0.54)',
      fontSize: 8,
      lineHeight: 10,
      minHeight: 20,
      fontWeight: '800',
      marginTop: 5,
      textAlign: 'center',
    },
    scanStepLabelActive: {
      color: '#FFFFFF',
    },
    currentScanStage: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        'rgba(255,255,255,0.07)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.08)',
      marginTop: 10,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },
    currentScanStageIcon: {
      color: '#FF8458',
      fontSize: 11,
      fontWeight: '900',
      marginRight: 6,
    },
    currentScanStageText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      textAlign: 'center',
    },
    guideBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.94)',
      borderRadius: 18,
      padding: 13,
      shadowColor: '#4A2411',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    },
    guideBubbleIcon: {
      fontSize: 27,
      marginRight: 10,
    },
    guideBubbleBody: {
      flex: 1,
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 0,
    },
    emptyText: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 7,
    },
    actionRow: {
      flexDirection: 'row',
      marginTop: 14,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 999,
      backgroundColor: '#FF5A1F',
      borderWidth: 1,
      borderColor: '#FF5A1F',
      paddingVertical: 13,
      alignItems: 'center',
      marginRight: 6,
    },
    primaryText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 999,
      backgroundColor:
        'rgba(244, 123, 53, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.28)',
      paddingVertical: 13,
      alignItems: 'center',
      marginLeft: 6,
    },
    secondaryText: {
      color: CYAN,
      fontSize: 13,
      fontWeight: '900',
    },
    analyzeButton: {
      minHeight: 50,
      borderRadius: 999,
      backgroundColor: '#FF5A1F',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 13,
    },
    analyzeText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
      marginLeft: 7,
    },
    disabled: {
      opacity: 0.6,
    },
    otherMethodsCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.18)',
      padding: 13,
      marginTop: 13,
      shadowColor: '#B89079',
      shadowOpacity: 0.06,
      shadowRadius: 9,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },
    otherMethodsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 11,
    },
    otherMethodsTitleWrap: {
      flex: 1,
      paddingRight: 8,
    },
    otherMethodsKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    otherMethodsTitle: {
      color: TEXT,
      fontSize: 16,
      fontWeight: '900',
      marginTop: 3,
    },
    viewAllText: {
      color: NEON,
      fontSize: 10,
      fontWeight: '900',
    },
    otherMethodsGrid: {
      flexDirection: 'row',
      marginHorizontal: -4,
    },
    methodButton: {
      flex: 1,
      minHeight: 82,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF8F2',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.16)',
      paddingHorizontal: 5,
      marginHorizontal: 4,
    },
    methodIcon: {
      width: 35,
      height: 35,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: 7,
    },
    methodIconSearch: {
      backgroundColor:
        'rgba(244, 123, 53, 0.09)',
      borderColor:
        'rgba(244, 123, 53, 0.25)',
    },
    methodIconBarcode: {
      backgroundColor:
        'rgba(255, 147, 80, 0.08)',
      borderColor:
        'rgba(255, 147, 80, 0.23)',
    },
    methodIconManual: {
      backgroundColor:
        'rgba(217, 154, 0, 0.08)',
      borderColor:
        'rgba(217, 154, 0, 0.23)',
    },
    methodIconText: {
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
    },
    methodTitle: {
      color: TEXT,
      fontSize: 9,
      fontWeight: '900',
      textAlign: 'center',
    },
    footerVisual: {
      minHeight: 176,
      borderRadius: 24,
      overflow: 'hidden',
      marginTop: 16,
      justifyContent: 'flex-end',
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.16)',
    },
    footerVisualImage: {
      resizeMode: 'cover',
    },
    footerVisualTint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(255, 248, 242, 0.28)',
    },
    footerVisualContent: {
      paddingHorizontal: 18,
      paddingVertical: 18,
      backgroundColor:
        'rgba(255, 255, 255, 0.74)',
      margin: 14,
      borderRadius: 18,
    },
    footerVisualKicker: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    footerVisualTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 6,
    },
    footerVisualText: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 8,
    },
    notice: {
      backgroundColor:
        '#FFF9E8',
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.25)',
      borderRadius: 15,
      padding: 12,
      marginTop: 15,
    },
    noticeText: {
      color: '#8B6500',
      fontSize: 11,
      lineHeight: 17,
    },
  });

export default MealScannerScreen;
