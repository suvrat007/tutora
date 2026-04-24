export const BASE_URL = "http://localhost:8000/";
// export const BASE_URL = 'https://tutora-1.onrender.com';

export const API = {
  // Auth
  GOOGLE_AUTH: "/api/auth/google-auth",
  SIGNUP: "/api/auth/signup",
  LOGOUT: "/api/auth/logout",

  // Admin
  GET_ADMIN: "/api/admin/get",
  UPDATE_ADMIN: "/api/admin/update",

  // Batch
  ADD_BATCH: "/api/batch/add-new-batch",
  GET_ALL_BATCHES: "/api/batch/get-all-batches",
  UPDATE_BATCH: (id) => `/api/batch/update-batch/${id}`,
  DELETE_BATCH: (id) => `/api/batch/delete-batch/${id}`,
  GET_BATCH: (id) => `/api/batch/get-batch/${id}`,

  // Student
  ADD_STUDENT: "/api/student/add-new-student",
  GET_STUDENTS_GROUPED: "/api/student/get-students-grouped-by-batch",
  DELETE_STUDENT: (id) => `/api/student/delete-student/${id}`,
  UPDATE_STUDENT: (id) => `/api/student/update-student/${id}`,
  FEES_DASHBOARD: "/api/student/fees/dashboard-summary",
  FEES_LIST: "/api/student/fees/list",
  BULK_UPDATE_FEE: "/api/student/bulk-update-fee-status",
  ATTENDANCE_SUMMARY: "/api/student/attendance/summary",

  // Class Logs
  ADD_CLASS_UPDATES: "/api/classLog/add-class-updates",
  GET_ALL_CLASSLOGS: "/api/classLog/getAllClasslogs",
  TODAY_PENDING: "/api/classLog/today-pending",
  MARK_ATTENDANCE: "/api/classLog/mark-attendance",
  ATTENDANCE_STATUS: "/api/classLog/attendance-status",

  // Reminders
  ADD_REMINDER: "/api/reminder/add-reminder",
  GET_REMINDERS: "/api/reminder/get-reminder",
  DELETE_REMINDER: (id) => `/api/reminder/delete-reminder/${id}`,

  // Tests
  CREATE_TEST: "/api/test/createTest",
  GET_ALL_TESTS: "/api/test/getAllTests",
  UPDATE_TEST: (id) => `/api/test/updateTest/${id}`,
  DELETE_TEST: (id) => `/api/test/${id}`,

  // Teachers
  ADD_TEACHER: "/api/teacher/add",
  GET_ALL_TEACHERS: "/api/teacher/all",
  UPDATE_TEACHER: (id) => `/api/teacher/update/${id}`,
  DELETE_TEACHER: (id) => `/api/teacher/delete/${id}`,

  // Institute
  GET_INSTITUTE: "/api/institute/get",
  UPDATE_INSTITUTE: "/api/institute/update",
};

export const TEST_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const CLASS_STATUS = {
  CONDUCTED: "Conducted",
  CANCELLED: "Cancelled",
  NO_DATA: "No data recorded",
};

export const FEE_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
};
