import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useRouter } from "expo-router";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Fonts } from "@/theme/fonts";
import { Colors } from "@/theme/color";
import { useDispatch, useSelector } from "react-redux";
import { 
  agefilter, 
  genderfilterfnc, 
  distancefilterfnc 
} from "@/store/profileSlice";

const { width } = Dimensions.get('window');

export default function DiscoverySettings() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const dispatch = useDispatch();

  // --- Redux Selectors ---
  const reduxAge = useSelector((state: any) => state?.profileSlice?.agefilter);
  const reduxGender = useSelector((state: any) => state?.profileSlice?.genderfilter);
  const reduxDistance = useSelector((state: any) => state?.profileSlice?.distancefilter);

  // --- Local States (Redux se sync ya default values) ---
  const [gender, setGender] = useState(reduxGender || "");
  const [ageRange, setAgeRange] = useState<number[]>(reduxAge || [18, 40]);
  const [distanceRange, setDistanceRange] = useState<number[]>(reduxDistance || [5, 50]);

  // --- Actions ---
  const handleApply = () => {
    dispatch(agefilter(ageRange));
    dispatch(genderfilterfnc(gender));
    dispatch(distancefilterfnc(distanceRange));
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: safeTop, paddingHorizontal: 18 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <SettingsHeader title="Discovery Settings" onBack={() => router.back()} />

        {/* Show Me (Gender) */}
        <Text style={styles.label}>Show Me</Text>
        <View style={styles.genderContainer}>
          {["Male", "Female", "Other"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderBtn,
                gender === g && styles.genderActive,
              ]}
              onPress={() => setGender(g)}
            >
              <Text
                style={[
                  styles.genderTxt,
                  gender === g && { color: "#fff", fontFamily: Fonts.bold },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Age Filter */}
        <Text style={styles.label}>Age</Text>
        <Text style={styles.rangeText}>
          {ageRange[0]} - {ageRange[1]}
        </Text>

        <View style={styles.sliderWrapper}>
          <MultiSlider
            values={ageRange}
            min={18}
            max={60}
            step={1}
            onValuesChange={(values) => setAgeRange(values)}
            sliderLength={width - 50}
            selectedStyle={{ backgroundColor: Colors.primary }}
            markerStyle={{ backgroundColor: Colors.primary }}
          />
        </View>

        {/* Distance Filter */}
        <View style={{ marginTop: 25 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Distance</Text>
            <Text style={styles.label}>(in Km)</Text>
          </View>

          <Text style={styles.rangeText}>
            {distanceRange[0]} Km - {distanceRange[1]} Km
          </Text>

          <View style={styles.sliderWrapper}>
            <MultiSlider
              values={distanceRange}
              min={1}
              max={200}
              step={1}
              onValuesChange={(values) => setDistanceRange(values)}
              sliderLength={width - 50}
              selectedStyle={{ backgroundColor: Colors.primary }}
              markerStyle={{ backgroundColor: Colors.primary }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 4
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderTxt: {
    fontSize: 15,
    color: Colors.black,
    fontFamily: Fonts.medium,
  },
  rangeText: {
    fontSize: 16,
    marginTop: 10,
    color: Colors.black,
    fontFamily: Fonts.bold,
  },
  sliderWrapper: {
    alignItems: 'center',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
});