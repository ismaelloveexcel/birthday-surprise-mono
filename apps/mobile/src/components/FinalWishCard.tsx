import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  finalWish: {
    headline: string;
    message: string;
    signature: string;
  };
}

export const FinalWishCard: React.FC<Props> = ({ finalWish }) => (
  <View style={styles.card}>
    <Text style={styles.headline}>{finalWish.headline}</Text>
    <Text style={styles.message}>{finalWish.message}</Text>
    <Text style={styles.signature}>— {finalWish.signature}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginTop: 0,
    backgroundColor: "#fce7f3",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#831843",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: "#9d174d",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 14,
  },
  signature: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#be185d",
    alignSelf: "flex-end",
  },
});
