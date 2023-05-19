export interface Course {
  id: number
  name: string
  total: number
  consumed: number
}

export interface Activity {
  id: number
  name: string
  value: number
  created_at: string
  course_id: number
}