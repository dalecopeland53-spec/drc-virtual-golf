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
    const requestMicrophonePermission = async () => {
      if (Platform.OS !== 'android') return;

      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'DRC Virtual Golf Microphone',
            message:
              'DRC Virtual Golf needs microphone access so you can speak to your caddie.',
            buttonPositive: 'Allow',
            buttonNegative: 'Not now',
          }
        );
      } catch (error) {
        console.log('Microphone permission error:', error);
      }
    };

    requestMicrophonePermission();
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
