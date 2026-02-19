import React, { useEffect, useState } from 'react';
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
import { getUserMatches } from '@/services/Matches';

const YourMatchPage = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0); // 0-based index for Supabase range
  const [hasMore, setHasMore] = useState<boolean>(true);

  // ✅ Fixed Fetch Logic with Pagination Parameters
  const fetchMatches = async (pageNum: number) => {
    if (!profileSlice?.id) return;

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      // Pass pageNum and PageSize (10) to the API
      const res = await getUserMatches(profileSlice?.id, pageNum, 10);
      const data = res || [];

      // Agar data PAGE_SIZE se kam hai, toh mazeed data nahi hai
      if (data.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setMatches((prev) => {
        // Agar pehla page hai, toh data replace karein
        if (pageNum === 0) return data;

        // Duplicate prevention (Safe side)
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewItems = data.filter((item: any) => !existingIds.has(item.id));

        return [...prev, ...uniqueNewItems]; // Naya data append karein
      });
    } catch (error) {
      console.log('Error fetching matches:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial Load (Page 0)
  useEffect(() => {
    fetchMatches(0);
  }, [profileSlice?.id]);

  // ✅ Load More Trigger
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMatches(nextPage);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push({
        pathname: "/userdetail",
        params: { id: item.id }
      })}
    >
      <Image source={{ uri: item.avatar_url || 'https://placehold.co/400x400' }} style={styles.image} />
      <LinearGradient
        colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]}
        style={styles.gradient}
      >
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.profession}>{item.profession || 'N/A'}</Text>
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
      <Ionicons name="heart-dislike-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>No matches found yet</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: safeTop }]}>
        <View style={styles.headerRow}>
          <SettingsHeader title="Your Match" onBack={() => router.back()} />
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
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default YourMatchPage;

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
  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', height: 180, borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: 70, paddingHorizontal: 10, paddingBottom: 8, justifyContent: 'flex-end' },
  name: { color: Colors.white, fontSize: 14, fontFamily: Fonts.bold },
  profession: { color: Colors.white, fontSize: 11, fontFamily: Fonts.regular },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 150 },
  emptyText: { fontFamily: Fonts.regular, color: '#888', marginTop: 10, fontSize: 16 },
});