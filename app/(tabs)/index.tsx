import { Alert, Platform, PermissionsAndroid, Text, View } from "react-native";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { useEffect } from "react";

export default function HomeScreen() {
  useEffect(() => {
    console.log("HomeScreen mounted, checking permissions...");

    const requestNotificationPermissionAndroid = async () => {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission",
            message: "Allow this app to send you notifications?",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Deny",
            buttonPositive: "Allow",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    const requestUserPermission = async () => {
      const androidGranted = await requestNotificationPermissionAndroid();
      if (!androidGranted) {
        console.log("Android notification permission denied");
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in Settings."
        );
        return false;
      }
      const authStatus = await messaging().requestPermission();
      console.log("Raw authStatus:", authStatus);
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log("Full permissions granted");
      } else {
        console.log("Permissions denied");
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in Settings."
        );
      }
      return enabled;
    };

    const checkAndRequestPermission = async () => {
      const hasPermission = await messaging().hasPermission();
      console.log("Current permission status:", hasPermission);

      if (
        hasPermission === messaging.AuthorizationStatus.NOT_DETERMINED ||
        hasPermission === messaging.AuthorizationStatus.DENIED
      ) {
        console.log("Requesting permission...");
        await requestUserPermission().then((enabled) => {
          if (enabled) {
            messaging()
              .getToken()
              .then((token) => {
                console.log("FCM Token:", token);
                Alert.alert("Permission granted, token is:", token);
              })
              .catch((error) => console.error("Error fetching token:", error));
          }
        });
      } else if (hasPermission === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log("Permissions already fully authorized");
        messaging()
          .getToken()
          .then((token) =>
            console.log("FCM Token (already authorized):", token)
          );
      }
    };

    checkAndRequestPermission();

    // Notification handlers...
    messaging()
      .getInitialNotification()
      .then((initialNotification) => {
        if (initialNotification) {
          Alert.alert(
            "Initial notification:",
            JSON.stringify(initialNotification.notification)
          );
        }
      });

    const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        Alert.alert(
          "Notification opened from background:",
          JSON.stringify(remoteMessage.notification)
        );
      }
    );

    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        Alert.alert("Foreground message:", JSON.stringify(remoteMessage));
      }
    );

    return () => {
      unsubscribeOnOpened();
      unsubscribeOnMessage();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}
