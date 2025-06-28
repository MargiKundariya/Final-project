import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginRegister from './components/Screens/LoginRegister';
import AdminRouter from './components/Router/AdminRouter'; // Import Admin Router
import FacultyRouter from './components/Router/FacultyRouter';
import StudentRouter from './components/Router/StudentRouter';
import JudgeRouter from './components/Router/JudgeRouter';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Stack.Navigator initialRouteName="LoginRegister">
            {/* Login Screen */}
            <Stack.Screen
              name="LoginRegister"
              component={LoginRegister}
              options={{
                headerTitle: 'Campus Connect',
                headerShown: true,
              }}
            />

            {/* Admin Router */}
            <Stack.Screen
              name="Admin"
              component={AdminRouter}
              options={{
                headerShown: false, // Hide header inside Admin routes
              }}
            />
            <Stack.Screen
              name="Faculty"
              component={FacultyRouter}
              options={{
                headerShown: false, // Hide header inside Admin routes
              }}
            />
            <Stack.Screen
              name="Student"
              component={StudentRouter}
              options={{
                headerShown: false, // Hide header inside Admin routes
              }}
            />
            <Stack.Screen
              name="Judge"
              component={JudgeRouter}
              options={{
                headerShown: false, // Hide header inside Admin routes
              }}
            />
          </Stack.Navigator>
        </KeyboardAvoidingView>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Ensures proper scrolling
  },
});
