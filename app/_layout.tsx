import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { View, Text } from "react-native";
import PinSetupScreen from "../compoets/PinSetupScreen";
import PinEntryScreen from "../compoets/PinEntryScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background message received:", remoteMessage);
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [authStatus, setAuthStatus] = useState("checking");
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      initializeAuth();
    }
  }, [loaded]);

  const initializeAuth = async () => {
    try {
      const pin = await SecureStore.getItemAsync("pin");
      if (!pin) {
        setAuthStatus("pinNotSet");
      } else {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const biometricsReady = hasHardware && isEnrolled;
        setBiometricsAvailable(biometricsReady);
        if (biometricsReady) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to access the app",
          });
          if (result.success) {
            setAuthStatus("authenticated");
          } else {
            setAuthStatus("needsAuthentication");
          }
        } else {
          setAuthStatus("needsAuthentication");
        }
      }
    } catch (error) {
      console.error("Authentication initialization error:", error);
      setAuthStatus("needsAuthentication"); // Fallback to PIN entry on error
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={false ? DarkTheme : DefaultTheme}>
      {authStatus === "checking" && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      )}
      {authStatus === "pinNotSet" && (
        <PinSetupScreen onPinSet={() => setAuthStatus("authenticated")} />
      )}
      {authStatus === "needsAuthentication" && (
        <PinEntryScreen
          onAuthenticated={() => setAuthStatus("authenticated")}
          biometricsAvailable={biometricsAvailable}
        />
      )}
      {authStatus === "authenticated" && (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
