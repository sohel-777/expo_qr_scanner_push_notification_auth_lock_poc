import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

interface PinSetupScreenProps {
  onPinSet: () => void;
}

export default function PinSetupScreen({ onPinSet }: PinSetupScreenProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    const hashedPin = CryptoJS.SHA256(pin).toString();
    await SecureStore.setItemAsync("pin", hashedPin);
    onPinSet();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your PIN</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
        placeholder="Enter PIN"
        maxLength={4}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        value={confirmPin}
        onChangeText={setConfirmPin}
        placeholder="Confirm PIN"
        maxLength={4}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Set PIN" onPress={handleSetPin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
