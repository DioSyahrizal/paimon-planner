import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ScreenStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CenterScreen({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-paimon-bg p-6 dark:bg-paimon-dark-bg">
      {children}
    </View>
  );
}

export function LoadingState({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <CenterScreen>
      <ActivityIndicator size="large" color="#c9a227" />
      <Text className="mt-3 text-sm text-paimon-subtle dark:text-paimon-dark-subtle">
        {message}
      </Text>
    </CenterScreen>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: ScreenStateProps) {
  return (
    <CenterScreen>
      {title && (
        <Text className="text-center text-lg font-semibold text-paimon-text dark:text-paimon-dark-text">
          {title}
        </Text>
      )}
      {message && (
        <Text className="mt-2 text-center text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-5 rounded-xl bg-paimon-accent px-5 py-3 dark:bg-paimon-dark-accent"
          onPress={onAction}
        >
          <Text className="font-bold text-white dark:text-black">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </CenterScreen>
  );
}

export function ErrorState({
  title = "Could not load data",
  message,
  actionLabel = "Try again",
  onAction,
}: ScreenStateProps) {
  return (
    <CenterScreen>
      <View className="w-full max-w-md rounded-2xl border border-paimon-danger/30 bg-paimon-surface p-5 dark:border-paimon-dark-danger/30 dark:bg-paimon-dark-surface">
        <Text className="text-center text-lg font-bold text-paimon-danger dark:text-paimon-dark-danger">
          {title}
        </Text>
        {message && (
          <Text className="mt-2 text-center text-sm leading-5 text-paimon-subtle dark:text-paimon-dark-subtle">
            {message}
          </Text>
        )}
        {onAction && (
          <TouchableOpacity
            className="mt-5 items-center rounded-xl bg-paimon-accent px-5 py-3 dark:bg-paimon-dark-accent"
            onPress={onAction}
          >
            <Text className="font-bold text-white dark:text-black">
              {actionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </CenterScreen>
  );
}

export function SkeletonCard() {
  return (
    <View className="rounded-2xl border border-paimon-border bg-paimon-surface p-4 dark:border-paimon-dark-border dark:bg-paimon-dark-surface">
      <View className="h-4 w-1/2 rounded-full bg-paimon-muted dark:bg-paimon-dark-muted" />
      <View className="mt-3 h-3 w-3/4 rounded-full bg-paimon-muted dark:bg-paimon-dark-muted" />
      <View className="mt-2 h-3 w-2/3 rounded-full bg-paimon-muted dark:bg-paimon-dark-muted" />
    </View>
  );
}

export function SkeletonList({
  title = "Loading...",
  count = 3,
}: {
  title?: string;
  count?: number;
}) {
  return (
    <View className="flex-1 bg-paimon-bg p-4 dark:bg-paimon-dark-bg">
      <Text className="mb-4 text-sm text-paimon-subtle dark:text-paimon-dark-subtle">
        {title}
      </Text>
      <View className="gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    </View>
  );
}
