import { useMemo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-native";
import { Pressable } from "react-native";
import ContextMenu from "react-native-context-menu-view";
import {
  Text,
  View,
  Button,
  Spacings,
  Typography,
  Shadows,
  Card,
  ActionSheet,
} from "react-native-ui-lib";
import { remove, consume } from "../db";
import { coursesState } from "../states";
import { useSetRecoilState } from "recoil";
import { Course } from "../types";

interface Props {
  course: Course;
}

export default function CourseItem({ course }: Props) {
  const navigate = useNavigate();
  const { id, name, total, consumed } = course;
  const balance = total - consumed;
  const setCourses = useSetRecoilState(coursesState);
  const [showActions, setShowActions] = useState<boolean>(false);
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

  const handleConsume = useCallback(async () => {
    try {
      const updated = await consume(id, 1);
      console.log(`updated:${updated}`);
      if (updated) {
        setCourses((courses) => {
          const index = courses.findIndex((course) => course.id === id);
          const oldCourse = courses[index];
          const newCourse = { ...oldCourse, consumed: consumed + 1 };
          const _courses = [...courses];
          _courses[index] = newCourse;
          return _courses;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [id, consumed]);

  return (
    <>
      <Pressable
        onPress={() => {
          navigate(`/${id}`);
        }}
        onLongPress={() => {
          setShowActions(true);
        }}
      >
        <Card
          flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginH-20
          marginV-20
          padding-20
        >
          <Text blue30 text40 fontWeight-200>
            {name}
          </Text>
          <Text text60 style={{ fontWeight: 200, color: "#bbbbbb" }}>
            {balance < 1 ? "已全部消费" : ` 剩余${balance}`}
          </Text>
          <Button
            label="消费"
            size={Button.sizes.medium}
            onPress={() => handleConsume()}
            style={{ justifySelf: "flex-end" }}
          />

          {/* <Button title="删除" color="#ff0000" onPress={handleRemove} /> */}
        </Card>
      </Pressable>
      <ActionSheet
        visible={showActions}
        title={"更多操作"}
        showCancelButton
        onDismiss={() => setShowActions(false)}
        options={[
          { label: "编辑", onPress: () => navigate(`/${id}/edit`) },
          { label: "删除", onPress: () => handleRemove() },
        ]}
        // renderAction={(option, index, onOptionPress) => {
        //   return (
        //     <Pressable
        //       onPress={() => {
        //         onOptionPress();
        //       }}
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
