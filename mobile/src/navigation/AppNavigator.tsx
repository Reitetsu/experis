import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {TaskDetailScreen} from '../features/tasks/screens/TaskDetailScreen';
import {TaskListScreen} from '../features/tasks/screens/TaskListScreen';
import type {TaskStackParamList} from './TaskStackParamList';

const Stack = createNativeStackNavigator<TaskStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: '#114b5f',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        <Stack.Screen
          component={TaskListScreen}
          name="TaskList"
          options={{headerShown: false}}
        />
        <Stack.Screen
          component={TaskDetailScreen}
          name="TaskDetail"
          options={{title: 'Detalle de tarea'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
