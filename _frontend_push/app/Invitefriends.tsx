import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/theme/color";
import { Fonts } from "@/theme/fonts";
import { useRouter } from "expo-router";

const friendsData = [
  {
    id: '1',
    name: 'John Doe',
    username: '@johndoe',
    followers: 1200,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: '@janesmith',
    followers: 980,
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    username: '@michaelj',
    followers: 1500,
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: '4',
    name: 'Alice Brown',
    username: '@alicebrown',
    followers: 870,
    image: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
];

const InviteFriends = () => {
  const router = useRouter();
  const [invitedIds, setInvitedIds] = useState<string[]>([]); // track invited friends

  const toggleInvite = (id: string) => {
    if (invitedIds.includes(id)) {
      setInvitedIds(invitedIds.filter((item) => item !== id));
    } else {
      setInvitedIds([...invitedIds, id]);
    }
  };

  const renderItem = ({ item }: any) => {
    const isInvited = invitedIds.includes(item.id);

    return (
      <View style={styles.row}>
        <Image source={{ uri: item.image }} style={styles.userImage} />

        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.usernameFollowers}>
            {item.username} {"\u2022"} {item.followers} Followers
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.inviteBtn,
            isInvited ? { backgroundColor: Colors.black } : { backgroundColor: Colors.primary },
          ]}
          activeOpacity={0.7}
          onPress={() => toggleInvite(item.id)}
        >
          <Text
            style={[
              styles.inviteText,
              isInvited ? { color: Colors.primary } : { color: '#fff' },
            ]}
          >
            {isInvited ? "Invited" : "Invite"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={friendsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
};

export default InviteFriends;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.medium,
    color: Colors.black,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.background || "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  usernameFollowers: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#777',
    marginTop: 2,
  },
  inviteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  inviteText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
});
