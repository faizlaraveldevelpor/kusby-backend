import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CountryPicker from "react-native-country-picker-modal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { updateProfile, updateCategoryApi, getMyProfile } from "@/services/Profile";
import { useSelector, useDispatch } from "react-redux";
import { GetprofileApi, cetagory } from "@/store/profileSlice";



const profileData = {
  full_name: "Ali Khan",
  nickname: "Alix",
  date_of_birth: "1995-08-15",
  gender: "male",
  avatar_url: "https://example.com/avatar.jpg",
  location: { lat: 31.5204, lng: 74.3587, city: "Lahore", country: "Pakistan" },
  email: "ali.khan@example.com",
  phone: "+923001234567",
  images: [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  interests: ["coding", "music", "travel"],
  country: "Pakistan",
  pin: "1234",
  is_vip: true,
  daily_swipes_count: 25
};

const CATEGORY_OPTIONS = [
  "Casual dating",
  "Hookups",
  "Open to anything",
  "Friends first",
];

const Parsnalinformation = ({ navigation }: any) => {
  const safeTop = useSafeAreaTop();
  const dispatch = useDispatch();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);

  const [firstName, setFirstName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [callingCode, setCallingCode] = useState("1");
  const [gender, setGender] = useState("");
  const [category, setCategory] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(profileSlice?.full_name || "");
    setNickname(profileSlice?.nickname || "");
    setDob(profileSlice?.date_of_birth || "");
    setPhone(profileSlice?.phone || "");
    setGender(profileSlice?.gender || "");
    setCategory(profileSlice?.cetagory || "");
  }, [profileSlice]);
  const router = useRouter();
const locationupdate=async()=>{

}
  const handleSelectCountry = (country: any) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  const handleConfirmDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setDob(formattedDate);
    setDatePickerVisible(false);
  };
  const submit = async () => {
    if (!profileSlice?.id) return;
    setSaving(true);
    try {
      const profilePayload = {
        full_name: firstName,
        nickname: nickname,
        date_of_birth: dob,
        phone: phone,
        gender: gender,
      } as any;
      await updateProfile(profilePayload);

      if (category.trim()) {
        await updateCategoryApi(profileSlice.id, category.trim());
      }

      const myProfileRes = await getMyProfile();
      if (myProfileRes?.data) {
        dispatch(GetprofileApi(myProfileRes.data));
        const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
        if (cat != null && cat !== "") dispatch(cetagory(cat));
      }

      Alert.alert("Saved", "Your information has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <ScrollView style={[styles.container, { paddingTop: safeTop }]} contentContainerStyle={{ paddingLeft: 18, paddingRight: 18, paddingTop: 0, paddingBottom: 20 }}>
      <SettingsHeader title="Personal Information" onBack={() => router.back()} />

      {/* First Name */}
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter First Name"
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor={Colors.black}
      />

      {/* Nickname */}
      <Text style={styles.label}>Nickname</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Nickname"
        value={nickname}
        onChangeText={setNickname}
        placeholderTextColor={Colors.black}
      />

      {/* DOB */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={dob}
          editable={false}
          pointerEvents="none"
          placeholderTextColor={Colors.black}
        />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.phoneContainer}>
        

        

        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholderTextColor={Colors.black}
        />
      </View>

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderContainer}>
        {["Male", "Female", "Other"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderButton,
              gender === g && styles.genderSelected,
            ]}
            onPress={() => setGender(g)}
          >
            <Text
              style={[
                styles.genderText,
                gender === g && {
                  color: "#fff",
                  fontFamily: Fonts.bold,
                },
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <Text style={styles.hint}>What are you looking for?</Text>
      <View style={styles.categoryWrap}>
        {CATEGORY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.categoryBtn,
              category === opt && styles.categoryBtnSelected,
            ]}
            onPress={() => setCategory(opt)}
          >
            <Text
              style={[
                styles.categoryBtnText,
                category === opt && styles.categoryBtnTextSelected,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={() => submit()}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={styles.btnText}>Save</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    color: Colors.black,
    fontFamily: Fonts.medium,
  },
  hint: {
    fontSize: 13,
    marginBottom: 8,
    color: Colors.gray,
    fontFamily: Fonts.regular,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 5,
  },
  categoryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  categoryBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryBtnText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.medium,
  },
  categoryBtnTextSelected: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 5,
    fontFamily: Fonts.medium,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.medium,
  },
  btn: {
    height: 50,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    opacity: 0.7,
  },

  btnText: {
    
    fontSize: 16,
    fontFamily:Fonts.bold,
    color: Colors.white,
    
  },
});

export default Parsnalinformation;
