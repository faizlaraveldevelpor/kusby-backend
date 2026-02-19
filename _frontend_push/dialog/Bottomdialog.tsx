import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
  Pressable,
  PanResponder,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useDispatch, useSelector } from 'react-redux';
import { agefilter, intrestsfilter } from '@/store/profileSlice';

const { height, width } = Dimensions.get('window');

// Category sirf DB / Personal Information se aata hai – filter dialog mein nahi
export default function BottomFilterDialog({ visible, onClose }) {
  const translateY = useRef(new Animated.Value(height)).current;
  const dispatch = useDispatch();

  const reduxInterests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const reduxAge = useSelector((state: any) => state?.profileSlice?.agefilter);

  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<number[]>([18, 40]);

  const interestsList = ['Sports', 'Music', 'Travel', 'Food'];

  useEffect(() => {
    if (visible) {
      setSelectedInterest(reduxInterests?.length > 0 ? reduxInterests[0] : null);
      setAgeRange(reduxAge?.length > 0 ? reduxAge : [18, 40]);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reduxInterests, reduxAge]);

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => { if (g.dy > 0) translateY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) closeModal();
        else {
          Animated.spring(translateY, { toValue: 0, stiffness: 150, damping: 20, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  // --- Actions ---
  const Apply = () => {
    // Interests array format mein hi rakha hai (aapki requirement ke mutabiq)
    dispatch(intrestsfilter(selectedInterest ? [selectedInterest] : []));
    
    // Category ko direct STRING bheja hai
    
    dispatch(agefilter(ageRange));
    closeModal();
  };

  const Reset = () => {
    // Local State reset
    setSelectedInterest(null);
    setAgeRange([18, 40]);

    // Redux reset
    dispatch(intrestsfilter([]));
    dispatch(agefilter([18, 40]));
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Pressable style={styles.overlay} onPress={closeModal} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.dialog, { transform: [{ translateY }] }]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Filter</Text>

        {/* --- Category (String based) --- */}
        <View style={styles.row}>
         
        </View>

        {/* --- Interests (Array based logic in background) --- */}
        <Text style={[styles.label, { marginTop: 15 }]}>Interests</Text>
        <View style={styles.row}>
          {interestsList.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[styles.chip, selectedInterest === interest && { backgroundColor: Colors.primary }]}
              onPress={() => setSelectedInterest(interest === selectedInterest ? null : interest)}
            >
              <Text style={[styles.chipText, selectedInterest === interest && { color: Colors.white }]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Age Range: {ageRange[0]} - {ageRange[1]}</Text>
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <MultiSlider
              values={ageRange}
              sliderLength={width - 60}
              onValuesChange={(vals) => setAgeRange(vals)}
              min={18}
              max={60}
              step={1}
              selectedStyle={{ backgroundColor: Colors.primary }}
              markerStyle={styles.sliderMarker}
              trackStyle={{ height: 4 }}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={Reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={Apply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  dialog: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '75%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 5,
  },
  handle: { width: 40, height: 5, backgroundColor: Colors.lightgray, alignSelf: 'center', borderRadius: 10, marginBottom: 20 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20, fontFamily: Fonts.bold, color: Colors.black },
  label: { fontSize: 18, marginBottom: 12, fontFamily: Fonts.medium, color: Colors.black },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 25, marginBottom: 5 },
  chipText: { fontSize: 14, color: Colors.primary, fontFamily: Fonts.medium },
  sliderMarker: { backgroundColor: Colors.primary, height: 20, width: 20, borderWidth: 2, borderColor: Colors.white },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', paddingBottom: 20 },
  resetBtn: { backgroundColor: Colors.lightgray, padding: 15, borderRadius: 30, width: '45%', alignItems: 'center' },
  applyBtn: { backgroundColor: Colors.primary, padding: 15, borderRadius: 30, width: '45%', alignItems: 'center' },
  resetText: { color: Colors.primary, fontFamily: Fonts.bold, fontSize: 16 },
  applyText: { color: Colors.white, fontFamily: Fonts.bold, fontSize: 16 },
});