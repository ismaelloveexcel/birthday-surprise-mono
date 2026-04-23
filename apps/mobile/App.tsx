import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { SurpriseInput, SurpriseOutput } from "@birthday-surprise/shared";

import { CreateSurpriseScreen } from "./src/screens/CreateSurpriseScreen";
import { SurprisePreviewScreen } from "./src/screens/SurprisePreviewScreen";
import { SurpriseExperienceScreen } from "./src/screens/SurpriseExperienceScreen";

export type RootStackParamList = {
  CreateSurprise: undefined;
  SurprisePreview: {
    output: SurpriseOutput;
    input: SurpriseInput;
    experienceId: string;
  };
  SurpriseExperience: {
    output: SurpriseOutput;
    experienceId: string;
    unlocked: boolean;
    relationship: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: "#fff" },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: "700", fontSize: 16 },
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen
              name="CreateSurprise"
              component={CreateSurpriseScreen}
              options={{ title: "Birthday Surprise" }}
            />
            <Stack.Screen
              name="SurprisePreview"
              component={SurprisePreviewScreen}
              options={{ title: "Your Surprise" }}
            />
            <Stack.Screen
              name="SurpriseExperience"
              component={SurpriseExperienceScreen}
              options={{ title: "Experience" }}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
