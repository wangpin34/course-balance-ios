import { useMemo, useCallback, useEffect, useState } from "react";
import Constants from "expo-constants";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { ScrollView, FlatList, Alert, Pressable } from "react-native";
import {
  View,
  TextField,
  Text,
  Button,
  Modal,
  Card,
  ListItem,
  ActionSheet,
} from "react-native-ui-lib";
import { useParams, useNavigate } from "react-router-native";
import { remove, consume, getAllActivities, get } from "../db";
import { coursesState } from "../states";
import { Activity } from "../types";
import { useRecoilState } from "recoil";
import useAsyncData, { Status } from "../hooks/useAsyncData";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import * as Yup from "yup";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.locale("zh-cn");

function getActivities(signal: AbortSignal, id: number) {
  return getAllActivities(id);
}

function getCourse(signal: AbortSignal, id: number) {
  return get(id);
}

function ActivityItem({ item: activity }: { item: Activity }) {
  const createdAt = parseInt(activity.created_at);
  return (
    <ListItem bg-white height={48}>
      <View flex left paddingH-16>
        <Text>
          消费{activity.value}课时，于 {dayjs(createdAt).format("MMMM D")},{" "}
          {dayjs().to(dayjs(createdAt))}
        </Text>
      </View>
    </ListItem>
  );
}

const consumeValueSchema = Yup.number().min(1).required();

function CustomConsume({ onSave }: { onSave: (value: number) => void }) {
  const [value, setValue] = useState<string>();
 
  const [show, setShow] = useState<boolean>(false);
  const handleCancel = useCallback(() => {
    setValue(undefined);
    setShow(false);
  }, []);

  return (
    <>
      <Button
        link
        text70
        label="自定义消费"
        marginT-20
        onPress={() => setShow(true)}
      />

      <Modal visible={show} animationType="slide" onDismiss={handleCancel}>
        <View style={{ paddingTop: Constants.statusBarHeight }}>
          <Modal.TopBar
            title="自定义消费"
            onCancel={handleCancel}
            cancelIcon={null}
            cancelLabel="返回"
          />
          <Card margin-16 padding-24>
            <TextField
              label="课时"
              onChangeText={(value) => setValue(value)}
              value={value}
              placeholder="课时总量"
              floatingPlaceholder
              validateOnBlur
              validateOnChange
              keyboardType="numeric"
              enableErrors
              validate={["required", (v) => v > 0]}
              validationMessage={["必填项", "必须大于 0"]}
            />
            <Button
              onPress={() => {
                if (consumeValueSchema.isValidSync(value)) {
                  onSave(parseInt(value));
                  setShow(false);
                } else {
                  Alert.alert("输入错误");
                }
              }}
              label="确认"
            />
          </Card>
        </View>
      </Modal>
    </>
  );
}

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id: _id } = useParams();
  const id = parseInt(_id);
   const [showActions, setShowActions] = useState<boolean>(false);
  const [courses, setCourses] = useRecoilState(coursesState);
  const [course, loadingCourse] = useAsyncData(getCourse, [id], {
    default: courses.find((c) => c.id === id),
  });
  const [activities, { reload: reloadActivities }] = useAsyncData(
    getActivities,
    [id]
  );

  const balance = course.total - course.consumed;

  const handleRemove = useCallback(async () => {
    try {
      const removed = await remove(id);
      if (removed) {
        setCourses((courses) => {
          const index = courses.findIndex((course) => course.id === id);
          const _courses = [...courses];
          _courses.splice(index, 1);
          return _courses;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const handleConsume = useCallback(
    async (value: number) => {
      try {
        const updated = await consume(id, value);
        if (updated) {
          setCourses((courses) => {
            const index = courses.findIndex((course) => course.id === id);
            const oldCourse = courses[index];
            const newCourse = {
              ...oldCourse,
              consumed: course.consumed + value,
            };
            const _courses = [...courses];
            _courses[index] = newCourse;
            return _courses;
          });
        }
        await reloadActivities();
      } catch (err) {
        console.error(err);
      }
    },
    [id, course.consumed]
  );

  return (
    <>
    <View flex>
      <Modal.TopBar
        title={course?.name}
        onCancel={() => navigate(-1)}
        cancelIcon={null}
        cancelLabel="返回"
        doneIcon={null}
        doneLabel="更多"
        onDone={() => setShowActions(true)}
      />
      <View flex left bg-grey70 padding-20>
        <View flex style={{ width: "100%"}}>
          <View flex style={{ width: "100%"}}>
            <View
              flex-grow-1
              style={{ backgroundColor: "#bbbbbb", width: "100%", padding: 20 }}
            >
              <View>
                <Text text20>{course.name}</Text>
                <Text text80>剩余{balance}课时</Text>
                {balance < 1 ? <Text>已全部消费</Text> : null}
              </View>
              <Text>8
                <Text>共</Text>
                <Text>{course.total}</Text>
                <Text>课时， 已消费</Text>
                <Text>{course.consumed}</Text>
                <Text>课时。</Text>
              </Text>
            </View>
             <FlatList data={activities} renderItem={ActivityItem} />
          </View>

          <View flex-grow-1>
            <Button
              link
              text70
              label="消费 1 课时"
              marginT-20
              onPress={() => handleConsume(1)}
            />

            <CustomConsume
              onSave={(value) => {
                handleConsume(value);
              }}
            />
          </View>
        </View>
      </View>
    </View>
     <ActionSheet
        visible={showActions}
        title={"更多操作"}
        showCancelButton
        cancelButtonIndex={2}
        onDismiss={() => setShowActions(false)}
        options={[
          { label: "编辑", onPress: () => navigate(`/${id}/edit`) },
          { label: "删除", onPress: () => handleRemove() },
          {label: "取消", onPress: () => setShowActions(false)},
        ]}
        // renderAction={(option, index, onOptionPress) => {
        //   return (
        //     <Pressable
        //       onPress={onOptionPress}
        //     >
        //       <View paddingV-8 paddingH-12>
        //         <Text
        //           text60
        //           style={{
        //             color: index === 1 ? "#ff0000" : "#4a5a6a",
        //             lineHeight: 30,
        //           }}
        //         >
        //           {option.label}
        //         </Text>
        //       </View>
        //     </Pressable>
        //   );
        // }}
      />
    </>
  );
}
