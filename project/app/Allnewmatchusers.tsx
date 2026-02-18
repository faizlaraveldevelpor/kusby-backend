import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import SettingsHeader from '@/components/setting/SettingsHeader';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { fetchProfiles } from '@/services/Profile';

const NewMatchPage = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ✅ Main Fetch Function with Duplicate Prevention
  const fetchData = async (pageNum: number) => {
    if (!profileSlice?.id) return;

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetchProfiles(profileSlice.id, {
        page: pageNum,
        limit: 10,
        minAge: filterage?.length > 0 ? filterage[0] : 18,
        maxAge: filterage?.length > 0 ? filterage[1] : 40,
        maxDistance: 100,
        genderFilter: profileSlice.gender,
        professionFilter: [profileSlice.profession],
        userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests,
        userLat: profileSlice.latitude,
        userLon: profileSlice.longitude,
      });

      const data = res?.data || [];
      const normalized = data.map((u: any) => ({
        id: u.id,
        full_name: u.full_name || 'Unknown',
        profession: u.profession || 'N/A',
        avatar_url: u.avatar_url || 'https://placehold.co/400x400',
        age: u.dob ? calculateAge(u.dob) : 'N/A',
      }));

      if (normalized.length === 0) {
        setHasMore(false);
      } else {
        setMatches(prev => {
          if (pageNum === 1) return normalized;

          // ✅ PREVENT DUPLICATES: Filter out items that already exist in the list
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewData = normalized.filter((item: any) => !existingIds.has(item.id));
          
          // Agar koi naya unique item nahi mila to hasMore false kar dein
          if (uniqueNewData.length === 0) setHasMore(false);
          
          return [...prev, ...uniqueNewData];
        });
      }
    } catch (error) {
      console.log('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Trigger on filters or initial load
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [profileSlice?.id, filterintrests, filterage]);

  // ✅ Optimized handleLoadMore
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push("Yourmatch")}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.image} />
      <LinearGradient colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]} style={styles.gradient}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.profession}>
          {item.profession}, {item.age}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 30 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No matches found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: safeTop }]}>
        <View style={styles.headerRow}>
          <SettingsHeader title="New Match" onBack={() => router.back()} />
          <TouchableOpacity onPress={() => router.push('Searchuser')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="search-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5} // Increased threshold to avoid aggressive calls
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true} // Performance optimization
        />
      )}
    </View>
  );
};

export default NewMatchPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerWrapper: {
    paddingHorizontal: 18,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', height: 180, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: 60, paddingHorizontal: 10, paddingBottom: 8, justifyContent: 'flex-end' },
  name: { color: Colors.white, fontSize: 14, fontFamily: Fonts.bold },
  profession: { color: Colors.white, fontSize: 12, fontFamily: Fonts.regular },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: Fonts.regular, color: '#888' }
});