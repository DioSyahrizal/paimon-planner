import React from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "tamagui";

const RecommendedTab = () => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Recommended builds coming soon</Text>
      <Text style={styles.placeholderSubText}>
        Add a build guide from the Builds tab first.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholderSubText: { color: "#666", fontSize: 13, textAlign: "center" },
});

export default RecommendedTab;
