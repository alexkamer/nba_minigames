import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6aaa64',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121213',
          borderTopColor: '#3a3a3c',
        },
        tabBarInactiveTintColor: '#818384',
      }}>
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="unlimited"
        options={{
          title: 'Unlimited',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="infinity" color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
