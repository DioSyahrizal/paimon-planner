import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View className="flex-1 items-center justify-center bg-paimon-bg p-6 dark:bg-paimon-dark-bg">
        <View className="w-full max-w-md rounded-2xl border border-paimon-border bg-paimon-surface p-5 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
          <Text className="text-center text-xl font-bold text-paimon-text dark:text-paimon-dark-text">
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
            The app hit an unexpected rendering error. You can try this screen
            again without losing your saved settings.
          </Text>
          <TouchableOpacity
            className="mt-5 items-center rounded-xl bg-paimon-accent px-5 py-3 dark:bg-paimon-dark-accent"
            onPress={this.reset}
          >
            <Text className="font-bold text-white dark:text-black">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
