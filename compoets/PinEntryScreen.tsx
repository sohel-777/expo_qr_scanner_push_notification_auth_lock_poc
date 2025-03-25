import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import CryptoJS from "crypto-js";

interface PinEntryScreenProps {
  onAuthenticated: () => void;
  biometricsAvailable: boolean;
}

export default function PinEntryScreen({
  onAuthenticated,
  biometricsAvailable,
}: PinEntryScreenProps) {
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");

  const handleVerifyPin = async () => {
    const storedHashedPin = await SecureStore.getItemAsync("pin");
    if (!storedHashedPin) {
      setError("No PIN set");
      return;
    }
    const enteredHashedPin = CryptoJS.SHA256(enteredPin).toString();
    if (storedHashedPin === enteredHashedPin) {
      onAuthenticated();
    } else {
      setError("Incorrect PIN");
    }
  };

  const handleBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with biometrics",
    });
    if (result.success) {
      onAuthenticated();
    } else {
      setError("Biometric authentication failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your PIN</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        keyboardType="numeric"
        value={enteredPin}
        onChangeText={setEnteredPin}
        placeholder="Enter PIN"
        maxLength={4}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Submit" onPress={handleVerifyPin} />
      {biometricsAvailable && (
        <Button title="Use Biometrics" onPress={handleBiometrics} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
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
