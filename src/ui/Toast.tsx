// FILE: src/ui/Toast.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Ctx = { show: (msg: string, ms?: number) => void };
const ToastCtx = createContext<Ctx>({ show: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  const hide = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) })
      .start(() => { setVisible(false); setMsg(''); });
  }, [opacity]);

  const show = useCallback((text: string, ms = 2000) => {
    setMsg(text);
    setVisible(true);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
    setTimeout(() => hide(), ms);
  }, [hide, opacity]);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {visible ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill]}>
          <Animated.View
            style={[
              styles.wrap,
              { bottom: 16 + insets.bottom, opacity, transform: [{ translateY: opacity.interpolate({
                inputRange: [0,1], outputRange: [10,0]
              }) }] }
            ]}
          >
            <View style={styles.inner}><Text style={styles.text}>{msg}</Text></View>
          </Animated.View>
        </View>
      ) : null}
    </ToastCtx.Provider>
  );
};

export const useToast = () => useContext(ToastCtx);

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', position: 'absolute' },
  inner: {
    maxWidth: '92%', backgroundColor: 'rgba(17,24,39,0.95)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  text: { color: '#F8FAFC', fontWeight: '700' },
});
