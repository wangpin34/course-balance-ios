import * as SQLite from "expo-sqlite";
import { Course, Activity } from './types'

function openDatabase() {
  const db = SQLite.openDatabase("db.db");
  return db;
}

async function executeSqlAsync(tx: SQLite.SQLTransaction, sql: string, args: any[]) {
  return new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    console.log(`${sql} ${args}`)
    tx.executeSql(sql, args, (_, result) => {
      console.log(`${sql} done`)
      resolve(result)
    }, (_, err) => {
      console.error(`${sql} error`)
      reject(err)
      return true
    })
  })
}


export function initialize(db: SQLite.Database) {
  db.transaction((tx) => {
    tx.executeSql(`
    create table if not exists courses(
      id integer primary key not null,
      name text,
      total integer not NULL,
      consumed integer default 0)
    `);
    tx.executeSql(`
      create table if not exists activities(
        id integer primary key not null,
        activity text,
        value integer not null,
        created_at text not null,
        course_id integer not null,
        FOREIGN key(course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
  });
}

const db = openDatabase();

export async function getAll() {
  return new Promise<Course[]>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from courses", [], (_, { rows }) =>
          resolve(rows._array))
      },
      (err) => {
        reject(err)
      },
    );
  }) 
}

export async function get(id: number) {
  return new Promise<Course>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from courses where id = ?", [id], (_, { rows }) =>
          resolve(rows._array[0]))
      },
      (err) => {
        reject(err)
      },
    );
  })
}

export async function getAllActivities(id: number) {
  return new Promise<any[]>((resolve, reject) => {
    db.exec([{sql: "select * from activities where course_id = ? order by id desc", args: [id]}], false, (err, resultArr) => {
      if (err) {
        reject(err)
      } else {
        const result = resultArr[0]
        if ((result as SQLite.ResultSetError).error) {
          reject((result as SQLite.ResultSetError).error)
        } else {
          resolve((result as SQLite.ResultSet).rows)
        }
      }
    })
    
  })
}

export async function create({name, total}: {name: string, total}) {
  const id = await new Promise<number>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql("insert into courses (name, total) values (?, ?)", [name, total], (_, {insertId}) => {
          resolve(insertId)
        }, (err) => {
          reject(err)
          return false
        });
      },
      null,
    );
  }) 
  return get(id)
}

export async function update(id: number, changes: Record<string, string | number>) {
  const updateStatement = Object.keys(changes).map((key) => `${key} = ?`).join(', ');
  const updateArgs = Object.values(changes);
  return new Promise<boolean>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`update courses set ${updateStatement} where id = ?`, [...updateArgs, id], (_, {rowsAffected}) => {
          if (rowsAffected >= 1) {
            resolve(true)
          } else {
            resolve(false)
          }
        }, (tx, err) => {
          reject(err)
          return false
        });
      },
      null,
    );
  })
}

export async function consume(id: number, value: number) {
  return new Promise<boolean>((resolve, reject) => {
    db.transaction(
      (tx) => {
        (async () => {
          try {
            tx.executeSql(`update courses set consumed = consumed + ? where id = ?`, [value, id], null, null)
            console.log(`recording activity`)
            const result2 = await executeSqlAsync(tx, `insert into activities (activity, value, created_at, course_id) values (?, ?, ?, ?)`, ['consumed', value, Date.now(), id])
            console.log(`activity recorded`)
            console.log(JSON.stringify(result2))
            if (typeof result2.insertId === 'undefined') {
              throw 'failed to record activity'
            }
            resolve(true)
          } catch (err) {
            console.log(err)
            reject(err)
          }

        })()
      },
      (err) => {
        console.error(err)
      },
      () => {
        console.log(`transaction ok`)
      }
    );
  })
}

export async function remove(id: number) {
  return new Promise<boolean>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(`delete from courses where id = ?`, [id], (_, {rowsAffected}) => {
          if (rowsAffected >= 1) {
            resolve(true)
          } else {
            resolve(false)
          }
        }, (err) => {
          reject(err)
          return false
        });
      },
      null,
    );
  })
}
export default db;
