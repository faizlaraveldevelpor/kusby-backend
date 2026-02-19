import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useDispatch } from "react-redux";
import { profileImages } from "@/store/profileSlice";

export default function Photos() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [images, setImages] = useState([null, null, null, null]);
  const [isValid, setIsValid] = useState(false); // ✅ validation state

  const pickImage = async (index: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  // ✅ Save images to Redux
  useEffect(() => {
    dispatch(profileImages(images));

    // ✅ Validation: at least 1 image uploaded
    const uploadedCount = images.filter(img => img !== null).length;
    setIsValid(uploadedCount > 0);
  }, [images]);

  const handleContinue = () => {
    if (!isValid) {
      Alert.alert("Upload Required", "Please upload at least one photo to continue.");
      return;
    }
    router.push("/signupsteps/Intrestes");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Your Best Photos</Text>
        </View>

        <Text style={styles.description}>
          Upload your best and clear photos so people can recognize you easily.
        </Text>

        <View style={styles.grid}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => pickImage(index)}
            >
              {img ? (
                <Image
                  source={{ uri: img }}
                  style={{ width: "100%", height: "100%", borderRadius: 18 }}
                />
              ) : (
                <View style={styles.plusWrapper}>
                  <AntDesign name="plus" size={24} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, { opacity: isValid ? 1 : 0.5 }]}
        onPress={handleContinue}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: Fonts.bold,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.black,
    opacity: 0.6,
    fontFamily: Fonts.regular,
  },
  grid: {
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 150,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    overflow: "hidden",
  },
  plusWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 25,
    alignItems: "center",
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
