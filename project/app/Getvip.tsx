import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';

export default function Getvip() {
  const router = useRouter();
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router?.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.headerTitle}>Hume VIP</Text>

        <Text style={styles.subTitle}>
          Enjoy unlimited swiping & likes, without restrictions & without ads
        </Text>

        {/* CARD 1 */}
        <TouchableOpacity onPress={()=>router.push("/payments/Payments")}>
          <View style={[styles.card, styles.cardBorder]}>
            {/* Added top border */}
            <FontAwesome5 name="crown" size={100} color={Colors.primary}   />
            

            <Text style={styles.price}>$9.99 / Month</Text>

            <View style={styles.line} />

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>Unlimited Swipes</Text>
            </View>

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>Unlimited Likes</Text>
            </View>

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>No Ads</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* CARD 2 */}
        <TouchableOpacity onPress={()=>router.push("/payments/Payments")}>
          <View style={[styles.card, styles.cardBorder]}>
            {/* Added top border */}
            <FontAwesome5 name="crown" size={100} color={Colors.primary}   />

            

            <Text style={styles.price}>$19.99 / 3 Months</Text>

            <View style={styles.line} />

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>All Premium Features</Text>
            </View>

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>Priority Support</Text>
            </View>

            <View style={styles.pointRow}>
              <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
              <Text style={styles.point}>Exclusive Badge</Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    marginTop: 30,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 30,
    color: Colors.primary,
    textAlign: 'center',
    width: '100%',
    marginTop: 30,
    fontFamily: Fonts.bold,
    marginBottom:10
  },
  subTitle: {
    textAlign: 'center',
    paddingHorizontal: 25,
    fontSize: 14,
    color: Colors.black,
    marginBottom: 18,
    fontFamily: Fonts.regular,
  },
  card: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: Colors.background,
    borderRadius: 18,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  cardBorder: {
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
  },
  vipImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: Fonts.bold,
    marginTop:30
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  pointRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  point: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.black,
    fontFamily: Fonts.regular,
  },
});
