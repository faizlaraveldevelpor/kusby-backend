import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Animated, PanResponder, Dimensions, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AntDesign, FontAwesome, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme/color';
import { useRouter } from 'expo-router';
import { Fonts } from '@/theme/fonts';

const { width, height } = Dimensions.get('window');
const SWIPE_X_THRESHOLD = width * 0.3;
const SWIPE_Y_THRESHOLD = height * 0.25;

interface HomebottomProps {
  allusers: any[];
  profileSlice: { id: number };
  setActionState: (state: any) => void;
  actionState: any;
  onLoadMore: () => void;
  hasMore: boolean;
  isFetching: boolean; // Add this to show loader inside button area
  removeUser: (id: number) => void; // IMPORTANT: Redux se delete karne ke liye
}

const Homebottom: React.FC<HomebottomProps> = ({ 
  allusers, 
  profileSlice, 
  setActionState, 
  actionState, 
  onLoadMore, 
  hasMore,
  isFetching,
  removeUser
}) => {
  const router = useRouter();
  const [users, setUsers] = useState(allusers);
  const [animating, setAnimating] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const loadMoreRequested = useRef(false);

  // Sync with Redux data
  useEffect(() => {
    setUsers(allusers);
    if (allusers.length > 0) loadMoreRequested.current = false;
  }, [allusers]);

  // Load more – sirf ek baar jab list khali ho (sab swipe ho gaye) aur hasMore ho
  useEffect(() => {
    if (users.length === 0 && hasMore && !isFetching && !loadMoreRequested.current) {
      loadMoreRequested.current = true;
      onLoadMore();
    }
  }, [users.length, hasMore, isFetching]);

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const animateOut = (x: number, y: number, action: "like" | "dislike" | "superlike") => {
    const currentCard = users[0];
    if (animating || !currentCard) return;

    setAnimating(true);
    setActionState({
      type: action,
      loginUserId: profileSlice.id,
      currentUserId: currentCard.id,
    });

    Animated.timing(position, {
      toValue: { x, y },
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      // ✅ Sabse Pehle Redux se remove karo taake pagination mein dubara na aaye
      removeUser(currentCard.id);
      
      // ✅ Phir local state update karo
      setUsers(prev => prev.slice(1));
      setActionState(null);
      
      requestAnimationFrame(() => {
        position.setValue({ x: 0, y: 0 });
        setAnimating(false);
      });
    });
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !animating,
    onMoveShouldSetPanResponder: () => !animating,
    onPanResponderMove: (_, gesture) => {
      if (animating) return;
      position.setValue({ x: gesture.dx, y: Math.min(gesture.dy, 150) });
    },
    onPanResponderRelease: (_, g) => {
      if (animating) return;
      if (g.dx > SWIPE_X_THRESHOLD) animateOut(width * 1.5, g.dy, "like");
      else if (g.dx < -SWIPE_X_THRESHOLD) animateOut(-width * 1.5, g.dy, "dislike");
      else if (g.dy < -SWIPE_Y_THRESHOLD) animateOut(0, -height, "superlike");
      else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      }
    },
  }), [users, animating]);

  const handleFollowToggle = () => {
    const currentCard = users[0];
    if (!currentCard) return;
    const isCurrentlyFollowed = currentCard.isFollowed;
    setUsers(prev => prev.map((user, index) =>
      index === 0 ? { ...user, isFollowed: !user.isFollowed } : user
    ));
    setActionState({
      type: isCurrentlyFollowed ? "unfollow" : "follow",
      loginUserId: profileSlice.id,
      currentUserId: currentCard.id,
    });
    setTimeout(() => setActionState(null), 1000);
  };

  // ✅ Loader and No Data State
  if (users.length === 0) return (
    <View style={styles.center}>
      {isFetching ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <>
          <Text style={styles.endText}>No more profiles</Text>
          
        </>
      )}
    </View>
  );

  const currentUser = users[0];
  const nextUser = users[1];

  return (
    <View style={styles.container}>
      {nextUser && (
        <View key={`next-${nextUser.id}`} style={[styles.card, { zIndex: 0 }]}>
          <Image source={{ uri: nextUser.avatar_url }} style={styles.image} />
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} style={styles.gradient}>
             <View style={styles.info}>
                <View>
                  <Text style={styles.name}>{nextUser.full_name}</Text>
                  <Text style={styles.profession}>{nextUser.profession}</Text>
                </View>
                <View style={styles.row}>
                  <Entypo name="location-pin" size={18} color="#fff" />
                  <Text style={styles.distance}>{nextUser.distance_km} km</Text>
                </View>
             </View>
          </LinearGradient>
        </View>
      )}

      {currentUser && (
        <Animated.View
          key={currentUser.id}
          {...panResponder.panHandlers}
          style={[styles.card, { zIndex: 1, transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] }]}
        >
          {actionState?.currentUserId === currentUser.id && actionState.type === "like" && <Text style={styles.likeText}>LIKE</Text>}
          {actionState?.currentUserId === currentUser.id && actionState.type === "dislike" && <Text style={styles.rejectText}>REJECT</Text>}
          {actionState?.currentUserId === currentUser.id && actionState.type === "superlike" && <Text style={styles.superLikeText}>SUPER LIKE</Text>}

          <Image source={{ uri: currentUser.avatar_url }} style={styles.image} />

          <LinearGradient colors={[Colors.gradiantsColo1, Colors.gradiantsColo2]} style={styles.gradient}>
            <View style={styles.info}>
              <View>
                <Text style={styles.name}>{currentUser.full_name}</Text>
                <Text style={styles.profession}>{currentUser.profession}</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.row}>
                  <Entypo name="location-pin" size={18} color="#fff" />
                  <Text style={styles.distance}>{currentUser.distance_km} km</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('userdetail')}>
                  <Entypo name="dots-three-vertical" size={20} color="#fff" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.iconBtn, styles.reject]} onPress={() => animateOut(-width * 1.5, 0, "dislike")}>
          <AntDesign name="close" size={28} color={Colors.accent} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.superLike]} onPress={() => animateOut(0, -height, "superlike")}>
          <FontAwesome name="star" size={26} color={Colors.softPink} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.accept]} onPress={() => animateOut(width * 1.5, 0, "like")}>
          <AntDesign name="heart" size={28} color={Colors.green} />
        </TouchableOpacity>
      
      </View>
    </View>
  );
};



export default Homebottom;
// ... Styles remains the same as your code ...

const styles = StyleSheet.create({
  container: { height: '80%' },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  image: { width: '100%', height: '100%', position: 'relative' },
  actions: {
    position: 'fixed',
    bottom: '-95%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 10,
  },
  iconBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  reject: { borderColor: Colors.accent, borderWidth: 2 },
  superLike: { borderColor: Colors.softPink, borderWidth: 2 },
  accept: { borderColor: Colors.green, borderWidth: 2 },
  follow: { borderColor: Colors.primary, borderWidth: 2 },
  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { color: Colors.white, fontSize: 22, fontFamily: Fonts.medium },
  profession: { color: Colors.white, fontSize: 16, fontFamily: Fonts.regular },
  distance: { color: Colors.white, fontSize: 16, fontFamily: Fonts.regular },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  endText: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.black },
  likeText: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 10,
    top: 50,
    left: 20,
    color: Colors.green,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: Fonts.bold,
  },
  rejectText: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 10,
    top: 50,
    right: 20,
    color: Colors.accent,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: Fonts.bold,
  },
  superLikeText: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 10,
    top: height / 4,
    alignSelf: 'center',
    color: Colors.softPink,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: Fonts.bold,
  },
  followText: {
    position: 'absolute',
    fontSize: 32,
    zIndex: 15,
    top: 50,
    alignSelf: 'center',
    color: Colors.primary,
    textShadowColor: Colors.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    fontFamily: Fonts.bold,
  },
});
