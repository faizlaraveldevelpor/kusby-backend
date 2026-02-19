import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";

const HomeScreen = () => {
  const [active, setActive] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("General");

  const faqs = [
    { q: "How to change password?", a: "You can change password from account settings." },
    { q: "How to update profile?", a: "Go to profile section and update your info." },
    { q: "How to make payment?", a: "Open payment tab and add your card details." },
    { q: "How to enable notifications?", a: "Manage notification permissions in your device Settings (Notifications > Kubsy)." },
    { q: "How to delete my account?", a: "Contact support team to request account delete." },
    { q: "Payment failed. What should I do?", a: "Retry payment or contact support team." },
    { q: "How to change email?", a: "Open account settings and update your email address." },
  ];

  return (
    <View style={styles.container}>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {["General", "Account", "Payment"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.tabBtn, activeTab === item && styles.activeTab]}
            onPress={() => setActiveTab(item)}
          >
            <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#555" />
        <TextInput
          placeholder="Search..."
          style={styles.input}
          placeholderTextColor="#666"
        />
        <Feather name="settings" size={18} color={Colors.black} />
      </View>

      {/* FAQ */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {faqs.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              style={styles.questionRow}
              onPress={() => setActive(active === index ? null : index)}
            >
              <Text style={styles.question}>{item.q}</Text>
              <Ionicons
                name={active === index ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {active === index && (
              <Text style={styles.answer}>{item.a}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
  },

  activeTab: {
    backgroundColor: Colors.primary,
  },

  tabText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily:Fonts.bold
  },

  activeTabText: {
    color: "#fff",
    fontFamily:Fonts.bold
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    marginHorizontal: 6,
    fontSize: 14,
    color:Colors.black,
    fontFamily:Fonts.medium
  },

  card: {
    backgroundColor: Colors.background,   // 👈 HERE FIXED
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  question: {
    fontSize: 15,
    color:Colors.black,
    fontFamily:Fonts.medium    
  },

  answer: {
    marginTop: 8,
    fontSize: 14,
    color:Colors.black,
    fontFamily:Fonts.medium   

  },
});
