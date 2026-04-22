import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Text, View } from 'tamagui'

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  link: { marginTop: 15 },
  linkText: { color: '#c9a227', fontSize: 16 },
})
