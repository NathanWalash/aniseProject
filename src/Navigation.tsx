import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MyAnisesScreen from './screens/myanises/MyAnisesScreen';
import ExploreScreen from './screens/explore/ExploreScreen';
import CreateScreen from './screens/create/CreateScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';
import ProfileScreen from './screens/profile/ProfileScreen';
import MyAnisesIcon from '../assets/icons/anise.svg';
import ExploreIcon from '../assets/icons/explore_icon.svg';
import CreateIcon from '../assets/icons/create_icon.svg';
import NotificationsIcon from '../assets/icons/notifications_icon.svg';
import ProfileIcon from '../assets/icons/profile_icon.svg';
import { SvgProps } from 'react-native-svg';
import PaymentsLinkFlow from './screens/payments/PaymentsLinkFlow';
import { createStackNavigator } from '@react-navigation/stack';
import DebugScreen from './screens/debug/DebugScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

function ProfileStackScreen({ user, onLogout }: { user: any, onLogout: () => void }) {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" options={{ headerShown: false }}>
        {() => <ProfileScreen user={user} onLogout={onLogout} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="PaymentsLinkFlow" component={PaymentsLinkFlow} options={{ title: 'Link GoCardless' }} />
      <ProfileStack.Screen name="DebugScreen" component={DebugScreen} options={{ title: 'Debug' }} />
    </ProfileStack.Navigator>
  );
}

// The user prop will be passed from App.tsx
export default function Navigation({ user, onLogout }: { user: any, onLogout: () => void }) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let IconComponent: React.FC<SvgProps> = MyAnisesIcon;
            if (route.name === 'Explore') IconComponent = ExploreIcon;
            else if (route.name === 'Create') IconComponent = CreateIcon;
            else if (route.name === 'Notifications') IconComponent = NotificationsIcon;
            else if (route.name === 'Profile') IconComponent = ProfileIcon;
            return <IconComponent width={size} height={size} stroke={color} />;
          },
          tabBarActiveTintColor: '#7B68EE',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Create">
          {() => <CreateScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="MyAnises">
          {() => <MyAnisesScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile">
          {() => <ProfileStackScreen user={user} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
} 