import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { trackEvent } from "../services/supabaseService";

interface Props {
  shareCaption: string;
  shareUrl: string;
  experienceId: string;
}

export const ShareBar: React.FC<Props> = ({
  shareCaption,
  shareUrl,
  experienceId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleNativeShare = async () => {
    await trackEvent(experienceId, "share_clicked", { platform: "native" });
    try {
      await Share.share({
        message: `${shareCaption}\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      // share was dismissed
    }
  };

  const handleWhatsApp = async () => {
    await trackEvent(experienceId, "share_clicked", { platform: "whatsapp" });
    const msg = encodeURIComponent(`${shareCaption}\n\n${shareUrl}`);
    Linking.openURL(`whatsapp://send?text=${msg}`).catch(() => {
      Alert.alert("WhatsApp not found", "Share the link another way.");
    });
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(shareUrl);
    await trackEvent(experienceId, "share_clicked", { platform: "copy" });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Share this surprise</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleWhatsApp}
          style={[styles.btn, styles.whatsapp]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>💬 WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNativeShare}
          style={[styles.btn, styles.share]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>⬆️ Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCopyLink}
          style={[styles.btn, styles.copy]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{copied ? "✓ Copied" : "🔗 Link"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  whatsapp: { backgroundColor: "#22c55e" },
  share: { backgroundColor: "#3b82f6" },
  copy: { backgroundColor: "#6b7280" },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
