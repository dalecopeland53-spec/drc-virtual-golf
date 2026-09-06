import React, { useEffect } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import { WebView } from 'react-native-webview';

export default function App() {
  const liveProjectUrl =
    'https://dalecopeland53-spec.github.io/drc-virtual-golf/';

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS !== 'android') return;

      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
      } catch (error) {
        console.log('Permission error:', error);
      }
    };

    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#03081e"
      />

      <WebView
        source={{ uri: liveProjectUrl }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        startInLoadingState={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03081e',
  },

  webview: {
    flex: 1,
    backgroundColor: '#03081e',
  },
});
