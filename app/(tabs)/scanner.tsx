import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
// import { Overlay } from "../../compoets/Overlay";

const scanner = () => {
      const [hasPermission, setHasPermission] = useState<null | boolean>(null);
      const [scanned, setScanned] = useState(false);
      const [scannedData, setScannedData] = useState("");
      const [flash, setFlash] = useState<"on" | "off">("off");
    
      useEffect(() => {
        (async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === "granted");
        })();
      }, []);
    
      const handleBarCodeScanned = ({
        type,
        data,
      }: {
        type: string;
        data: string;
      }) => {
        console.log("Scanned type:", type);
        setScanned(true);
        setScannedData(data);
      };
    
      const toggleFlash = () => {
        setFlash((prev) => (prev === "on" ? "off" : "on"));
      };
    
      const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Gallery permission is needed!");
          return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
        });
        console.log(result.canceled);
        if (!result.canceled) {
          try {
            // scanFromURLAsync scans a QR code from an image URL.
            const barcodes = await Camera.scanFromURLAsync(result.assets[0].uri, [
              "qr",
            ]);
            if (barcodes && barcodes.length > 0) {
              setScanned(true);
              setScannedData(barcodes[0].data);
            } else {
              Alert.alert("No QR Code", "No QR code detected in the image.");
            }
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error scanning QR code from the image.");
          }
        }
      };
    
      if (hasPermission === null) {
        return (
          <View style={styles.centered}>
            <Text>Requesting camera permission...</Text>
          </View>
        );
      }
      if (hasPermission === false) {
        return (
          <View style={styles.centered}>
            <Text>No access to camera.</Text>
          </View>
        );
      }
    
  return (
    <View style={styles.container}>
          {/* Full-screen CameraView */}
          <CameraView
            facing="back"
            flash={flash}
            enableTorch={flash === "on"}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          {/* Overlay for scan area */}
          {/* <Overlay /> */}
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
          {/* Control Buttons */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={toggleFlash}>
              <Text style={styles.buttonText}>
                Flash: {flash === "on" ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Upload from Gallery</Text>
            </TouchableOpacity>
    
            {scanned && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setScanned(false);
                  setScannedData("");
                }}
              >
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Display scanned data */}
          {scannedData ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>Scanned Data: {scannedData}</Text>
            </View>
          ) : null}
        </View>
  )
}

export default scanner

const styles = StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: "#000",
    },
    camera: {
      ...StyleSheet.absoluteFillObject,
    },
    // The overlay covers the entire camera view
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-start",
      alignItems: "center",
      marginTop: 200,
      // backgroundColor: "rgba(0,0,0,0.7)",
    },
    // This is the scan area in the center
    scanArea: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: "white",
      borderRadius: 10,
      // backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    controls: {
      position: "absolute",
      bottom: 100,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 10,
    },
    button: {
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
    },
    resultBox: {
      position: "absolute",
      top: 50,
      alignSelf: "center",
      backgroundColor: "rgba(255,255,255,0.9)",
      padding: 10,
      borderRadius: 5,
    },
    resultText: {
      color: "#000",
      fontSize: 16,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });