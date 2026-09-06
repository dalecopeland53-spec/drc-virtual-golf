import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { WebView } from 'react-native-webview';

export default function App() {

  const liveProjectUrl =
    'https://dalecopeland53-spec.github.io/drc-virtual-golf/';

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
        scalesPageToFit={true}
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
