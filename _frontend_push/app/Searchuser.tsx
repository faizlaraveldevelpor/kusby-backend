import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
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
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { fetchProfiles } from '@/services/Profile';

const PLACEHOLDER_AVATAR = 'https://placehold.co/400x400';

const Searchuser = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [open, setOpen] = useState(false);
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterdistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const genderfilter = useSelector((state: any) => state?.profileSlice?.genderfilter);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (!profileSlice?.id) {
      setLoading(false);
      return;
    }
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res = await fetchProfiles(
        profileSlice.id,
        {
          minAge: filterage?.length > 0 ? filterage[0] : 18,
          maxAge: filterage?.length > 0 ? filterage[1] : 50,
          maxDistance: filterdistance?.length > 0 ? filterdistance[1] : 100,
          genderFilter: genderfilter ?? undefined,
          professionFilter: profileSlice.profession ? [profileSlice.profession] : [],
          userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests || [],
          cetagory: (profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
        },
        pageNum,
      );

      if (res?.data) {
        const list = res.data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          avatar_url: u.avatar_url || PLACEHOLDER_AVATAR,
        }));
        setUsers(prev => (isRefresh ? list : [...prev, ...list]));
        setHasMore(res.metadata?.has_more ?? false);
        setPage(pageNum);
      } else if (res === 'Daily swipe limit reached.') {
        setHasMore(false);
        if (isRefresh) setUsers([]);
      } else {
        setError('Could not load users');
        if (isRefresh) setUsers([]);
      }
    } catch (err) {
      setError('Could not load users');
      if (isRefresh) setUsers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [profileSlice?.id, filterage, filterdistance, genderfilter, filterintrests]);

  useEffect(() => {
    if (profileSlice?.id) {
      loadProfiles(1, true);
    } else {
      setLoading(false);
    }
  }, [profileSlice?.id]);

  useEffect(() => {
    if (profileSlice?.id && (filterage !== undefined || filterdistance !== undefined || genderfilter !== undefined || filterintrests !== undefined)) {
      loadProfiles(1, true);
    }
  }, [filterage, filterdistance, genderfilter, filterintrests]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadProfiles(page + 1, false);
  };

  const filteredUsers = searchText.trim()
    ? users.filter(
        u =>
          (u.full_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
          (u.profession || '').toLowerCase().includes(searchText.toLowerCase()),
      )
    : users;

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: safeTop }]}>
        <SettingsHeader title="Search" onBack={() => router.back()} />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name or profession"
          placeholderTextColor={Colors.gray}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => setOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="options-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <BottomFilterDialog visible={open} onClose={() => setOpen(false)} />

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding users...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.gray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfiles(1, true)}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const padding = 200;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - padding) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          <View style={styles.cardsContainer}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {searchText.trim() ? 'No users match your search' : 'No users in your area yet'}
                </Text>
              </View>
            ) : (
              filteredUsers.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/userdetail', params: { id: item.id } })}
                >
                  <Image source={{ uri: item.avatar_url || PLACEHOLDER_AVATAR }} style={styles.image} />
                  <LinearGradient
                    colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]}
                    style={styles.gradient}
                  >
                    <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                    <Text style={styles.profession} numberOfLines={1}>{item.profession}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>
          {loadingMore && (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
        </ScrollView>
      )}
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
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray,
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  errorText: {
    marginTop: 12,
    color: Colors.black,
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  emptyWrap: {
    flex: 1,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.gray,
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
