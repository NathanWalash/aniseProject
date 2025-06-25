import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import Page1Screen from './screens/Page1Screen';
import Page2Screen from './screens/Page2Screen';
import Page3Screen from './screens/Page3Screen';
import Page4Screen from './screens/Page4Screen';

const Tab = createBottomTabNavigator();

// The user prop will be passed from App.tsx
export default function Navigation({ user }: { user: any }) {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home">
          {() => <HomeScreen user={user} />}
        </Tab.Screen>
        <Tab.Screen name="Page1" component={Page1Screen} />
        <Tab.Screen name="Page2" component={Page2Screen} />
        <Tab.Screen name="Page3" component={Page3Screen} />
        <Tab.Screen name="Page4" component={Page4Screen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 