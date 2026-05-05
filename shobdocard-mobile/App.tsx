import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { Text, View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import LearnScreen from './screens/LearnScreen'
import QuizScreen from './screens/QuizScreen'
import ProgressScreen from './screens/ProgressScreen'
import { useStore } from './store/store'
import { auth } from './lib/api'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1f',
          borderTopColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: '#00ffa3',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text> }}
      />
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>🎯</Text> }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const { loadAll, setUser } = useStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
      // Load all data in background immediately
      loadAll()
      try {
        const res = await auth.me()
        setUser(res.data)
      } catch {}
    }
    setChecking(false)
  }

  if (checking) return (
    <View style={{ flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#00ffa3', fontSize: 32, fontWeight: '900' }}>শব্দকার্ড</Text>
      <ActivityIndicator color="#00ffa3" style={{ marginTop: 20 }} />
    </View>
  )

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}