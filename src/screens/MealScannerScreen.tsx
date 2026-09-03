// FILE: src/screens/MealScannerScreen.tsx
import React, {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import i18n from '../i18n';
import '../i18n/mealScanAccessTranslations';
import '../i18n/caloLensFoodToolsTranslations';
import '../i18n/mealScanAiErrorTranslations';

import {
  analyzeMealPhoto,
  MealAiNotConfiguredError,
} from '../nutrition/mealAi';
import {
  consumeTodayMealScan,
  FREE_DAILY_AI_SCAN_LIMIT,
  loadTodayMealScanQuota,
  PREMIUM_DAILY_AI_SCAN_LIMIT,
} from '../nutrition/mealScanQuota';
import {
  showRewarded,
} from '../ads/rewarded';
import {
  useSubscription,
} from '../iap/SubscriptionProvider';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const GREEN = '#63C934';
const NEON = GREEN;
const CYAN = '#18A39B';


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
        return parsed as
          Record<
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
      ? responseData as
          Record<
            string,
            unknown
          >
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
    `${code} ${message}`
      .toLowerCase();

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
    remainingScans,
    setRemainingScans,
  ] = useState(
    isPremium
      ? PREMIUM_DAILY_AI_SCAN_LIMIT
      : FREE_DAILY_AI_SCAN_LIMIT,
  );

  const [
    quotaLoaded,
    setQuotaLoaded,
  ] = useState(false);

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

  const reloadQuota =
    useCallback(
      async () => {
        setQuotaLoaded(false);

        const quota =
          await loadTodayMealScanQuota(
            isPremium,
          );

        setRemainingScans(
          quota.remaining,
        );

        setQuotaLoaded(true);
      },
      [isPremium],
    );

  useFocusEffect(
    useCallback(() => {
      reloadQuota();
    }, [reloadQuota]),
  );

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

  const showFreeLimitPopup =
    useCallback(() => {
      Alert.alert(
        t(
          'mealScan.quotaReachedTitle',
          'Daily scan limit reached',
        ),
        t(
          'mealScan.quotaReachedBody',
          'Free users can analyze up to 3 meal photos per day. Try again tomorrow or upgrade to Premium.',
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
              'mealScan.upgradePremium',
              'Upgrade Premium',
            ),
            onPress:
              openPremiumScreen,
          },
        ],
      );
    }, [
      openPremiumScreen,
      t,
    ]);

  const showPremiumLimitPopup =
    useCallback(() => {
      Alert.alert(
        t(
          'mealScan.premiumQuotaReachedTitle',
          'Premium daily limit reached',
        ),
        t(
          'mealScan.premiumQuotaReachedBody',
          'Premium accounts can analyze up to 15 meal photos per day. Please try again tomorrow.',
        ),
      );
    }, [t]);

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

  const analyze =
    async () => {
      if (
        !imageUri ||
        analyzing ||
        !quotaLoaded
      ) {
        return;
      }

      /**
       * Free:
       * 1. Tối đa 3 lượt/ngày.
       * 2. Còn lượt mới hiện rewarded.
       * 3. Xem đủ rewarded mới trừ lượt và gửi ảnh.
       * 4. Hết lượt sẽ mở popup dẫn sang Premium.
       *
       * Premium:
       * 1. Không quảng cáo.
       * 2. Tối đa 15 lượt/ngày.
       */
      if (
        remainingScans <= 0
      ) {
        if (isPremium) {
          showPremiumLimitPopup();
        } else {
          showFreeLimitPopup();
        }

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

        /**
         * Chỉ trừ lượt sau khi AI phân tích thành công.
         * Nếu backend quá tải hoặc mất mạng, lượt quét
         * vẫn được giữ nguyên.
         */
        const foods =
          await analyzeMealPhoto({
            uri: imageUri,
            locale:
              i18n.resolvedLanguage ||
              i18n.language ||
              'en',
          });

        const consumed =
          await consumeTodayMealScan(
            isPremium,
          );

        setRemainingScans(
          consumed.quota.remaining,
        );

        if (!consumed.allowed) {
          if (isPremium) {
            showPremiumLimitPopup();
          } else {
            showFreeLimitPopup();
          }

          return;
        }

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
              'The AI service is temporarily busy. Please wait a moment and try again. Your scan has not been used.',
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
                'Unable to analyze this meal. Please check your connection and try again. Your scan has not been used.',
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
              {isPremium
                ? '★'
                : '⚡'}
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

              <Text style={styles.quotaValue}>
                {isPremium
                  ? t(
                      'mealScan.premiumQuotaRemaining',
                      {
                        count:
                          remainingScans,
                        defaultValue:
                          '{{count}} of 15 scans remaining today',
                      },
                    )
                  : t(
                      'mealScan.freeQuotaRemaining',
                      {
                        count:
                          remainingScans,
                        defaultValue:
                          '{{count}} of 3 scans remaining today',
                      },
                    )}
              </Text>

              {!isPremium ? (
                <Text style={styles.quotaNotice}>
                  {t(
                    'mealScan.rewardedNotice',
                    'Watch a rewarded ad before each AI analysis.',
                  )}
                </Text>
              ) : (
                <Text style={styles.quotaNotice}>
                  {t(
                    'mealScan.premiumNoAdsNotice',
                    'Premium scans do not require ads.',
                  )}
                </Text>
              )}
            </View>
          </View>

          {!isPremium ? (
            <View style={styles.quotaDots}>
              {Array.from({
                length:
                  FREE_DAILY_AI_SCAN_LIMIT,
              }).map(
                (_, index) => {
                  const available =
                    index <
                    remainingScans;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.quotaDot,
                        available &&
                          styles.quotaDotAvailable,
                      ]}
                    />
                  );
                },
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.previewCard}>
          {imageUri ? (
            <Image
              source={{
                uri: imageUri,
              }}
              style={styles.preview}
            />
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.cameraIcon}>
                📷
              </Text>

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
                  color="#10230F"
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
        'rgba(24, 163, 155, 0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.36)',
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
        'rgba(99, 201, 52, 0.09)',
      borderColor:
        'rgba(99, 201, 52, 0.32)',
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
    quotaValue: {
      color: '#8B6500',
      fontSize: 12,
      fontWeight: '900',
      marginTop: 4,
    },
    quotaNotice: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    quotaDots: {
      flexDirection: 'row',
      marginTop: 11,
    },
    quotaDot: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      backgroundColor:
        'rgba(109, 120, 111, 0.20)',
      marginHorizontal: 3,
    },
    quotaDotAvailable: {
      backgroundColor: GREEN,
    },
    previewCard: {
      height: 360,
      borderRadius: 24,
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor:
        '#DCE6D8',
      overflow: 'hidden',
      marginTop: 18,
    },
    preview: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    emptyPreview: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#EEF4EA',
    },
    cameraIcon: {
      fontSize: 52,
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 13,
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
      backgroundColor:
        'rgba(99, 201, 52, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.40)',
      paddingVertical: 13,
      alignItems: 'center',
      marginRight: 6,
    },
    primaryText: {
      color: NEON,
      fontSize: 13,
      fontWeight: '900',
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 999,
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.28)',
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
      backgroundColor: GREEN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 13,
    },
    analyzeText: {
      color: '#10230F',
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
        'rgba(109, 120, 111, 0.18)',
      padding: 13,
      marginTop: 13,
      shadowColor: '#879487',
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
      backgroundColor: '#F5F8F2',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.16)',
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
        'rgba(24, 163, 155, 0.09)',
      borderColor:
        'rgba(24, 163, 155, 0.25)',
    },
    methodIconBarcode: {
      backgroundColor:
        'rgba(43, 130, 217, 0.08)',
      borderColor:
        'rgba(43, 130, 217, 0.23)',
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