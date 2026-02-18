import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./HomeScreen";
import ContectUs from "./ContectUs";


const Tab = createMaterialTopTabNavigator();

export default function TopTabs() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={Colors.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Help Center</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Tabs */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: "#555",
          tabBarLabelStyle: { fontSize: 14, fontFamily: Fonts.medium },
          tabBarIndicatorStyle: { backgroundColor: Colors.primary, height: 3 },
          tabBarStyle: { backgroundColor: Colors.background },
        }}
      >
        <Tab.Screen name="FAQ" component={HomeScreen} />
        <Tab.Screen name="Contact Us" component={ContectUs} />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.black,
    marginLeft: 10,
  },
});
