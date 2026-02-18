import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import TabHeader from '@/components/tabs/TabHeader';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip === true;

  return (
    <View style={styles.screen}>
      <View style={[styles.headerWrapper, { paddingTop: safeTop }]}>
        <TabHeader
          title="Profile"
          // rightContent={
          //   <TouchableOpacity onPress={() => router.push('/setting/Settings')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          //     <Ionicons name="settings-outline" size={24} color={Colors.primary} />
          //   </TouchableOpacity>
          // }
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* User Image Section */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={() => router.push("Loginuserdetails")} style={styles.imageWrapper}>
          <Image
            source={{ uri: profileSlice?.avatar_url || "https://www.gravatar.com/avatar/0?d=mp" }}
            style={[styles.profileImage, isPremium && styles.premiumBorder]}
          />
          {isPremium && (
            <View style={styles.badgeIcon}>
              <MaterialIcons name="verified" size={22} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.userName, { color: Colors.black }]}>
          {profileSlice?.name || "User"}
        </Text>
      </View>

      {/* VIP Card - same colors as Settings subscription card */}
      <View style={styles.vipCard}>
        <View style={styles.vipContent}>
          <Text style={styles.vipTitle}>
            {isPremium ? "VIP Membership Active" : "Enjoy all benefits"}
          </Text>
          <Text style={styles.vipDescription}>
            {isPremium ? "Your premium features are unlocked" : "Get unlimited access to premium features."}
          </Text>
          {!isPremium && (
            <TouchableOpacity style={styles.vipButton} onPress={() => router.push("Getvip")}>
              <Text style={styles.vipButtonText}>Get VIP</Text>
            </TouchableOpacity>
          )}
        </View>
        <FontAwesome5 name="crown" size={70} color={Colors.white} />
      </View>

      {/* Options List - icon wrappers match Settings for consistency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/setting/Parsnalinformation")}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.lightPink + '40' }]}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: Colors.black }]}>Edit Profile</Text>
          </View>
          <Entypo name="chevron-right" size={22} color={Colors.gray} />
        </TouchableOpacity>
        {isPremium && (
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/setting/Premiumamanagement")}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '35' }]}>
                <FontAwesome5 name="crown" size={20} color={Colors.white} />
              </View>
              <Text style={[styles.settingText, { color: Colors.black }]}>Manage Subscription</Text>
            </View>
            <Entypo name="chevron-right" size={22} color={Colors.gray} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/setting/DiscoverySettings")}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.softPink + '30' }]}>
              <Ionicons name="options-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: Colors.black }]}>Discovery Preferences</Text>
          </View>
          <Entypo name="chevron-right" size={22} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Safety</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/setting/BlockedUsers")}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '25' }]}>
              <Ionicons name="ban-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: Colors.black }]}>Blocked Users</Text>
          </View>
          <Entypo name="chevron-right" size={22} color={Colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/setting/Privacypolicy")}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.accent + '25' }]}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.accent} />
            </View>
            <Text style={[styles.settingText, { color: Colors.black }]}>Privacy Policy</Text>
          </View>
          <Entypo name="chevron-right" size={22} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem} onPress={async () => {
          await supabase.auth.signOut();
          router.replace("/startScreen");
        }}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: Colors.primary + '25' }]}>
              <Ionicons name="log-out-outline" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: Colors.primary }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />

      </ScrollView>
    </View>
  );
}

// Static Styles (Jo colors par depend nahi karte)
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  headerWrapper: { paddingHorizontal: 16, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  profileImageContainer: { alignItems: 'center', marginVertical: 25 },
  imageWrapper: { position: 'relative' },
  profileImage: { width: 110, height: 110, borderRadius: 55 },
  premiumBorder: { borderWidth: 3, borderColor: Colors.lightPink },
  badgeIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: Colors.white, borderRadius: 12 },
  userName: { marginTop: 12, fontSize: 18, fontFamily: Fonts.bold },
  vipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 18, padding: 18, marginBottom: 30 },
  vipContent: { flex: 1 },
  vipTitle: { fontSize: 18, color: Colors.white, marginBottom: 6, fontFamily: Fonts.bold },
  vipDescription: { fontSize: 14, color: Colors.white, marginBottom: 14, fontFamily: Fonts.regular },
  vipButton: { alignSelf: 'flex-start', backgroundColor: Colors.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  vipButtonText: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.medium },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.gray,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  settingText: { fontSize: 15, fontFamily: Fonts.regular },
});