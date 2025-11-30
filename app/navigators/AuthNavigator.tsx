import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoginScreen } from "app/screens/auth/LoginScreen"
import { RegisterScreen } from "app/screens/auth/RegisterScreen"

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: "fade", // плавные переходы
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}
