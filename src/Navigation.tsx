import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ExploreScreen from './screens/Screen1/Screen1Screen';
import CreateScreen from './screens/Screen2/Screen2Screen';
import NotificationsScreen from './screens/Screen3/Screen3Screen';
import ProfileScreen from './screens/Screen4/Screen4Screen';
import MyAnisesScreen from './screens/Screen5/Screen5Screen';
import MyAnisesIcon from '../assets/icons/myanises_icon.svg';
import ExploreIcon from '../assets/icons/explore_icon.svg';
import CreateIcon from '../assets/icons/create_icon.svg';
import NotificationsIcon from '../assets/icons/notifications_icon.svg';
import ProfileIcon from '../assets/icons/profile_icon.svg';
import { SvgProps } from 'react-native-svg';

const Tab = createBottomTabNavigator();

// The user prop will be passed from App.tsx
export default function Navigation({ user }: { user: any }) {
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
        <Tab.Screen name="MyAnises" options={{ title: 'MyAnises' }}>
          {() => <MyAnisesScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Explore" component={ExploreScreen} />
        <Tab.Screen name="Create" component={CreateScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 