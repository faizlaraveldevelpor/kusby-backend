import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const ContectUs = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* WhatsApp */}
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <FontAwesome name="whatsapp" size={26} color="#25D366" />
          <Text style={styles.text}>WhatsApp</Text>
        </TouchableOpacity>

        {/* Website */}
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="globe-outline" size={26} color={Colors.primary} />
          <Text style={styles.text}>Website</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <FontAwesome name="facebook-official" size={26} color="#1877F2" />
          <Text style={styles.text}>Facebook</Text>
        </TouchableOpacity>

        {/* Instagram */}
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="logo-instagram" size={26} color="#E1306C" />
          <Text style={styles.text}>Instagram</Text>
        </TouchableOpacity>

        {/* Twitter */}
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="logo-twitter" size={26} color="#1DA1F2" />
          <Text style={styles.text}>Twitter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ContectUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,           // thoda kam kiya
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: 16,
    marginLeft: 15,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
});
