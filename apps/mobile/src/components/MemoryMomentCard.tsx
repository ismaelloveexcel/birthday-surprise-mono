import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  memoryMoment: {
    title: string;
    body: string;
  };
}

export const MemoryMomentCard: React.FC<Props> = ({ memoryMoment }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{memoryMoment.title}</Text>
    <Text style={styles.body}>{memoryMoment.body}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#fefce8",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: "#78350f",
    lineHeight: 22,
  },
});
