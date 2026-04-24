import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import type { SurpriseInput, SurpriseOutput, Tier } from "@birthday-surprise/shared";

import { CreateSurpriseScreen } from "./src/screens/CreateSurpriseScreen";
import { SurprisePreviewScreen } from "./src/screens/SurprisePreviewScreen";
import { TierSelectionScreen } from "./src/screens/TierSelectionScreen";
import { SurpriseExperienceScreen } from "./src/screens/SurpriseExperienceScreen";

export type RootStackParamList = {
  CreateSurprise: undefined;
  SurprisePreview: {
    output: SurpriseOutput;
    input: SurpriseInput;
    experienceId: string;
  };
  TierSelection: {
    output: SurpriseOutput;
    input: SurpriseInput;
    experienceId: string;
    qualityFlag: boolean;
  };
  SurpriseExperience: {
    output: SurpriseOutput;
    experienceId: string;
    unlocked: boolean;
    relationship: string;
    tier: Tier;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

// Publishable key is safe to expose in the client bundle (it's public by design)
const stripePublishableKey =
  (Constants.expoConfig?.extra?.stripePublishableKey as string) ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={stripePublishableKey}
          merchantIdentifier="merchant.com.birthdaysurprise.app"
        >
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
                name="TierSelection"
                component={TierSelectionScreen}
                options={{ title: "Choose a Plan" }}
              />
              <Stack.Screen
                name="SurpriseExperience"
                component={SurpriseExperienceScreen}
                options={{ title: "Experience" }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
