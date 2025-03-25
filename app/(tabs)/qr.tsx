import { StyleSheet, Image, Platform, View, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function TabTwoScreen() {
  const qrData = {
    id: "12345678",
    name: "John Doe",
    // amount is optional, so you can include it conditionally:
    // amount: 50,
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* <Text>hi</Text> */}
      <QRCode size={300} value={JSON.stringify(qrData)} />
    </View>
  );
}

const styles = StyleSheet.create({});
