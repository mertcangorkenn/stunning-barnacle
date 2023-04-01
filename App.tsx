import React, {useState, useCallback, useEffect} from 'react';
import {
  BackHandler,
  ScrollView,
  RefreshControl,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {WebView} from 'react-native-webview';
import messaging, {
  FirebaseMessagingTypes,
  firebase,
} from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

const App = () => {
  useEffect(() => {
    const getFCMToken = async () => {
      const messagingPermission = await messaging().requestPermission();
      if (messagingPermission === messaging.AuthorizationStatus.AUTHORIZED) {
        const fcmToken = await messaging().getToken();
        console.log('FCM Token:', fcmToken);
      }
    };
    getFCMToken();
  }, []);

  useEffect(() => {
    firebase.messaging().onMessage(response => {
      console.log(JSON.stringify(response));
      if (Platform.OS !== 'ios') {
        showNotification(response.notification!);
        return;
      }
      PushNotificationIOS.requestPermissions().then(() =>
        showNotification(response.notification!),
      );
    });
  }, []);

  const showNotification = (
    notification: FirebaseMessagingTypes.Notification,
  ) => {
    PushNotification.localNotification({
      title: notification.title,
      message: notification.body!,
      userInfo: {foreground: true},
    });
  };

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });

  messaging().onMessage(async remoteMessage => {
    console.log('Foregorund Message!', remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification caused app to open', remoteMessage);
  });

  const [canGoBack, setCanGoBack] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

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
    if (navState.url === 'https://voiceof.markets/') {
      setRefreshing(false); // yukarı çıkılacak sayfaya gelindiğinde yenilemeyi durdur
    }
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
