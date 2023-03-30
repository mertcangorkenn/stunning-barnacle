import React, {useState, useCallback} from 'react';
import {BackHandler, ScrollView, RefreshControl, Alert} from 'react-native';
import {WebView} from 'react-native-webview';

const App = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleBackButton = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true;
    } else {
      Alert.alert(
        'Çıkış',
        'Geri dönülecek başka sayfa yok. Uygulamadan çıkmak istediğinize emin misiniz?',
        [
          {
            text: 'Hayır',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Evet',
            onPress: () => BackHandler.exitApp(),
          },
        ],
      );
      return true;
    }
  }, [canGoBack]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
    setRefreshing(false);
  }, []);

  const webViewRef = React.useRef<WebView | null>(null);

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [handleBackButton]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleWebViewMessage = (event: any) => {
    console.log(event.nativeEvent.data);
    // handle notification here
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{flexGrow: 1}}>
      <WebView
        style={{flex: 1}}
        userAgent={
          'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
        }
        source={{uri: 'https://voiceof.markets/'}}
        ref={webViewRef}
        onNavigationStateChange={handleNavigationStateChange}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        cacheEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        geolocationEnabled={true}
        thirdPartyCookiesEnabled={true}
        onMessage={handleWebViewMessage} // handle notifications here
      />
    </ScrollView>
  );
};

export default App;
