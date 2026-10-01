// FILE: src/screens/PdfViewerScreen.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Pdf from 'react-native-pdf';

type Props = {
  route: {
    params?: {
      title?: string;
      // Nếu bạn muốn dùng URL thay vì file bundle,
      // truyền vào param remoteUrl.
      remoteUrl?: string;
    };
  };
};

export const PdfViewerScreen: React.FC<Props> = ({ route }) => {
  // Ưu tiên URL nếu có, không thì đọc file bundle assets
  const source =
    route?.params?.remoteUrl
      ? { uri: route.params.remoteUrl, cache: true }
      : Platform.select({
          android: { uri: 'bundle-assets://docs/nutrition_guide.pdf' },
          ios:     { uri: 'bundle-assets://nutrition_guide.pdf' },
        });

  return (
    <View style={s.container}>
      <Pdf
        source={source as any}
        style={s.pdf}
        enablePaging={false}
        trustAllCerts={true}
        onError={(e) => console.log('PDF error', e)}
        onLoadComplete={(pages) => console.log(`PDF loaded: ${pages} pages`)}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  pdf: { flex: 1, width: '100%' },
});

export default PdfViewerScreen;
