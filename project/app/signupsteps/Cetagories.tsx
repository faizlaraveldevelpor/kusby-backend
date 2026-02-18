import { cetagory } from '@/store/profileSlice';
import { Colors } from '@/theme/color';
import { Fonts } from '@/theme/fonts';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';

const CategorySelection = () => {
    const dispatch=useDispatch()
  const categories = [
    'Casual dating',
    'Hookups',
    'Open to anything',
    'Friends first'
  ];

  // Initializing with the first category so one is always selected by default
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What are you looking for?</Text>
        <Text style={styles.subtitle}>Select a category so we can find the best matches for you.</Text>

        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryBox,
              selectedCategory === item && styles.selectedBox
            ]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === item && styles.selectedText
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.nextButton}
          
          onPress={() => {
            dispatch(cetagory(selectedCategory))
            router.push("/signupsteps/Photos") 

            
          }}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    color: Colors.black,
    marginBottom: 10,
    fontFamily:Fonts.bold
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 30,
    fontFamily:Fonts.regular
  },
  categoryBox: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    fontFamily:Fonts.bold
  },
  selectedBox: {
    borderColor: Colors.primary,
    backgroundColor: Colors.black,
  },
  categoryText: {
    fontSize: 18,
    color: Colors.background,
    fontFamily:Fonts.bold

  },
  selectedText: {
    color: Colors.primary,
    fontFamily:Fonts.bold
  },
  nextButton: {
    marginTop: 30,
    backgroundColor:Colors.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily:Fonts.bold    
  },
});

export default CategorySelection;