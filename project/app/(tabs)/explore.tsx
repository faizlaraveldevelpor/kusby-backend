import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import TabHeader from '@/components/tabs/TabHeader';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { AntDesign, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchWhoLikedMe } from '@/services/Like';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const safeTop = useSafeAreaTop();
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const isPremium = profileSlice?.is_vip;

  // --- States ---
  const [likesData, setLikesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [errorLikes, setErrorLikes] = useState<string | null>(null);

  const getFriendlyErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (/network|fetch|connection|timeout|internet/i.test(msg)) {
      return "We couldn't load your likes. Check your connection and try again.";
    }
    return "Something went wrong. Please try again in a moment.";
  };

  // --- API Call with Pagination ---
  const loadLikes = async (pageNum: number, isRefresh: boolean = false) => {
    if (!profileSlice?.id) return;

    if (isRefresh) setErrorLikes(null);
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetchWhoLikedMe(profileSlice.id, pageNum, 10);
      const newItems = response?.data || [];
      const metadata = response?.metadata;

      setTotalCount(metadata?.total_records || 0);
      setHasMore(metadata?.has_more ?? false);

      if (isRefresh) {
        setLikesData(newItems);
      } else {
        setLikesData(prev => [...prev, ...newItems]);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
      if (isRefresh) {
        setErrorLikes(getFriendlyErrorMessage(error));
        setLikesData([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadLikes(1, true);
  }, [profileSlice?.id]);

  // --- Load More Function ---
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadLikes(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 100 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={48} color={Colors.gray} />
      <Text style={styles.errorText}>{errorLikes}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadLikes(1, true)} activeOpacity={0.8}>
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={48} color={Colors.gray} />
      <Text style={styles.emptyTitle}>No likes yet</Text>
      <Text style={styles.emptySubtext}>
        Keep swiping on the Home tab — when someone likes you, they'll show up here!
      </Text>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Image 
          source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
          blurRadius={isPremium ? 0 : 15} 
        />
        {!isPremium && (
          <View style={styles.lockOverlay}>
            <MaterialCommunityIcons name="lock" size={20} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>
          {isPremium ? item.full_name : "*******"}
        </Text>
        <View style={styles.badgeRow}>
          {item.interaction_type === 'superlike' ? (
            <View style={[styles.badge, { backgroundColor: Colors.softPink + '30' }]}>
              <FontAwesome name="star" size={12} color={Colors.softPink} />
              <Text style={[styles.badgeText, { color: Colors.softPink }]}>Super Liked</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: Colors.green + '30' }]}>
              <AntDesign name="heart" size={12} color={Colors.green} />
              <Text style={[styles.badgeText, { color: Colors.green }]}>Liked you</Text>
            </View>
          )}
        </View>
      </View>

      {isPremium && (
        <TouchableOpacity style={styles.chatBtn}>
          <AntDesign name="message" size={20} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <TabHeader
        title="Explore"
        rightContent={
          <TouchableOpacity onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />
      <BottomFilterDialog visible={filterOpen} onClose={() => setFilterOpen(false)} />

      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : errorLikes ? (
        renderErrorState()
      ) : (
        <FlatList
          data={likesData}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {!isPremium && !loading && !errorLikes && (
        <LinearGradient
          colors={['transparent', Colors.wine + 'E6', Colors.background]}
          style={styles.upgradeOverlay}
        >
          <MaterialCommunityIcons name="crown" size={50} color={Colors.lightPink} />
          <Text style={styles.upgradeTitle}>Unlock {totalCount} Likes!</Text>
          <Text style={styles.upgradeDesc}>
            Upgrade to Premium to see everyone who swiped right on you.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={()=>router.push("/Getvip")}>
            <Text style={styles.upgradeBtnText}>Get Premium</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
}

// ... Styles (vahi same jo aapne use kiye thay)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  list: { paddingBottom: 10 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.black,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.black,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.gray,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.darkPlum, 
    padding: 12, 
    borderRadius: 22, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.wine
  },
  avatar: { width: 65, height: 65, borderRadius: 32.5 },
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background + '33',
    borderRadius: 32.5
  },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontFamily: Fonts.medium, color: Colors.white },
  badgeRow: { flexDirection: 'row', marginTop: 5 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 5 },
  badgeText: { fontSize: 11, fontFamily: Fonts.regular },
  chatBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  upgradeOverlay: {
    position: 'absolute',
    bottom: 0,
    width: width,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  upgradeTitle: { color: Colors.white, fontSize: 22, fontFamily: Fonts.bold, marginTop: 10 },
  upgradeDesc: { color: Colors.softPink, textAlign: 'center', marginTop: 8, fontSize: 14, fontFamily: Fonts.regular },
  upgradeBtn: { 
    backgroundColor: Colors.lightPink, 
    paddingHorizontal: 40, 
    paddingVertical: 15, 
    borderRadius: 30, 
    marginTop: 20,
    elevation: 5
  },
  upgradeBtnText: { color: Colors.primaryDarker, fontFamily: Fonts.bold, fontSize: 16 }
});