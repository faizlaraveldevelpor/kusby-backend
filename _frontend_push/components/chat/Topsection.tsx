import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaTop } from '@/hooks/useSafeAreaTop';
import TabHeader from '@/components/tabs/TabHeader';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

type TopsectionProps = {
  searchQuery: string;
  onSearchChange: (q: string) => void;
};

const ChatPage = ({ searchQuery, onSearchChange }: TopsectionProps) => {
  const safeTop = useSafeAreaTop();
  return (
    <View style={[styles.container, { paddingTop: safeTop }]}>
      <TabHeader title="Chats" />
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={Colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats"
          placeholderTextColor={Colors.gray}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
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
});

export default ChatPage;
