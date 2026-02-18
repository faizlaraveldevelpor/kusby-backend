import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useDispatch, useSelector } from "react-redux";
import { profileintrests } from "@/store/profileSlice";
import { signInEmail } from "@/services/Auth";
import { updateProfile } from "@/services/Profile";
import { uploadImageToSupabase } from "@/lib/supabsestorage";
import { uploadMultipleImages } from "@/lib/supabasemultiimages";

const interestsData = [
  { id: 1, name: "Music", icon: "music" },
  { id: 2, name: "Sports", icon: "football-ball" },
  { id: 3, name: "Travel", icon: "plane" },
  { id: 4, name: "Food", icon: "hamburger" },
  { id: 5, name: "Movies", icon: "film" },
  { id: 6, name: "Fitness", icon: "dumbbell" },
  { id: 7, name: "Books", icon: "book" },
  { id: 8, name: "Photography", icon: "camera" },
  { id: 9, name: "Gaming", icon: "gamepad" },
  { id: 10, name: "Art", icon: "paint-brush" },
  { id: 11, name: "Technology", icon: "laptop" },
  { id: 12, name: "Fashion", icon: "tshirt" },
];

export default function SelectInterest() {
  const router = useRouter();
  const dispatch = useDispatch();

  const loginuserInfo = useSelector(
    (state: any) => state.profileSlice.userlogininfo
  );
  const profileData = useSelector(
    (state: any) => state.profileSlice.profiledata
  );
  const profileavtar = useSelector(
    (state: any) => state.profileSlice.profileavtar
  );
  const profilecetagory = useSelector(
    (state: any) => state.profileSlice.cetagory
  );
  const profileImages = useSelector(
    (state: any) => state.profileSlice.profileImages
  );

  const [selected, setSelected] = useState<any[]>([]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toggle interest selection
  const toggleInterest = (item: { id: number; name: string; icon: string }) => {
    const exists = selected.some(sel => sel.id === item.id);
    if (exists) {
      setSelected(selected.filter(sel => sel.id !== item.id));
    } else {
      setSelected([...selected, item]);
    }
  };

  // Update redux and button state
  useEffect(() => {
    dispatch(profileintrests(selected));

    // ✅ Correct logic: enable button only if 3 or 4 selected
    if (selected) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  }, [selected, loading]);

  // Submit interests
  const Submit = async () => {
    if (!isButtonEnabled) return;
    setLoading(true);
    setIsButtonEnabled(false);

    try {
      // const { data, error } = await signInEmail(
      //   loginuserInfo.email,
      //   loginuserInfo.password
      // );
      // if (error) {
      //   console.log(error.message);
      // } else {
      //   console.log("Logged in user:", data.user);
      // }

      const avtarpublicID = await uploadImageToSupabase(profileavtar);
      const avtarpublicIDS = await uploadMultipleImages(profileImages);

      // ✅ Only save interest NAMES
      const interestNames = selected.map(i => i.name);

      await updateProfile({
        full_name: profileData.full_name,
        nickname: profileData.nickname,
        gender: profileData.gender,
        avatar_url: avtarpublicID,
        email: profileData.email,
        phone: profileData.phone,
        images: avtarpublicIDS,
        interests: interestNames, // only names
        date_of_birth: profileData?.date,
        about: profileData?.about,
        profession: profileData?.profession,
        cetagory:profilecetagory
      });

      router.push("/(tabs)");
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
      if (selected.length >= 3 && selected.length <= 4) {
        setIsButtonEnabled(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Interest</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Choose your interests so we can show you content that you love.
      </Text>

      {/* Interests Grid */}
      <FlatList
        data={interestsData}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ marginTop: 25, paddingBottom: 120 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 15 }}
        renderItem={({ item }) => {
          const isSelected = selected.some(sel => sel.id === item.id);
          return (
            <TouchableOpacity
              style={[
                styles.interestCard,
                isSelected && {
                  backgroundColor: Colors.primary,
                  borderColor: Colors.primary,
                },
              ]}
              onPress={() => toggleInterest(item)}
            >
              <FontAwesome5
                name={item.icon}
                size={28}
                color={Colors.black}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.interestText, { color: Colors.black }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.button, { opacity: isButtonEnabled && !loading ? 1 : 0.5 }]}
        onPress={Submit}
        disabled={!isButtonEnabled || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
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
    paddingBottom: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, color: Colors.black, fontFamily: Fonts.bold },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.black,
    opacity: 0.6,
    fontFamily: Fonts.regular,
  },
  interestCard: {
    flex: 1,
    height: 120,
    borderRadius: 15,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    marginHorizontal: 5,
    padding: 10,
  },
  interestText: { fontFamily: Fonts.medium, color: Colors.black, textAlign: "center" },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontFamily: Fonts.medium },
});
