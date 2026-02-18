import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useNavigation } from "@react-navigation/native";

const Privacypolicy = () => {
  const navigation = useNavigation();
  const safeTop = useSafeAreaTop();

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <SettingsHeader title="Privacy Policy" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.title}>
              {index + 1}. {item.title}
            </Text>
            <Text style={styles.description}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Privacypolicy;

const data = [
  {
    title: "Types of Data We Collect",
    desc:
      "Hum apki basic information collect kartay hain jaise name, email, phone number aur app usage details taake user experience improve kiya ja sake.",
  },
  {
    title: "How We Use Your Data",
    desc:
      "Ye data sirf app features provide karne, service improve karne aur better recommendations dene ke liye use hota hai.",
  },
  {
    title: "Data Sharing Policy",
    desc:
      "Hum apki personal information kisi third party ko sell ya misuse nahi kartay. Sirf legal requirement ho to provide ki jati hai.",
  },
  {
    title: "Security of Your Data",
    desc:
      "Hum advanced security measures use kartay hain taa ke apka data safe aur protected rahe.",
  },
  {
    title: "Your Rights",
    desc:
      "Aap apny data ko access, update ya delete karwa saktay hain jab chahein.",
  },
  {
    title: "Cookies & Tracking",
    desc:
      "App better experience ke liye cookies aur tracking tools use kar sakti hai.",
  },
  {
    title: "Policy Updates",
    desc:
      "Kabhi bhi privacy policy update ho sakti hai, updates app me notify kiye jain ge.",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },

  section: {
    marginBottom: 18,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
});
