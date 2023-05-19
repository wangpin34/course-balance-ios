import React, { useCallback, useState } from "react";
import { Link } from "react-router-native";
import { Pressable, Text, View, Alert, StyleSheet } from "react-native";
import { Modal, Card, TextField, Button } from "react-native-ui-lib";
import * as Yup from "yup";
import Constants from "expo-constants";
import db, { create } from "../db";
import { coursesState } from "../states";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useSetRecoilState,
} from "recoil";

const schema = Yup.object().shape({
  name: Yup.string().required("必填项").min(1, "最少输入1个字符"),
  total: Yup.number().min(1, "课时必须大于0").required("必填项"),
});

function Add() {
  const [show, setShow] = useState(false);
  const setCourses = useSetRecoilState(coursesState);
  const [name, setName] = useState<string>();
  const [total, setTotal] = useState<string>();
  const clearInput = useCallback(() => {
    setName(undefined);
    setTotal(undefined);
  }, []);
  const onAdd = useCallback(() => {
    const asyncAdd = async ({
      name,
      total,
    }: {
      name: string;
      total: number;
    }) => {
      const course = await create({ name, total });
      setCourses((all) => [...all, course]);
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
    <>
      <Button
        label="添加课程"
        size={Button.sizes.medium}
        fullWidth={false}
        onPress={() => setShow(true)}
      />
      <Modal animationType="slide" visible={show} onDismiss={onCancel}>
        <View style={{ paddingTop: Constants.statusBarHeight }}>
          <Modal.TopBar
            title="添加课程"
            onCancel={onCancel}
            doneLabel="完成"
            onDone={onAdd}
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
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default Add;
