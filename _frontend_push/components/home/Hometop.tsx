import { View, Text, StyleSheet, Image } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@/theme/color';
import BottomFilterDialog from '@/dialog/Bottomdialog';
import { Fonts } from '@/theme/fonts';
import { useSelector } from 'react-redux';

export default function Hometop() {
    const [open, setOpen] = useState(false);
  const profileSlice=useSelector((state)=>state?.profileSlice?.userApi)

  return (
    <View style={styles.container}>
      {/* LEFT SIDE: Logo + Greeting/Name */}
      <View style={styles.left}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.name}>{profileSlice?.full_name} </Text>
        </View>
      </View>

      {/* RIGHT SIDE: Filter icon opens filter modal */}
      <TouchableOpacity onPress={() => setOpen(true)}>
        <Ionicons name="options-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <BottomFilterDialog
        visible={open}
        onClose={() => setOpen(false)}
      />

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height:"10%",
    paddingVertical: 12,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  greeting: {
    fontSize: 14,
    color: Colors.gray, // gray
    fontFamily:Fonts.medium
  },

  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    fontFamily:Fonts.bold
  },
})
