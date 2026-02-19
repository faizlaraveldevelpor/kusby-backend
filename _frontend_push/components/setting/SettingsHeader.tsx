import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';

interface SettingsHeaderProps {
  title: string;
  onBack: () => void;
}

export default function SettingsHeader({ title, onBack }: SettingsHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="arrow-back" size={26} color={Colors.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    marginLeft: 15,
    color: Colors.black,
    fontFamily: Fonts.bold,
  },
});
