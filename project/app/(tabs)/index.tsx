import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';

import Hometop from '../../components/home/Hometop';
import Homebottom from '@/components/home/Homebottom';
import { Colors } from '@/theme/color';

import { fetchProfiles } from '@/services/Profile';
import { allprofilesFnc } from '@/store/profileSlice';
import { createaction } from '@/services/Like';
import { Fonts } from '@/theme/fonts';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const safeTop = useSafeAreaTop();

  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const allprofileSlice = useSelector((state: any) => state?.profileSlice?.allprofiles || []);
  const filterage = useSelector((state: any) => state?.profileSlice?.agefilter);
  const filterintrests = useSelector((state: any) => state?.profileSlice?.intrestesfilter);
  const filtercetagory = useSelector((state: any) => state?.profileSlice?.cetagoryfilter);
  const filterdistance = useSelector((state: any) => state?.profileSlice?.distancefilter);
  const genderfilter = useSelector((state: any) => state?.profileSlice?.genderfilter);
  const [swipelimit, setswipelimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [actionState, setActionState] = useState(null);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetchProfiles(
        profileSlice.id,
        {
          minAge: filterage?.length > 0 ? filterage[0] : 18,
          maxAge: filterage?.length > 0 ? filterage[1] : 40,
          maxDistance: filterdistance?.length > 0 ? filterdistance[1] : 100,
          genderFilter: genderfilter ?? profileSlice.gender,
          professionFilter: [profileSlice.profession],
          userInterests: filterintrests?.length > 0 ? filterintrests : profileSlice.interests,
          cetagory: filtercetagory ?? profileSlice?.cetagory,
        },
        pageNum,
      );

      if (res === 'Daily swipe limit reached.') {
        setswipelimit(res);
        dispatch(allprofilesFnc(isNewFilter ? [] : allprofileSlice));
        setHasMore(false);
        setPage(pageNum);
        setLoading(false);
        setIsFetchingNextPage(false);
        return;
      }

      if (res && res.data) {
        const newData = res.data.map((u: any) => ({
          id: u.id,
          full_name: u.full_name || 'Unknown',
          profession: u.profession || 'N/A',
          distance_km: u.distance_km ? `${u.distance_km} km away` : '0 km away',
          avatar_url: u.avatar_url || 'https://placehold.co/400x400',
        }));

        const updatedList = isNewFilter ? newData : [...allprofileSlice, ...newData];
        dispatch(allprofilesFnc(updatedList));
        setHasMore(res.metadata?.has_more ?? false);
        setPage(pageNum);
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
  }, [profileSlice?.id, filterage, filterintrests, allprofileSlice, genderfilter, filterdistance, filtercetagory]);
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
  useEffect(() => {
    if (profileSlice?.id) {
      getProfilesData(1, true);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [profileSlice?.id, filterintrests, filterage, genderfilter, filterdistance]);

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

  return (
    <View style={[styles.homeContainer, { paddingTop: safeTop }]}>
      <Hometop />
      {loading && page === 1 ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: { flex: 1, paddingHorizontal: 15, backgroundColor: Colors.background },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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