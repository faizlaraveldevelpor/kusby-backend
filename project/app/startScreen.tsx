import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import { Colors } from '@/theme/color';
import { useRouter } from 'expo-router';
import { Fonts } from '@/theme/fonts';
import { supabase } from '@/lib/supabase';
import { userlogininfo } from '@/store/profileSlice';
import { useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

export default function StartScreen() {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // --- OTP Bhejne ka Function ---
  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+92${phoneNumber}`;
      console.log(formattedPhone);
      
      // 1. Number se Profile search karke Auth ID nikalna
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, adminblock")
        .eq("phone", formattedPhone) // Ensure column name is correct
        .maybeSingle();

      // 2. Agar Profile (Auth ID) mil jaye, to conditions check karein
      if (profile) {
        const authId = profile.id; // Yeh aapki Auth ID hai

        // A: Check Admin Block
        if (profile.adminblock === true) {
          alert("Your account has been blocked by admin.");
          setLoading(false);
          return;
        }

        // B: Check Reports table using Auth ID
        const { data: report } = await supabase
          .from("reports")
          .select("status")
          .eq("reported_id", authId)
          .eq("status", true)
          .maybeSingle();

        if (report) {
          alert("Your account is suspended due to reports.");
          setLoading(false);
          return;
        }
      }

      // 3. Agar user blocked nahi hai, to OTP bhejein
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpError) throw otpError;

      dispatch(userlogininfo({ number: formattedPhone }));
      
      // Verify page par move karein
      router.push({
        pathname: "/signupsteps/Verifynumber", 
        params: { phone: formattedPhone }
      });
      
    } catch (error: any) {
      // 'invalid from number' error ke liye Supabase dashboard ki settings check karein
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Fixed header – does not scroll */}
      <LinearGradient
        colors={[Colors.background, Colors.darkPlum, Colors.wine]}
        style={[styles.hero, { paddingTop: safeTop }]}
      >
        <View style={styles.brandBlock}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Kubsy</Text>
          <Text style={styles.tagline}>Meet, Match, Kubsy</Text>
        </View>

        <View style={styles.featurePills}>
          <View style={styles.pill}>
            <AntDesign name="heart" size={14} color={Colors.lightPink} />
            <Text style={styles.pillText}>Real connections</Text>
          </View>
          <View style={styles.pill}>
            <MaterialCommunityIcons name="hand-heart" size={14} color={Colors.lightPink} />
            <Text style={styles.pillText}>Swipe & match</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.lightPink} />
            <Text style={styles.pillText}>Safe & private</Text>
          </View>
        </View>

        <Text style={styles.socialProof}>Join people finding meaningful connections</Text>
      </LinearGradient>

      {/* Scrollable form only – header stays fixed */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.formSubtext}>Enter your number to continue</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={22} color={Colors.softPink} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone number (e.g. 3034164509)"
              placeholderTextColor={Colors.gray}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text.replace(/^0+/, ''))}
              maxLength={11}
            />
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, loading && { opacity: 0.8 }]} 
            onPress={handleSendOtp}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Sending code…' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <View style={styles.trustRow}>
            <Ionicons name="lock-closed" size={14} color={Colors.gray} />
            <Text style={styles.trustText}>Your number is never shared with other users</Text>
          </View>

          
        </View>
      </ScrollView>

      {/* Fixed at bottom of screen */}
      <View style={styles.footerLegalWrap}>
        <Text style={styles.footerLegal}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  hero: {
    width,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontFamily: Fonts.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 17,
    fontFamily: Fonts.medium,
    color: Colors.softPink,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.wine + '50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.lightPink,
  },
  socialProof: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.softPink,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.95,
  },
  formCard: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  formSubtext: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkPlum,
    borderWidth: 1.5,
    borderColor: Colors.wine,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
    fontFamily: Fonts.regular,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  trustText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray,
  },
  signupLinkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  signupText: {
    color: Colors.gray,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  footerLegalWrap: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.wine + '40',
  },
  footerLegal: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 16,
  },
});