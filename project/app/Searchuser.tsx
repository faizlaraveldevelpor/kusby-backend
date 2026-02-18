import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import SettingsHeader from '@/components/setting/SettingsHeader';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import BottomFilterDialog from '@/dialog/Bottomdialog';

const cards = [
  { id: '1', name: 'Sarah', profession: 'Designer', image: require('../assets/images/user.jpg') },
  { id: '2', name: 'Emma', profession: 'Model', image: require('../assets/images/user2.jpg') },
  { id: '3', name: 'Alice', profession: 'Engineer', image: require('../assets/images/user.jpg') },
  { id: '4', name: 'John', profession: 'Developer', image: require('../assets/images/user2.jpg') },
  { id: '5', name: 'Bob', profession: 'Artist', image: require('../assets/images/user.jpg') },
  { id: '6', name: 'Sarah', profession: 'Designer', image: require('../assets/images/user.jpg') },
  { id: '7', name: 'Emma', profession: 'Model', image: require('../assets/images/user2.jpg') },
  { id: '8', name: 'Alice', profession: 'Engineer', image: require('../assets/images/user.jpg') },
  { id: '9', name: 'John', profession: 'Developer', image: require('../assets/images/user2.jpg') },
  { id: '10', name: 'Bob', profession: 'Artist', image: require('../assets/images/user.jpg') },
];

const Searchuser = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: safeTop }]}>
        <SettingsHeader title="Search" onBack={() => router.back()} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          placeholder="Search users"
          placeholderTextColor={Colors.gray}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="options-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />

      {/* ✅ SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cardsContainer}>
          {cards.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.85} onPress={()=>router.push("Yourmatch")}>
              <Image source={item.image} style={styles.image} />
              <LinearGradient
                colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]}
                style={styles.gradient}
              >
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.profession}>{item.profession}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Searchuser;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  headerWrapper: {
    paddingHorizontal: 18,
    backgroundColor: Colors.background,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  card: {
    width: '48%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    paddingHorizontal: 10,
    paddingBottom: 8,
    justifyContent: 'flex-end',
  },

  name: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  profession: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
});
