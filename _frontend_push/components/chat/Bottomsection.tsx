import { subscribeUnreadMessages, getCnversation } from '@/services/chat';
import { singleChatFnc, unreadedMessages } from '@/store/chat';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

type BottomsectionProps = {
  searchQuery?: string;
};

const Bottomsection = ({ searchQuery = '' }: BottomsectionProps) => {
  const profileSlice = useSelector((state: any) => state?.profileSlice?.userApi);
  const chatsSlice = useSelector((state: any) => state?.chats?.chats);
  const router = useRouter();
  const dispatch = useDispatch();

  const filteredChats = React.useMemo(() => {
    if (!searchQuery.trim()) return chatsSlice || [];
    const q = searchQuery.trim().toLowerCase();
    return (chatsSlice || []).filter(
      (item: any) =>
        (item?.other_user?.full_name || '').toLowerCase().includes(q) ||
        (item?.last_message?.content || '').toLowerCase().includes(q)
    );
  }, [chatsSlice, searchQuery]);

  // Pagination States
  const [unreaded, setunreaded] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const blockUserSlice=useSelector((state)=>state?.profileSlice?.blockUser)
  
  // 1. Fetch Logic
  const fetchChats = useCallback(async (pageNum: number) => {
    if (!profileSlice?.id || (pageNum > 0 && !hasMore) || loading) return;

    setLoading(true);
    const data = await getCnversation(profileSlice.id, pageNum, PAGE_SIZE);
    
    if (data.length < PAGE_SIZE) {
      setHasMore(false);
    }

    dispatch({ type: 'chats/setChats', payload: { data, page: pageNum } });
    setLoading(false);
  }, [profileSlice?.id, hasMore, loading]);

  // 2. Initial Load
  useEffect(() => {
    fetchChats(0);
  }, [profileSlice?.id,blockUserSlice]);

  // 3. Load More Trigger
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChats(nextPage);
    }
  };

  // 4. Realtime Subscription (Unread Messages)
  useEffect(() => {
    if (!profileSlice?.id) return;
    const unsubscribe = subscribeUnreadMessages(profileSlice.id, (unreadMessages) => {
      const unreadByConversation = unreadMessages.reduce((acc, msg) => {
        acc[msg.conversation_id] = (acc[msg.conversation_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setunreaded((prev) => {
        const updated = { ...prev, ...unreadByConversation };
        return updated;
      });
    });
    return () => { unsubscribe && unsubscribe(); };
  }, [profileSlice?.id]);
useEffect(()=>{
dispatch(unreadedMessages(unreaded))
},[unreaded])
  const ListEmpty = () => (
    !loading && filteredChats.length === 0 ? (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No chats</Text>
      </View>
    ) : null
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.conversation_id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={() => 
          loading && hasMore ? <ActivityIndicator size="small" color={Colors.primary} style={{ margin: 10 }} /> : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => {
              setunreaded((prev) => {
                const copy = { ...prev };
                delete copy[item.conversation_id];
                return copy;
              });
              dispatch(singleChatFnc({
                conversation_id: item.conversation_id,
                sender_id: profileSlice?.id,
              }));
              router.push({
                pathname:"/singlechat",
                params:{id:`${item?.other_user?.id}`}
              });
            }}
          >
            <Image source={{ uri: item?.other_user?.avatar_url }} style={styles.userImage} />
            <View style={styles.chatInfo}>
              <Text style={styles.userName}>{item?.other_user?.full_name}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.last_message?.content || "No messages yet"}
              </Text>
            </View>
            {unreaded?.[item?.conversation_id] > 0 && (
              <View style={styles.unreadContainer}>
                <Text style={styles.unreadText}>{unreaded[item.conversation_id]}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// Styles same as before...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 10 },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
  userImage: { width: 60, height: 60, borderRadius: 30 },
  chatInfo: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 16, color: Colors.black, fontFamily: Fonts.bold },
  lastMessage: { fontSize: 14, color: '#666', marginTop: 3, fontFamily: Fonts.regular },
  unreadContainer: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  unreadText: { color: '#fff', fontSize: 12, fontFamily: Fonts.bold },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: Colors.gray, fontFamily: Fonts.medium },
});

export default Bottomsection;