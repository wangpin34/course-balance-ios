import { ScrollView, Alert } from "react-native";
import { Modal, Text, View } from 'react-native-ui-lib'
import Course from "./course";
import { useState, useEffect } from "react";
import { Route, useNavigate } from "react-router-native";
import Head from './head'
import Add from "./add";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import { coursesState, currentCourseIdState } from "../states";
import CourseDetail from './course-detail'
import { Course as CourseType } from "../types";
import db, { getAll } from "../db";

function Courses() {
  const [currentCourseId, setCurrentCourseId] = useRecoilState(currentCourseIdState)
  const [courses, setCourses] = useRecoilState(coursesState);
  const isVisible = currentCourseId !== null;
  useEffect(() => {
    (async () => {
      try {
        const courses = await getAll();
        setCourses(courses);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
  return (
    <>
    <View flex>
      <Head title={`课程(${courses?.length})`} />
      <ScrollView marginH-16 marginV-16 bg-grey70>
        {courses.map((course) => (
          <Course key={course.id} course={course} />
        ))}
      </ScrollView>
      <Add />
    </View>
    </>
  );
}



export default Courses;
