import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ToastManager from 'toastify-react-native';
import { StorageProvider } from './contexts/StorageContext';
import { GlobalDataProvider } from './contexts/GlobalDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  useFonts,
  Nunito_200ExtraLight,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  Nunito_200ExtraLight_Italic,
  Nunito_300Light_Italic,
  Nunito_400Regular_Italic,
  Nunito_500Medium_Italic,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold_Italic,
  Nunito_900Black_Italic,
} from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './screens/HomeScreen';
import Mybooking from './screens/Mybooking';
import Shop from './screens/Shop';
import User from './screens/User';
import Setting from './screens/Setting';
import SocialMedie from './screens/SocialMedie';
import AboutApp from './screens/AboutApp';
import Branch from './screens/Branch';
import Staff from './screens/Staff';
import Service from './screens/Service';
import DateTime from './screens/DateTime';
import Detail from './screens/Detail';
import Points from './screens/Points';
import Referral from './screens/Referral';
import Coupon from './screens/Coupon';
import Notifications from './screens/Notifications';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import WelcomeScreen from './screens/WelcomeScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import FirstLoadScreen from './screens/FirstLoadScreen';
import MyBookingDetails from './screens/MyBookingDetails';
import Country from './screens/Country';
import ChangePassword from './screens/ChangePassword';

import './global.css';

// Keep splash screen visible while we fetch resources and fonts
SplashScreen.preventAutoHideAsync();

// Global font family definitions
export const FONTS = {
  // Regular variants
  extraLight: 'Nunito_200ExtraLight',
  light: 'Nunito_300Light',
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
  
  // Italic variants
  extraLightItalic: 'Nunito_200ExtraLight_Italic',
  lightItalic: 'Nunito_300Light_Italic',
  regularItalic: 'Nunito_400Regular_Italic',
  mediumItalic: 'Nunito_500Medium_Italic',
  semiBoldItalic: 'Nunito_600SemiBold_Italic',
  boldItalic: 'Nunito_700Bold_Italic',
  extraBoldItalic: 'Nunito_800ExtraBold_Italic',
  blackItalic: 'Nunito_900Black_Italic',
};

const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null);
  const [appIsReady, setAppIsReady] = React.useState(false);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light_Italic,
    Nunito_400Regular_Italic,
    Nunito_500Medium_Italic,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black_Italic,
  });

  React.useEffect(() => {
    const prepare = async () => {
      try {
        // Check if it's the first launch
        const value = await AsyncStorage.getItem('isFirstLaunch');
        if (value === null) {
          await AsyncStorage.setItem('isFirstLaunch', JSON.stringify(false));
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error reading isFirstLaunch from AsyncStorage:', error);
        setIsFirstLaunch(false); // fallback to avoid blocking app
      } finally {
        // Set app as ready
        setAppIsReady(true);
      }
    };

    prepare();
  }, []);

  // Effect to hide splash screen once fonts are loaded and first launch is checked
  React.useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded && appIsReady) {
        await SplashScreen.hideAsync();
      }
    };
    
    hideSplash();
  }, [fontsLoaded, appIsReady]);

  // Show nothing until both fonts are loaded and first launch check is complete
  if (!fontsLoaded || !appIsReady) {
    return null;
  }

  return (
    <StorageProvider>
      <GlobalDataProvider>
        <NavigationContainer>
          <ToastManager duration={1000} showProgressBar={false} />
          <Stack.Navigator
            initialRouteName={isFirstLaunch ? 'WelcomeScreen' : 'FirstLoadScreen'}
            screenOptions={{
              headerShown: false,
              animation: 'default',
              contentStyle: {
                backgroundColor: '#000000',
              },
            }}
          >
            <Stack.Screen name="FirstLoadScreen" component={FirstLoadScreen} />
            <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="Mybooking" component={Mybooking} />
            <Stack.Screen name="Shop" component={Shop} />
            <Stack.Screen name="User" component={User} />
            <Stack.Screen name="Setting" component={Setting} />
            <Stack.Screen name="SocialMedie" component={SocialMedie} />
            <Stack.Screen name="AboutApp" component={AboutApp} />
            <Stack.Screen name="Branch" component={Branch} />
            <Stack.Screen name="Staff" component={Staff} />
            <Stack.Screen name="Service" component={Service} />
            <Stack.Screen name="DateTime" component={DateTime} />
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="Points" component={Points} />
            <Stack.Screen name="Referral" component={Referral} />
            <Stack.Screen name="Coupon" component={Coupon} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="MyBookingDetails" component={MyBookingDetails} />
            <Stack.Screen name="Country" component={Country} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
          </Stack.Navigator>
        </NavigationContainer>
      </GlobalDataProvider>
    </StorageProvider>
  );
}