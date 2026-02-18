import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaTop } from "@/hooks/useSafeAreaTop";
import SettingsHeader from "@/components/setting/SettingsHeader";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";
import { getBlockedUsersData, unblockProfile } from "@/services/Profile";
import { useSelector } from "react-redux";

const BlockedUsers = () => {
  const router = useRouter();
  const safeTop = useSafeAreaTop();
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Specific user unblock loader

  const profileSlice = useSelector(
    (state: any) => state?.profileSlice?.userApi
  );

  useEffect(() => {
    if (profileSlice?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [profileSlice]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getBlockedUsersData(profileSlice?.id);
      // Agar data milta hai toh state update karein
      setBlockedList(data || []);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      Alert.alert("Error", "Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (targetId: string) => {
    try {
      setActionLoading(targetId); // Button par loader dikhane ke liye
      
      const success = await unblockProfile(profileSlice?.id, targetId);

      if (success=='unblock') {
        // UI se us user ko foran nikal dein
        setBlockedList((prev) => prev.filter((user) => user.id !== targetId));
        // Alert.alert("Success", "User unblocked successfully"); // Optional
      } else {
        throw new Error("Unblock failed");
      }
    } catch (error) {
      Alert.alert("Error", "Could not unblock user. Please try again.");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };
console.log(blockedList);

  const renderUser = ({ item }: { item: any }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Ionicons name="person" size={24} color="#ccc" />
          </View>
        )}
        <Text style={styles.userName} numberOfLines={1}>
          {item.full_name || "Unknown User"}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.unblockBtn, actionLoading === item.id && { opacity: 0.6 }]} 
        onPress={() => handleUnblock(item.id)}
        disabled={actionLoading !== null}
      >
        {actionLoading === item.id ? (
          <ActivityIndicator size="small" color="#ff4757" />
        ) : (
          <Text style={styles.unblockText}>Unblock</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      {/* Header */}
      <SettingsHeader title="Blocked Users" onBack={() => router.back()} />

      {/* Logic for Loader vs List vs Empty State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.black} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : blockedList.length > 0 ? (
        <FlatList
          data={blockedList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No blocked users found.</Text>
        </View>
      )}
    </View>
  );
};

export default BlockedUsers;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background,
    paddingHorizontal: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  userName: {
    marginLeft: 15,
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  unblockBtn: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 85,
    alignItems: 'center'
  },
  unblockText: {
    fontSize: 14,
    color: "#ff4757",
    fontFamily: Fonts.bold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: Fonts.medium,
    color: "#666"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100 
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#999",
    fontFamily: Fonts.medium,
  }
});