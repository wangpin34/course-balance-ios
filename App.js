import {  useEffect } from "react";
import { NativeRouter } from "react-router-native";
import {
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import Constants from "expo-constants";
import db, { initialize } from "./src/db";
import { RecoilRoot } from "recoil";
import Root from './src/Root'

export default function App() {
  useEffect(() => {
    initialize(db);
  }, []);

  return (
    <NativeRouter>
      <RecoilRoot>
        <SafeAreaView style={styles.container}>
          <Root />
        </SafeAreaView>
      </RecoilRoot>
    </NativeRouter>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  }
});
