import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';

import Hometop from '../../components/home/Hometop';
import Homebottom from '@/components/home/Homebottom';
import { Colors } from '@/theme/color';

import { fetchProfiles, getMyProfile } from '@/services/Profile';
import { allprofilesFnc, GetprofileApi, cetagory, setProfilesMetadata } from '@/store/profileSlice';
import { createaction } from '@/services/Like';
import { Fonts } from '@/theme/fonts';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const safeTop = useSafeAreaTop();

  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const categoryFromRedux = useSelector((state: any) => state?.profileSlice?.cetagory);
  const allprofileSlice = useSelector((state: any) => state?.profileSlice?.allprofiles || []);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filterdistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const genderfilter = useSelector((state: any) => state?.profileSlice?.genderfilter);
  const [swipelimit, setswipelimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [actionState, setActionState] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const allprofileSliceRef = useRef(allprofileSlice);
  useEffect(() => {
    allprofileSliceRef.current = allprofileSlice;
  }, [allprofileSlice]);

  const getProfilesData = useCallback(async (pageNum: number, isNewFilter: boolean = false) => {
    if (!profileSlice?.id) {
      setLoading(false);
      setIsFetchingNextPage(false);
      setError(null);
      return;
    }

    setError(null);
    if (pageNum === 1) setLoading(true);
    else setIsFetchingNextPage(true);

    try {
      const interests = (filterintrests?.length ? filterintrests : profileSlice.interests) || [];
      const res = await fetchProfiles(
        profileSlice.id,
        {
          minAge: filterage?.length > 0 ? filterage[0] : 18,
          maxAge: filterage?.length > 0 ? filterage[1] : 40,
          maxDistance: filterdistance?.length > 0 ? filterdistance[1] : 100,
          genderFilter:profileSlice.gender ?? undefined,
          professionFilter: [], // Home pe sab professions dikhane ke liye
          userInterests: Array.isArray(interests) ? interests : [],
          // Pehle Redux cetagory (Settings se update), phir userApi – taake kisi page se Home aane par bhi updated category jaye
          cetagory: (categoryFromRedux ?? profileSlice?.cetagory ?? profileSlice?.category)?.trim() || undefined,
        },
        pageNum,
      );

      if (res?.message === 'Daily swipe limit reached.') {
        setswipelimit(res.message);
        dispatch(allprofilesFnc(isNewFilter ? [] : allprofileSliceRef.current));
        setHasMore(false);
        setPage(pageNum);
        setLoading(false);
        setIsFetchingNextPage(false);
        return;
      }

      if (res && Array.isArray(res.data)) {
        const newData = res.data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          distance_km: u.distance_km ? `${u.distance_km} km away` : '0 km away',
          avatar_url: u.avatar_url || 'https://placehold.co/400x400',
        }));

        const updatedList = isNewFilter ? newData : [...allprofileSliceRef.current, ...newData];
        dispatch(allprofilesFnc(updatedList));
        if (res.metadata) dispatch(setProfilesMetadata(res.metadata));
        setHasMore(res.metadata?.has_more ?? false);
        setPage(pageNum);

        if (pageNum === 1 && isNewFilter) {
          try {
            const myProfileRes = await getMyProfile();
            if (myProfileRes?.data) {
              dispatch(GetprofileApi(myProfileRes.data));
              const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
              if (cat != null && cat !== '') dispatch(cetagory(cat));
            }
          } catch (_) {}
        }
      } else {
        setError('default');
      }
    } catch (err: any) {
      console.log('API Error:', err);
      setError(err?.message || 'default');
      if (pageNum === 1) {
        dispatch(allprofilesFnc([]));
      }
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [profileSlice?.id, categoryFromRedux, filterage, filterintrests, genderfilter, filterdistance]);

  useEffect(() => {
    console.log(actionState);
    
    const sendInteraction = async () => {
      // Check karein ke actionState null na ho aur usme data ho
      if (actionState && actionState.currentUserId && actionState.type) {
        try {
          console.log(`Sending ${actionState.type} for user: ${actionState.currentUserId}`);
          const response = await createaction(actionState); 
          console.log("Action API Response Success:", response);
        } catch (err) {
          console.error("Action API Error:", err);
        }
      }
    };

    sendInteraction();
  }, [actionState]); // Jab bhi swipe action hoga, ye trigger hoga
  // categoryFromRedux use – Settings update ke baad bhi refetch sahi category se ho
  const filterKey = `${profileSlice?.id ?? ""}|${categoryFromRedux ?? ""}|${(filterage ?? []).join("-")}|${(filterdistance ?? []).join("-")}|${genderfilter ?? ""}|${(filterintrests ?? []).join(",")}`;

  useEffect(() => {
    if (profileSlice?.id) {
      getProfilesData(1, true);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [profileSlice?.id, filterKey]);

  // Jab Home tab focus ho: pehle DB se profile + category Redux mein sync karo, taake rerender par updated category use ho
  useFocusEffect(
    useCallback(() => {
      if (!profileSlice?.id) return;
      let cancelled = false;
      (async () => {
        try {
          const myProfileRes = await getMyProfile();
          if (cancelled) return;
          if (myProfileRes?.data) {
            dispatch(GetprofileApi(myProfileRes.data));
            const cat = myProfileRes.data.cetagory ?? myProfileRes.data.category;
            if (cat != null && cat !== '') dispatch(cetagory(cat));
          }
        } catch (_) {}
      })();
      return () => { cancelled = true; };
    }, [profileSlice?.id, dispatch])
  );

  const handleLoadMore = () => {
    if (isFetchingNextPage) return;
    const nextPage = page + 1;
    getProfilesData(nextPage, false);
  };

  // ✅ Yeh function swiped users ko Redux se remove karega
  const handleRemoveUserFromRedux = useCallback((userId: number) => {
    const filteredList = allprofileSlice.filter((user: any) => user.id !== userId);
    dispatch(allprofilesFnc(filteredList));
    
  }, [allprofileSlice]);

  

  const handleRetry = useCallback(() => {
    setError(null);
    getProfilesData(1, true);
  }, [getProfilesData]);

  const onRefresh = useCallback(async () => {
    if (!profileSlice?.id) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    try {
      await getProfilesData(1, true);
    } finally {
      setRefreshing(false);
    }
  }, [profileSlice?.id, getProfilesData]);

  const waitingForProfile = !profileSlice?.id && !error;

  const canRefresh = !waitingForProfile;
  const refreshControl = canRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Colors.primary]}
      tintColor={Colors.primary}
    />
  ) : undefined;

  return (
    <View style={[styles.homeContainer, { paddingTop: safeTop }]}>
      <Hometop />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {waitingForProfile ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        ) : loading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Finding matches...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>We couldn't load your matches</Text>
            <Text style={styles.errorText}>
              Check your connection and try again—we'll find someone great for you.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : swipelimit === 'Daily swipe limit reached.' ? (
          <View style={styles.swipeLimitContainer}>
            <Text style={styles.swipeLimitText}>{swipelimit}</Text>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <Homebottom
              allusers={allprofileSlice}
              profileSlice={profileSlice}
              setActionState={setActionState}
              actionState={actionState}
              onLoadMore={handleLoadMore}
              isFetching={isFetchingNextPage}
              hasMore={hasMore}
              removeUser={handleRemoveUserFromRedux}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: { flex: 1, paddingHorizontal: 15, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, minHeight: '100%' },
  loaderContainer: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: Colors.white, fontSize: 14 },
  contentWrapper: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  errorTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: Colors.lightgray,
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  swipeLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  swipeLimitText: {
    color: Colors.black,
    fontFamily: Fonts.bold,
  },
});