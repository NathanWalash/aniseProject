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

const Tab = createBottomTabNavigator();

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
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="MyAnises" component={MyAnisesScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile">
          {() => <ProfileScreen user={user} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
} 