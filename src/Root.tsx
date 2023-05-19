import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Route,
  Routes,
} from "react-router-native";
import { StyleSheet } from "react-native";
import { View, Text } from "react-native-ui-lib";
import Constants from "expo-constants";
import db, { initialize } from "./db";
import Courses from "./components/courses";
import CourseDetail from "./components/course-detail";
import EditCourse from "./components/edit";

function ErrorBoundary() {
  return <View><Text text20 red10>Error occurs</Text></View>
}

export default function Root() {
  useEffect(() => {
    initialize(db);
  }, []);

  return (
    <View style={styles.contentView}>
      <StatusBar style="auto" />
      <Routes>
        <Route path="/" element={<Courses />} />
        <Route path="/:id" element={<CourseDetail />} />
        <Route path="/:id/edit" element={<EditCourse />}  errorElement={<ErrorBoundary />} />
        <Route path="*" element={<ErrorBoundary />}  />
      </Routes>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  flexRow: {
    flexDirection: "row",
  },
  input: {
    borderColor: "#4630eb",
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    height: 48,
    margin: 16,
    padding: 8,
  },
  listArea: {
    backgroundColor: "#f0f0f0",
    flex: 1,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    marginBottom: 8,
  },
  contentView: {
    flex: 1,
  },
});
