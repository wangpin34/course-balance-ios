import { DataSource } from "typeorm";
import Course from "./entities/course";

const AppDataSource = new DataSource({
  database: "course",
  type: 'expo',
  driver: require('expo-sqlite'),
  logging: ["error", "query", "schema"],
  synchronize: true,
  entities: [Course],
});

export default AppDataSource;
