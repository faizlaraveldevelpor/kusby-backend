import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import Upoloadimage from "@/dialog/Upoloadimage";
import { useDispatch, useSelector } from "react-redux";
import { profiledata } from "@/store/profileSlice";

const countries = [
  { flag: "🇵🇰", code: "+92", name: "Pakistan" },
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
];

export default function Fillyourprofile() {
  const router = useRouter();
  const dispatch = useDispatch();
const loginuserInfo = useSelector(
    (state: any) => state.profileSlice.userlogininfo);
  const profileavtarFromRedux = useSelector(
    (state: any) => state.profileSlice.profileavtar);
  /* STATES */
  const [full_name, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(loginuserInfo?.number);
  const [avatar, setAvatar] = useState<string | null>(null);
  const displayAvatar = avatar || profileavtarFromRedux;
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [about, setAbout] = useState("");
  const [profession, setProfession] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  const filtered = countries.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Validation
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid =
      full_name.trim() !== "" &&
      nickname.trim() !== "" &&
      emailRegex.test(email) &&
      gender !== "" &&
      selectedCountry &&
      date &&
      about.trim() !== "" &&
      profession.trim() !== "";
    setIsValid(valid);
  };

  useEffect(() => {
    validateInputs();

    // ✅ Redux me string save
    dispatch(
      profiledata({
        full_name: full_name.trim(),
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        selectedCountry,
        date: date.toISOString(),
        gender,
        avatar: displayAvatar || null,
        about: about.trim(),
        profession: profession.trim(),
      })
    );
  }, [full_name, nickname, email, phone, selectedCountry, date, gender, avatar, profileavtarFromRedux, about, profession]);

  const handleContinue = () => {
    if (!isValid) {
      Alert.alert("Incomplete", "Please fill all fields correctly to continue.");
      return;
    }
    router.push("/signupsteps/Cetagories");
  };
console.log(loginuserInfo);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Fill Your Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri:
                displayAvatar ?? "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setVisible(true)}
          >
            <Feather name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Upoloadimage visible={visible} setVisible={setVisible} />

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          placeholderTextColor={Colors.black}
          value={full_name}
          onChangeText={setFullName}
        />

        {/* Nickname */}
        <Text style={styles.label}>Nickname</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter nickname"
          placeholderTextColor={Colors.black}
          value={nickname}
          onChangeText={setNickname}
        />

        {/* About */}
        <Text style={styles.label}>About</Text>
        <TextInput
          style={styles.input}
          placeholder="Write something about yourself"
          placeholderTextColor={Colors.black}
          value={about}
          onChangeText={setAbout}
        />

        {/* Profession */}
        <Text style={styles.label}>Profession</Text>
        <TextInput
          style={styles.input}
          placeholder="Your profession"
          placeholderTextColor={Colors.black}
          value={profession}
          onChangeText={setProfession}
        />

        {/* DOB */}
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dobBox}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dobText}>{date.toDateString()}</Text>
          <Feather name="calendar" size={20} color={Colors.black} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            maximumDate={new Date()}
            display={Platform.OS === "ios" ? "spinner" : "calendar"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios"); // iOS stays open
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor={Colors.black}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor={Colors.black}
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          readOnly
        />

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderWrap}>
          {["Male", "Female", "Other"].map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.genderBtn,
                gender === item && { backgroundColor: Colors.primary },
              ]}
              onPress={() => setGender(item)}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === item && { color: "#fff" },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue */}
        <TouchableOpacity
          style={[styles.continueBtn, { opacity: isValid ? 1 : 0.5 }]}
          onPress={handleContinue}
          disabled={!isValid}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20, paddingTop: 40 },
  header: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 20, marginLeft: 10, color: Colors.black, fontFamily: Fonts.bold },
  avatarWrap: { alignItems: "center", marginVertical: 20 },
  avatar: { width: 110, height: 110, borderRadius: 100 },
  addBtn: { position: "absolute", bottom: 0, right: 130, backgroundColor: Colors.primary, padding: 8, borderRadius: 20 },
  label: { marginTop: 8, marginBottom: 5, color: Colors.black, fontFamily: Fonts.semiBold },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "#ddd",
    backgroundColor: Colors.background,
    fontFamily: Fonts.regular,
    color: Colors.black,
    marginBottom: 10,
  },
  dobBox: {
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dobText: { fontFamily: Fonts.regular, color: Colors.black },
  genderWrap: { flexDirection: "row", justifyContent: "space-between", marginTop: 5, marginBottom: 20 },
  genderBtn: { width: "30%", paddingVertical: 10, borderWidth: 1, borderRadius: 10, borderColor: "#ddd", alignItems: "center" },
  genderText: { fontFamily: Fonts.medium, color: Colors.black },
  continueBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 30, alignItems: "center", marginTop: 25 },
  continueText: { color: "#fff", fontSize: 16, fontFamily: Fonts.bold },
});
