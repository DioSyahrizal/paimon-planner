import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "tamagui";

const CompareTab = () => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>Gap analysis coming soon</Text>
      <Text style={styles.placeholderSubText}>
        Requires a saved recommended build.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Placeholders
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

export default CompareTab;
