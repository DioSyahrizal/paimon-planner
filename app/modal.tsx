import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-paimon-bg p-5 dark:bg-paimon-dark-bg">
      <Text className="text-2xl font-bold text-paimon-text dark:text-paimon-dark-text">
        Modal
      </Text>
      <Link href="/" dismissTo className="mt-4">
        <Text className="text-base text-paimon-accent dark:text-paimon-dark-accent">
          Go to home screen
        </Text>
      </Link>
    </View>
  );
}
