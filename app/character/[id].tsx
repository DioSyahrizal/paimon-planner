import { useLocalSearchParams } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Text, View } from 'tamagui'

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Character {id}</Text>
      <Text style={styles.subtitle}>Full detail view coming in Phase 2.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14, textAlign: 'center' },
})
