import { getDatabase } from "@/db/schema";
import { useUserStore } from "@/store/user-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const hydrate = useUserStore((s) => s.hydrate);

  useEffect(() => {
    getDatabase().catch(console.error);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="character/[id]"
            options={{ headerShown: true, title: "", headerBackTitle: "Back" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
