import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import Loginuserimageupload from "@/dialog/Loginuserimageupload";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import {
  deleteAvatar,
  deleteMultipleImages,
} from "@/lib/Deleteimagessupabase";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "@/lib/supabasemultiimages";
import { updateProfile } from "@/services/Profile";

const Editloginuser = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();

  /* ================= PROFILE FIELDS ================= */
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [about, setAbout] = useState("");
  const [profession, setProfession] = useState("");

  /* ================= INTERESTS ================= */
  const [interestInput, setInterestInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  /* ================= IMAGES ================= */
  const [apiImages, setApiImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>(["", "", "", ""]);
  const [apiAvatar, setApiAvatar] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  /* ================= SAVE BUTTON ================= */
  const [isSaving, setIsSaving] = useState(false);

  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    if (!profileSlice) return;
    setName(profileSlice.full_name || "");
    setNickname(profileSlice.nickname || "");
    setAbout(profileSlice.about || "");
    setProfession(profileSlice.profession || "");
    setInterests(profileSlice.interests || []);
    if (profileSlice.images?.length) {
      setApiImages(profileSlice.images);
      setImages(profileSlice.images);
    }
    if (profileSlice.avatar_url) {
      setApiAvatar(profileSlice.avatar_url);
      setAvatar(profileSlice.avatar_url);
    }
  }, [profileSlice]);

  /* ================= IMAGE PICK ================= */
  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(prev => {
        const updated = [...prev];
        updated[index] = result.assets[0].uri;
        return updated;
      });
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  /* ================= INTEREST CRUD ================= */
  const addInterest = () => {
    if (!interestInput.trim()) return;
    setInterests(prev => [...prev, (interestInput.trim())]);
    setInterestInput("");
  };
  const deleteInterest = (index: number) => {
    setInterests(prev => prev.filter((_, i) => i !== index));
  };

  /* ================= SAVE ================= */
  const onSave = async () => {
    if (isSaving) return;
    // simple validation
    if (!name.trim() || !nickname.trim()) {
      Alert.alert("Required", "Please fill your name and nickname.");
      return;
    }
    setIsSaving(true);
    try {
      const oldImages = apiImages;
      const newPickedImages = images.filter(img => !oldImages.includes(img));
      const deletedImages = oldImages.filter(img => !images.includes(img));

      if (deletedImages.length) await deleteMultipleImages(deletedImages);
      let uploadedPublicUrls: string[] = [];
      if (newPickedImages.length)
        uploadedPublicUrls = await uploadMultipleImages(newPickedImages);

      const finalImages = [
        ...oldImages.filter(img => !deletedImages.includes(img)),
        ...uploadedPublicUrls,
      ];

      let finalAvatar = apiAvatar;
      if (avatar && avatar !== apiAvatar) {
        if (apiAvatar) await deleteAvatar(apiAvatar);
        finalAvatar = await uploadSingleImage(avatar);
      }

      const payload = {
        full_name: name,
        nickname,
        about,
        profession,
        interests,
        images: finalImages,
        avatar_url: finalAvatar,
      };

      await updateProfile(payload);
      console.log("Saved Profile:", payload);
      router.back();
    } catch (err) {
      console.log("Save Error:", err);
    } finally {
      setIsSaving(false);
    }
  };
console.log(interests)
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          {/* AVATAR */}
          <TouchableOpacity
            style={{ alignItems: "center", marginTop: 15 }}
            onPress={pickAvatar}
          >
            <Image
              source={{
                uri:
                  avatar ||
                  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
              }}
              style={styles.userImage}
            />
          </TouchableOpacity>
          <Loginuserimageupload visible={visible} setVisible={setVisible} />

          {/* NAME */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={Colors.black}
          />

          {/* NICKNAME */}
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nickname"
            placeholderTextColor={Colors.black}
          />

          {/* PROFESSION */}
          <Text style={styles.label}>Profession</Text>
          <TextInput
            style={styles.input}
            value={profession}
            onChangeText={setProfession}
            placeholder="Your profession"
            placeholderTextColor={Colors.black}
          />

          {/* ABOUT */}
          <Text style={styles.label}>About</Text>
          <TextInput
            style={styles.aboutInput}
            value={about}
            onChangeText={setAbout}
            placeholder="Tell something about yourself"
            multiline
            placeholderTextColor={Colors.black}
          />

          {/* INTERESTS */}
          <Text style={styles.label}>Interests</Text>
          <View style={styles.interestRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={interestInput}
              onChangeText={setInterestInput}
              placeholder="Add interest"
              placeholderTextColor={Colors.black}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addInterest}>
              <AntDesign name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.interestWrap}>
            {interests?.length > 0 &&
              interests?.map((item, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                  <TouchableOpacity onPress={() => deleteInterest(index)}>
                    <AntDesign name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
          </View>

          {/* IMAGE GRID */}
          <View style={styles.grid}>
            {images?.map((img, index) => (
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
                  <AntDesign name="plus" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* SAVE */}
        <View style={styles.saveWrapper}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { opacity: isSaving ? 0.5 : 1 },
            ]}
            onPress={onSave}
            disabled={isSaving}
          >
            <Text style={styles.saveText}>
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Editloginuser;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.black },

  userImage: { width: 140, height: 140, borderRadius: 100 },

  label: {
    marginTop: 20,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.black,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    color: Colors.black,
  },

  aboutInput: {
    height: 120,
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    textAlignVertical: "top",
    color: Colors.black,
    fontFamily: Fonts.regular,
  },

  interestRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
  },

  interestWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  chipText: { color: "#fff" },

  grid: { marginTop: 30, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    height: 140,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  saveWrapper: { position: "absolute", bottom: 20, left: 16, right: 16 },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontFamily: Fonts.bold },
});
