
import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import HomeScreen from '../screens/HomeScreen';
import ItemEditScreen from '../screens/ItemEditScreen';
import Item2Screen from '../screens/Item2Screen';
import Item3Screen from '../screens/Item3Screen';
import Item4Screen from '../screens/Item4Screen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { View, Image, StyleSheet, TouchableOpacity, ImageBackground, FlatList, SafeAreaView } from 'react-native';
import DetailsScreen from '../screens/DetailsScreen';
import WeddingWishlistScreen from '../screens/WeddingWishlistScreen';
import * as Linking from 'expo-linking';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import ShakingLidAnimation from '../components/ShakingLidAnimation';
import { useFonts } from 'expo-font';
import BeforeHomeScreen from '../components/BeforeHomeScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SupplierScreen from '../screens/SupplierScreen';
import AdminScreen from '../screens/AdminScreen';
import CreateTraditionalFamilyEventScreen from '../screens/CreateTraditionalFamilyEventScreen';
import BeforeTraditionalFamilyEventScreen from '../components/BeforeTraditionalFamilyEventScreen';
import CorporateEventScreen from '../screens/CorporateEventScreen';
import BeforeCorporateEventScreen from '../components/BeforeCorporateEventScreen';
import BeforeConferenceEventScreen from '../components/BeforeConferenceEventScreen';
import ConferencesEventScreen from '../screens/ConferencesEventScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Загрузка...</Text>
  </View>
);

const SupplierContent = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  if (!user || !token) {
    return <LoadingScreen />;
  }

  return <SupplierScreen navigation={navigation} />;
};

const AdminContent = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  if (!user || !token) {
    return <LoadingScreen />;
  }

  return <AdminScreen navigation={navigation} />;
};

const SplashScreen = ({ navigation }) => {
  const [showSecondButton, setShowSecondButton] = useState(false);

  const handlePress = () => {
    setShowSecondButton(true);
    setTimeout(() => {
      navigation.replace('NewScreenTabs');
    }, 1000);
  };

  return (
    <LinearGradient
      colors={['#F1EBDD', '#897066']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.splashContainer}
    >
      <View style={styles.buttonContainer}>
        {!showSecondButton ? (
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Image
              source={require('../../assets/firstPageTurnOff.png')}
              style={styles.splashImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} disabled>
            <Image
              source={require('../../assets/firstPageTurnOn.png')}
              style={styles.splashImage2}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const NewScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#F1EBDD', '#897066']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.newScreenContainer}
    >
      <ImageBackground
        source={require('../../assets/footer.png')}
        style={styles.topPatternContainer}
        imageStyle={styles.topPatternImage}
      />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.potIcon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Image
              source={require('../../assets/create.png')}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.imageButton}
            onPress={() => navigation.navigate('Authenticated', { screen: 'Home' })}
          >
            <Image
              source={require('../../assets/join.png')}
              style={styles.buttonImage}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
        </View>
      </View>
    </LinearGradient>
  );
};

const CreateEventScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'CustomFont-Regular': require('../../assets/font/Geologica.ttf'),
  });

  const categories = [
    'Свадьба',
    'Традиционное семейное торжество',
    'Корпоративное мероприятие',
    'Конференции',
    'Тимбилдинги',
    
    'Концерты и творческие вечера',
    'Предложение руки и сердца',
    'Вечеринка перед свадьбой',
    'Выпускной',
    'Национальные праздники',
  ];

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryButton}
      onPress={() => {
        if (item === 'Свадьба') {
          navigation.navigate('BeforeHomeScreen');
        } else if (item === 'Традиционное семейное торжество') {
          navigation.navigate('BeforeCreateTraditionalFamilyEvent');
        } else if (item === 'Корпоративное мероприятие') {
          navigation.navigate('BeforeCorporateEventScreen');
        }
         else if (item === 'Конференции') {
          navigation.navigate('BeforeConferenceEventScreen');
        }
    
      }}
    >
      <Text style={styles.categoryText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#F1EBDD', '#897066']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={styles.splashContainer}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/kazan.png')}
          style={styles.potIcon2}
          resizeMode="contain"
        />
      </View>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item, index) => index.toString()}
        style={styles.categoryList}
        showsVerticalScrollIndicator={true}
      />
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewScreenTabs')}
          style={styles.imageButton}
        >
          <Image
            source={require('../../assets/mainButton.png')}
            style={styles.nextButtonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={{ marginTop: '1%' }}>Главная</Text>
      </View>
    </LinearGradient>
  );
};





function AuthenticatedTabs() {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  console.log('AuthenticatedTabs: user=', user);

  const tabBarOptions = {
    tabBarStyle: styles.tabBar,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: '#897066',
    tabBarInactiveTintColor: '#666666',
  };

  if (!user || roleId === undefined) {
    return <LoadingScreen />;
  }

  console.log('AuthenticatedTabs: roleId=', roleId, 'user=', user);

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      {roleId === 1 ? (
        <>
          <Tab.Screen
            name="Admin"
            component={AdminContent}
            options={{
              title: 'Admin',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon name="home" size={24} color={color} style={styles.tabIcon} />
              ),
            }}
          />
        </>
      ) : roleId === 2 ? (
        <>
          <Tab.Screen
            name="Supplier"
            component={SupplierContent}
            options={{
              title: 'Главная',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon name="home" size={24} color={color} style={styles.tabIcon} />
              ),
            }}
          />
          <Tab.Screen
            name="Item2"
            component={Item2Screen}
            options={{
              title: 'Добавить',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Item4"
            component={Item4Screen}
            options={{
              title: 'Профиль',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
        </>
      ) : roleId === 3 ? (
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Главная',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon
                  name="home"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
          <Tab.Screen
            name="NewScreen"
            component={NewScreen}
            options={{
              title: 'Вход',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon
                  name="event"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Item3"
            component={Item3Screen}
            options={{
              title: 'Мои мероприятия',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon
                  name="event"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Item4"
            component={Item4Screen}
            options={{
              title: 'Профиль',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Главная',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Icon
                  name="home"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Item4"
            component={Item4Screen}
            options={{
              title: 'Профиль',
              headerShown: false,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={color}
                  style={styles.tabIcon}
                />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

function CreateTraditionalFamilyEventTabs() {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  const tabBarOptions = {
    tabBarStyle: styles.tabBar,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: '#897066',
    tabBarInactiveTintColor: '#666666',
  };

  if (!user || roleId === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="CreateTraditionalFamilyEvent"
        component={CreateTraditionalFamilyEventScreen}
        options={{
          title: 'Главная',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item3"
        component={Item3Screen}
        options={{
          title: 'Мои мероприятия',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item4"
        component={Item4Screen}
        options={{
          title: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="person-outline" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CreateCorporateEventTabs() {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  const tabBarOptions = {
    tabBarStyle: styles.tabBar,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: '#897066',
    tabBarInactiveTintColor: '#666666',
  };

  if (!user || roleId === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="CreateCorporateEvent"
        component={CorporateEventScreen}
        options={{
          title: 'Главная',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item3"
        component={Item3Screen}
        options={{
          title: 'Мои мероприятия',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item4"
        component={Item4Screen}
        options={{
          title: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="person-outline" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function CreateConferenceEventTabs() {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  const tabBarOptions = {
    tabBarStyle: styles.tabBar,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: '#897066',
    tabBarInactiveTintColor: '#666666',
  };

  if (!user || roleId === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="CreateConferenceEvent"
        component={ConferencesEventScreen}
        options={{
          title: 'Главная',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item3"
        component={Item3Screen}
        options={{
          title: 'Мои мероприятия',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item4"
        component={Item4Screen}
        options={{
          title: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="person-outline" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function NewScreenTabs() {
  const { user, token } = useSelector((state) => state.auth);
  const roleId = user?.roleId;

  const tabBarOptions = {
    tabBarStyle: styles.tabBar,
    tabBarShowLabel: true,
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: '#897066',
    tabBarInactiveTintColor: '#666666',
  };

  if (!user || roleId === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      {/* <Tab.Screen
        name="NewScreenContent"
        component={NewScreen}
        options={{
          title: 'Вход',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Home"
        component={NewScreen}
        options={{
          title: 'Главная',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="home" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item3"
        component={Item3Screen}
        options={{
          title: 'Мои мероприятия',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Icon name="event" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="Item4"
        component={Item4Screen}
        options={{
          title: 'Профиль',
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="person-outline" size={24} color={color} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


export default function Navigation() {
  const { token, user } = useSelector((state) => {
    console.log('Inspecting auth state:', JSON.stringify(state.auth, null, 2));
    return state.auth;
  });
  console.log('Navigation state:', { token, user });

  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (token && !user) {
      console.log('Token exists but user is missing, redirecting to Login in 2s');
      const timer = setTimeout(() => {
        navigationRef.current?.navigate('Login');
      }, 1300);
      return () => clearTimeout(timer);
    }

    if (token && user && navigationRef.current) {
      if (user.roleId === 1) {
        console.log('User is authenticated with roleId 1, redirecting to Admin');
        navigationRef.current?.navigate('Authenticated', { screen: 'Admin' });
      } else if (user.roleId === 2) {
        console.log('User is authenticated with roleId 2, redirecting to Supplier');
        navigationRef.current?.navigate('Authenticated', { screen: 'Supplier' });
      } else {
        console.log('User is authenticated, redirecting to NewScreenTabs');
        navigationRef.current?.navigate('NewScreenTabs');
      }
    }

    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Deep link received:', event.url);
      if (event.url.includes('wishlist')) {
        navigationRef.current?.navigate('Wishlist', { id: event.url.split('/').pop() });
      }
    });

    return () => subscription.remove();
  }, [token, user]);

  const linking = {
    prefixes: ['myapp://', 'exp://172.20.10.7:8081'],
    config: {
      screens: {
        Wishlist: 'wishlist/:id',
        CreateCorporateEventTabs: {
          path: 'corporate',
          screens: {
            CreateCorporateEvent: ':id',
          },
        },
      },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="NewScreenTabs" component={NewScreenTabs} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="CreateTraditionalFamilyEvent" component={CreateTraditionalFamilyEventTabs} />
        <Stack.Screen name="BeforeCreateTraditionalFamilyEvent" component={BeforeTraditionalFamilyEventScreen} />
       
        <Stack.Screen name="CreateCorporateEventTabs" component={CreateCorporateEventTabs} />
        <Stack.Screen name="BeforeCorporateEventScreen" component={BeforeCorporateEventScreen} />
       
       
        <Stack.Screen name="CreateConferenceEventTabs" component={CreateConferenceEventTabs} />
        <Stack.Screen name="BeforeConferenceEventScreen" component={BeforeConferenceEventScreen} />
       


        <Stack.Screen name="BeforeHomeScreen" component={BeforeHomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Подробности' }} />
        <Stack.Screen name="Authenticated" component={AuthenticatedTabs} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ItemEdit" component={ItemEditScreen} />
        <Stack.Screen name="Wishlist" component={WeddingWishlistScreen} options={{ title: 'Wishlist', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  splashImage: {
    width: 600,
    height: 400,
  },
  splashImage2: {
    width: 600,
    height: 400,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5A4032',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  newScreenContainer: {
    flex: 1,
  },
  topPatternContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '20%',
    marginTop: '42%',
  },
  topPatternImage: {
    width: '100%',
    height: '100%',
    marginTop: '180%',
  },
  contentContainer: {
    flex: 1,
  },
  potIcon: {
    marginTop: '30%',
    width: 250,
    height: 180,
  },
  potIcon2: {
    marginTop: '20%',
    width: 200,
    height: 140,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    marginHorizontal: 10,
  },
  buttonImage: {
    width: 150,
    height: 150,
  },
  categoryList: {
    marginTop: '0%',
    marginBottom: '12%',
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2B48C',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonIcon: {
    width: 80,
    height: 60,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 60,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabIcon: {
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});