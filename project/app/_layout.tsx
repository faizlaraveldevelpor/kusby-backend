import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/theme/color';
import { useFonts } from 'expo-font';
// import {
//   Poppins_400Regular,
//   Poppins_500Medium,
//   Poppins_600SemiBold,
//   Poppins_700Bold,
// } from '@expo-google-fonts/poppins';

import { Roboto_700Bold,Roboto_400Regular,Roboto_500Medium,Roboto_600SemiBold, } from '@expo-google-fonts/roboto';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useLocationOnStart } from '@/hooks/Location';
import { store } from '@/store/Store';
import { StripeProvider } from '@stripe/stripe-react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [login,setlogin]=useState(false)
  
  const [loaded] = useFonts({
    Roboto_700Bold,Roboto_400Regular,Roboto_500Medium,Roboto_600SemiBold,
  });
useEffect(() => {
  let isMounted = true;

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (!isMounted) return;

    if (data?.user) {
      setlogin(true);
    } else {
      router.replace('/startScreen'); // ✅ secure redirect
    }
  };

  checkUser();

  return () => {
    isMounted = false;
  };
}, []);

 useEffect(()=>{
if (login==true) {
}
 },[login])


 

 
    if (!loaded) return null;

  return (
    <Provider store={store}>
    <SafeAreaProvider>
    <StripeProvider 
      publishableKey='pk_test_51OTpUbGYNvzZOOzjYAhfAwgmxSxvCFCGlL5IpVv0pszqWICMcrx4LhrhDQNHmd4kUDzv4QeoAhyhnY7sGd2Si54i00dON7mnmA'
      urlScheme="project"
    >
    <ThemeProvider value={Colors.background === '#35072B' ? DarkTheme : DefaultTheme}>

      <Stack>
        
          
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="userdetail" options={{ headerShown: false }} />
        <Stack.Screen name="Showmore"  options={{ headerShown: false }} />
        <Stack.Screen name="Searchuser" options={{ headerShown: false }} />
<Stack.Screen name="Allnewmatchusers" options={{ headerShown: false }} />
        <Stack.Screen name="Allyourmatch" options={{ headerShown: false }} />
        <Stack.Screen name="Yourmatch" options={{ headerShown: false }} />
        <Stack.Screen name="singlechat" options={{ headerShown: false }} />
        <Stack.Screen name="Getvip" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Payments" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Addnewcard" options={{ headerShown: false }} />
        <Stack.Screen name="payments/Confirmpayment" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Settings" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Parsnalinformation" options={{ headerShown: false }} />
        <Stack.Screen name="setting/DiscoverySettings" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Privacypolicy" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Security" options={{ headerShown: false }} />
        <Stack.Screen name="HelpcenterTopBard/TopTabs" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Changepin" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Changepassword" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Premiumamanagement" options={{ headerShown: false }} />
        <Stack.Screen name="Invitefriends" options={{ headerShown: false }} />
        <Stack.Screen name="setting/Language" options={{ headerShown: false }} />
        <Stack.Screen name="setting/BlockedUsers" options={{ headerShown: false }} />
        <Stack.Screen name="Loginuserdetails" options={{ headerShown: false }} />
        <Stack.Screen name="Editloginuser" options={{ headerShown: false }} />
        <Stack.Screen name="components/PaymentScreen" options={{ headerShown: false }} />

          




          
          <Stack.Screen name="startScreen" options={{ headerShown: false }} />
        {/* <Stack.Screen name="Selectlocation" options={{ headerShown: false }} /> */}
        <Stack.Screen name="Signinpassword" options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Setuplocation" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Fillyourprofile" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Photos" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Intrestes" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Createpin" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Verifynumber" options={{ headerShown: false }} />
        <Stack.Screen name="signupsteps/Cetagories" options={{ headerShown: false }} />

          
        

        

      </Stack>
<StatusBar style="dark" hidden={true} />    

</ThemeProvider>
</StripeProvider>
</SafeAreaProvider>
</Provider>

  );
}
