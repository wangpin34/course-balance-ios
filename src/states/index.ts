import { atom } from 'recoil'
import { Course } from '../types'

export const coursesState = atom<Course[]>({
  key: 'coursesState',
  default: []
})

export const currentCourseIdState = atom<number|null>({
  key: 'currentCourseIdState',
  default: null
})