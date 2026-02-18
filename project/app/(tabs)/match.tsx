import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import TabHeader from '@/components/tabs/TabHeader';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { getUserMatches } from '@/services/Matches';
import { useDispatch, useSelector } from 'react-redux';
import { allprofilesFnc } from '@/store/profileSlice';
import { fetchProfiles } from '@/services/Profile';

// ✅ Helper function to calculate age from DOB
const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const FavoritesScreen = () => {
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const allprofileSlice = useSelector((state: any) => state?.profileSlice?.allprofiles);

  const [matches, setMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const [errorNewMatch, setErrorNewMatch] = useState<string | null>(null);
  const [errorYourMatch, setErrorYourMatch] = useState<string | null>(null);

  const dispatch = useDispatch();
  const router = useRouter();

  const getFriendlyErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (/network|fetch|connection|timeout|internet/i.test(msg)) {
      return "We couldn't load this. Check your connection and try again.";
    }
    return "Something went wrong. Please try again in a moment.";
  };

  const fetchNewMatchProfiles = () => {
    if (!profileSlice?.id) return;
    setLoadingProfiles(true);
    setErrorNewMatch(null);
    fetchProfiles(profileSlice.id, {
      minAge: filterage?.length > 0 ? filterage[0] : 18,
      maxAge: filterage?.length > 0 ? filterage[1] : 40,
      maxDistance: 100,
      genderFilter: profileSlice.gender,
      professionFilter: [profileSlice.profession],
      userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests,
      userLat: profileSlice.latitude,
      userLon: profileSlice.longitude,
    })
      .then((res) => {
        const data = res?.data || [];
        const normalized = data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          distance_km: u.distance_km ? `${u.distance_km} km away` : 'N/A',
          avatar_url: u.avatar_url || 'https://placehold.co/400x400',
          dob: u.dob,
        }));
        dispatch(allprofilesFnc(normalized));
      })
      .catch((err) => {
        setErrorNewMatch(getFriendlyErrorMessage(err));
        dispatch(allprofilesFnc([]));
      })
      .finally(() => setLoadingProfiles(false));
  };

  const fetchYourMatches = async () => {
    if (!profileSlice?.id) return;
    setLoadingMatches(true);
    setErrorYourMatch(null);
    try {
      const yourMatch = await getUserMatches(profileSlice.id);
      const formattedMatches = (yourMatch || []).slice(0, 3).map((m: any) => ({
        ...m,
        age: m.dob ? calculateAge(m.dob) : 'N/A',
      }));
      setMatches(formattedMatches);
    } catch (error) {
      setErrorYourMatch(getFriendlyErrorMessage(error));
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchNewMatchProfiles();
  }, [profileSlice?.id, filterintrests, filterage]);

  useEffect(() => {
    fetchYourMatches();
  }, [profileSlice?.id]);

  const renderEmptyState = (message: string, subtext?: string) => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={44} color={Colors.gray} />
      <Text style={styles.emptyText}>{message}</Text>
      {subtext ? <Text style={styles.emptySubtext}>{subtext}</Text> : null}
    </View>
  );

  const renderErrorState = (message: string, onRetry: () => void) => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={44} color={Colors.gray} />
      <Text style={styles.errorText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMatch = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push("userdetail")}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.image} />
      <LinearGradient
        colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]}
        style={styles.gradient}
      >
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.profession}>{item.profession}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderMatch2 = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push("userdetail")}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.image2} />
      <Text style={styles.name2}>
        {item.full_name}, {item.age}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TabHeader
          title="Matches"
          rightContent={
            <>
              
              <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => setOpen(true)}>
                <Ionicons name="options-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />
            </>
          }
        />

        {/* NEW MATCH */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Match</Text>
          <TouchableOpacity onPress={() => router.push("Allnewmatchusers")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingProfiles ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : errorNewMatch ? (
          renderErrorState(errorNewMatch, fetchNewMatchProfiles)
        ) : allprofileSlice && allprofileSlice.length > 0 ? (
          <FlatList
            data={allprofileSlice}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMatch}
          />
        ) : (
          renderEmptyState(
            "No new profiles in your area yet",
            "Try adjusting your filters or check back later."
          )
        )}

        {/* YOUR MATCH */}
        <View style={styles.sectionHeader2}>
          <Text style={styles.sectionTitle2}>Your Match</Text>
          <TouchableOpacity onPress={() => router.push("Allyourmatch")}>
            <Text style={styles.seeAll2}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingMatches ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : errorYourMatch ? (
          renderErrorState(errorYourMatch, fetchYourMatches)
        ) : matches && matches.length > 0 ? (
          <FlatList
            data={matches}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMatch2}
          />
        ) : (
          renderEmptyState(
            "You don't have any matches yet",
            "Keep swiping on the Home tab — your matches will show up here!"
          )
        )}
        
        {/* Extra space at bottom for scrolling */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { color: Colors.black, fontSize: 18, fontFamily: Fonts.bold },
  seeAll: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bold },
  card: { marginRight: 14, width: 170 },
  image: { width: '100%', height: 230, borderRadius: 16 },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: 130, paddingHorizontal: 10, paddingBottom: 8, justifyContent: 'flex-end', borderRadius: 16 },
  name: { color: Colors.white, fontSize: 14, marginTop: 6, textAlign: 'left', fontFamily: Fonts.bold },
  profession: { color: Colors.white, fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  sectionHeader2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle2: { color: Colors.black, fontSize: 18, fontFamily: Fonts.bold },
  seeAll2: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bold },
  image2: { width: 140, height: 180, borderRadius: 18 },
  name2: { color: Colors.black, fontSize: 14, marginTop: 6, textAlign: 'center', fontFamily: Fonts.bold },
  
  // ✅ New Styles for Loader and Empty State
  loaderContainer: { height: 180, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.black,
    fontFamily: Fonts.medium,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.gray,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  errorContainer: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
});

export default FavoritesScreen;