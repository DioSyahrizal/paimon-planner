import { useAppTheme, type AppTheme } from '@/theme/app-theme'
import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'
import { Text, View } from 'tamagui'

export default function ModalScreen() {
  const theme = useAppTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  link: { marginTop: 15 },
  linkText: { color: theme.accent, fontSize: 16 },
})
