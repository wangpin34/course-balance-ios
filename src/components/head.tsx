
import { Text, StyleSheet } from "react-native";
export default function Head({title}: {title: string}) {
  return <Text style={styles.head}>{title}</Text>
}

const styles = StyleSheet.create({
  head: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  }})