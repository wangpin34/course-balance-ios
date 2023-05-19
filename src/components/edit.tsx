import React, { useCallback, useState } from "react";
import { Link, useParams } from "react-router-native";
import { Pressable, Text, View, Alert, StyleSheet } from "react-native";
import { Modal, Card, TextField, Button } from "react-native-ui-lib";
import * as Yup from "yup";
import Constants from "expo-constants";
import { update } from "../db";
import { coursesState } from "../states";
import {
  
  useRecoilState,
} from "recoil";

const schema = Yup.object().shape({
  name: Yup.string().required("必填项").min(1, "最少输入1个字符"),
  total: Yup.number().min(1, "课时必须大于0").required("必填项"),
});

function Edit() {
  const { id: _id } = useParams()
  const id = parseInt(_id)
  const [show, setShow] = useState(false);
  const [courses, setCourses] = useRecoilState(coursesState);
  const course = courses.find(c => c.id === id)
  const [name, setName] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const clearInput = useCallback(() => {
    setName(undefined);
    setTotal(undefined);
  }, []);
  const onUpdate = useCallback(async () => {
    const asyncAdd = async ({
      name,
      total,
    }: {
      name: string;
      total: number;
    }) => {
      await update(id, { name, total });
      setCourses((courses) => {
      const index = courses.findIndex((course) => course.id === id);
      const newCourse = {
        ...course,
        name,
        total,
      };
      const _courses = [...courses];
      _courses[index] = newCourse;
      return _courses;
    });
    };

    if (schema.isValidSync({ name, total })) {
      asyncAdd({ name, total: parseInt(total) });
      setShow(false);
      clearInput();
    } else {
      Alert.alert("输入错误");
    }
  }, [name, total, clearInput]);

  const onCancel = useCallback(() => {
    setShow(false);
    clearInput();
  }, [clearInput]);

  return (
      <Modal animationType="slide" visible={show} onDismiss={onCancel}>
        <View style={{ paddingTop: Constants.statusBarHeight }}>
          <Modal.TopBar
            title="修改课程"
            onCancel={onCancel}
            doneLabel="完成"
            onDone={onUpdate}
          />

          <View>
            <Card margin-16 padding-24>
              <TextField
                label="课程"
                onChangeText={(value) => setName(value)}
                value={name}
                placeholder="课程"
                floatingPlaceholder
                keyboardType="default"
                validateOnBlur
                validateOnChange
                enableErrors
                validate={["required"]}
                validationMessage={["Field is required"]}
              />
              <TextField
                label="课时"
                onChangeText={(value) => setTotal(value)}
                value={total}
                placeholder="课时总量"
                floatingPlaceholder
                validateOnBlur
                validateOnChange
                keyboardType="numeric"
                enableErrors
                validate={["required"]}
                validationMessage={["Field is required"]}
              />
            </Card>
          </View>
        </View>
      </Modal>
  );
}

export default Edit;
