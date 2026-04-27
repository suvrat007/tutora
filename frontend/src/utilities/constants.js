export const BASE_URL = '';

export const API = {
  // Auth
  GOOGLE_AUTH: 'auth/google-auth',
  SIGNUP: 'auth/signup',
  LOGOUT: 'auth/logout',

  // Admin
  GET_ADMIN: 'admin/get',
  UPDATE_ADMIN: 'admin/update',

  // Batch
  ADD_BATCH: 'batch/add-new-batch',
  GET_ALL_BATCHES: 'batch/get-all-batches',
  UPDATE_BATCH: (id) => `batch/update-batch/${id}`,
  DELETE_BATCH: (id) => `batch/delete-batch/${id}`,
  GET_BATCH: (id) => `batch/get-batch/${id}`,

  // Student
  ADD_STUDENT: 'student/add-new-student',
  GET_STUDENTS_GROUPED: 'student/get-students-grouped-by-batch',
  DELETE_STUDENT: (id) => `student/delete-student/${id}`,
  UPDATE_STUDENT: (id) => `student/update-student/${id}`,
  FEES_DASHBOARD: 'student/fees/dashboard-summary',
  FEES_LIST: 'student/fees/list',
  BULK_UPDATE_FEE: 'student/bulk-update-fee-status',
  ATTENDANCE_SUMMARY: 'student/attendance/summary',

  // Class Logs
  ADD_CLASS_UPDATES: 'classLog/add-class-updates',
  GET_ALL_CLASSLOGS: 'classLog/getAllClasslogs',
  TODAY_PENDING: 'classLog/today-pending',
  MARK_ATTENDANCE: 'classLog/mark-attendance',
  ATTENDANCE_STATUS: 'classLog/attendance-status',

  // Reminders
  ADD_REMINDER: 'reminder/add-reminder',
  GET_REMINDERS: 'reminder/get-reminder',
  DELETE_REMINDER: (id) => `reminder/delete-reminder/${id}`,

  // Tests
  CREATE_TEST: 'test/createTest',
  GET_ALL_TESTS: 'test/getAllTests',
  UPDATE_TEST: (id) => `test/updateTest/${id}`,
  DELETE_TEST: (id) => `test/${id}`,

  // Teachers
  ADD_TEACHER: 'teacher/add',
  GET_ALL_TEACHERS: 'teacher/all',
  UPDATE_TEACHER: (id) => `teacher/update/${id}`,
  DELETE_TEACHER: (id) => `teacher/delete/${id}`,

  // Institute
  GET_INSTITUTE: 'institute/get',
  UPDATE_INSTITUTE: 'institute/update',

  // Student self-registration
  REGISTER_INFO: (adminId) => `register/${adminId}/info`,
  REGISTER_SUBMIT: (adminId) => `register/${adminId}`,
  PENDING_STUDENTS: 'register/pending',
  APPROVE_PENDING: (id) => `register/pending/${id}/approve`,
  DENY_PENDING: (id) => `register/pending/${id}`,
};

export const TEST_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const CLASS_STATUS = {
  CONDUCTED: 'Conducted',
  CANCELLED: 'Cancelled',
  NO_DATA: 'No data recorded',
};

export const FEE_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
};
