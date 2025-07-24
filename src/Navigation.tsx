import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LandingScreen from './screens/landing/LandingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import ExploreScreen from './screens/explore/ExploreScreen';
import CreateScreen from './screens/create/CreateScreen';
import MyAnisesScreen from './screens/myanises/MyAnisesScreen';
import AniseDetailsScreen from './screens/myanises/AniseDetailsScreen';
import { ClaimsListScreen } from './screens/myanises/claims/ClaimsListScreen';
import { ProposalsListScreen } from './screens/myanises/proposals/ProposalsListScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import DebugScreen from './screens/debug/DebugScreen';

// Import icons
import MyAnisesIcon from '../assets/icons/anise.svg';
import ExploreIcon from '../assets/icons/explore_icon.svg';
import CreateIcon from '../assets/icons/create_icon.svg';
import NotificationsIcon from '../assets/icons/notifications_icon.svg';
import ProfileIcon from '../assets/icons/profile_icon.svg';

const Tab = createBottomTabNavigator();
const MyAnisesStack = createNativeStackNavigator();

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

interface ScreenProps {
  navigation: any;
  route: any;
}

function MyAnisesStackScreen({ user }: { user: any }) {
  return (
    <MyAnisesStack.Navigator>
      <MyAnisesStack.Screen 
        name="MyAnisesList" 
        options={{ headerShown: false }}
      >
        {(props: ScreenProps) => <MyAnisesScreen {...props} user={user} />}
      </MyAnisesStack.Screen>
      <MyAnisesStack.Screen 
        name="AniseDetails" 
        options={{ headerShown: false }}
      >
        {(props: ScreenProps) => <AniseDetailsScreen {...props} />}
      </MyAnisesStack.Screen>
      <MyAnisesStack.Screen 
        name="ClaimsList" 
        options={{ headerShown: false }}
      >
        {(props: ScreenProps) => <ClaimsListScreen {...props} />}
      </MyAnisesStack.Screen>
      <MyAnisesStack.Screen 
        name="ProposalsList" 
        options={{ headerShown: false }}
      >
        {(props: ScreenProps) => <ProposalsListScreen {...props} />}
      </MyAnisesStack.Screen>
    </MyAnisesStack.Navigator>
  );
}

function TabNavigator({ user, onLogout }: NavigationProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color }) => <ExploreIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Create"
        options={{
          tabBarIcon: ({ color }) => <CreateIcon color={color} />,
        }}
      >
        {() => <CreateScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="MyAnises"
        options={{
          tabBarIcon: ({ color }) => <MyAnisesIcon color={color} />,
        }}
      >
        {() => <MyAnisesStackScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => <NotificationsIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      >
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  return (
    <NavigationContainer>
      <TabNavigator user={user} onLogout={onLogout} />
    </NavigationContainer>
  );
} 