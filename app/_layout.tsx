import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'
import { useEffect } from 'react'
import { getDatabase } from '@/db/schema'

const queryClient = new QueryClient()

export const unstable_settings = {
  anchor: '(tabs)',
}

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch(console.error)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="character/[id]"
            options={{ headerShown: true, title: '', headerBackTitle: 'Back' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
