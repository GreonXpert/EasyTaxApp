// App.js

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CustomLoader from './components/CustomLoader';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import MainTabNavigator from './navigation/MainTabNavigator';

// ✅ NEW: Import HomeScreen
import HomeScreen from './screens/HomeScreen';

// Import the existing components
import PersonalInfo from './components/PersonalInfo';
import PrivacySecurity from './components/PrivacySecurity';
import HelpCenter from './components/HelpCenter';
import ContactUs from './components/ContactUs';
import About from './components/About';
import Notifications from './components/Notifications';
import SavedMessagesScreen from './screens/SavedMessagesScreen';
import PaymentMethods from './components/PaymentMethods';

// ✅ Tax Services
import TaxCalculator from './components/TaxCalculator';
import TaxPlanning from './components/TaxPlanning';
import CAConnect from './components/CAConnect';
import CADetails from './components/CADetails';
import TaxTips from './components/TaxTips';
import ITRFiling from './components/ITRFiling';
import GSTReturns from './components/GSTReturns';
import TDSCalculator from './components/TDSCalculator';
import TaxRefundCalculator from './components/TaxRefundCalculator';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter_900Black': require('./assets/fonts/Inter_18pt-Black.ttf'),
    'Inter_400Regular': require('./assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter_700Bold': require('./assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter_600SemiBold': require('./assets/fonts/Inter_18pt-SemiBold.ttf'),
  });

  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user_data');
        if (userData !== null) {
          setInitialRoute('MainApp');
        }
      } catch (e) {
        console.error("Failed to fetch user data from storage.", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (!fontsLoaded || isLoading) {
    return <CustomLoader />;
  }

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute} 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
        
        {/* ✅ NEW: Add standalone HomeScreen */}
        <Stack.Screen name="Home" component={HomeScreen} />
        
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="SavedMessages" component={SavedMessagesScreen} />
        
        {/* Existing components */}
        <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
        <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        
        {/* ✅ Tax Services */}
        <Stack.Screen name="TaxCalculator" component={TaxCalculator} />
        <Stack.Screen name="TaxPlanning" component={TaxPlanning} />
        <Stack.Screen name="CAConnect" component={CAConnect} />
        <Stack.Screen name="CADetails" component={CADetails} />
        <Stack.Screen name="TaxTips" component={TaxTips} />
        <Stack.Screen name="ITRFiling" component={ITRFiling}/>
        <Stack.Screen name="GSTReturns" component={GSTReturns}/>
        <Stack.Screen name='TDSCalculator' component={TDSCalculator}/>
        <Stack.Screen name='TaxRefundCalculator'component={TaxRefundCalculator}/>

      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}
