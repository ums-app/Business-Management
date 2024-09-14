const APIEndpoints = {
  redirecter: "",
  root: "http://localhost:5000/",
  students: {
    getAll: "api/v1/students?",
    find: "api/v1/students/find?",
    addStudent: "api/v1/students",

    getStudent: (id) => `api/v1/students/${id}`,
    getStudentHomePageData: (id) => `api/v1/students/${id}/home`,
    getStudentProfile: (id) => `api/v1/students/${id}/profile`,
    getStudentSubjects: (id) => `api/v1/students/${id}/subjects`,
    getStudentSubject: (id, subjectId) =>
      `api/v1/students/${id}/subjects/${subjectId}`,
    getStudentCurrentClassDetails: (id) =>
      `api/v1/students/${id}/current-class-details`,
    updateStudent: (id) => `api/v1/students/${id}`,
    deleteStudent: (id) => `api/v1/students/${id}`,
    updateStudentPayment: (studentId, paymentId) =>
      `api/v1/students/${studentId}/student-payments/${paymentId}`,
    addStudentPaymentInstallment: (studentId, paymentId) =>
      `api/v1/students/${studentId}/student-payments/${paymentId}/payments-installments`,
    deleteOrUpdateStudentPaymentInstallment: (
      studentId,
      paymentId,
      paymentInstallmentId
    ) =>
      `api/v1/students/${studentId}/student-payments/${paymentId}/payments-installments/${paymentInstallmentId}`,
    studentClasses: (studentId) => `api/v1/students/${studentId}/classes`,
    studentClassDetails: (studentId, classId) =>
      `api/v1/students/${studentId}/classes/${classId}`,
    teachers: (studentId) => `api/v1/students/${studentId}/teachers`,
  },
  posts: {
    getAllPostsForStudent: "api/v1/posts/student",
    getAllPostsForAdmin: "api/v1/posts/?",
    getPost: "api/v1/posts/",
    addPost: "api/v1/posts",
    update: (id) => "api/v1/posts/" + id,
    toggleHideShow: (id) => `api/v1/posts/${id}/hide-show`,
    deletePost: (id) => `api/v1/posts/${id}`,
  },
  fieldOfStudy: {
    getAll: "api/v1/faculties",
    getOne: (id) => "api/v1/faculties/" + id,
    depratments: (id) => "api/v1/faculties/" + id + "/departments",
    depratment: (facultyId, departmentId) =>
      `api/v1/faculties/${facultyId}/departments/${departmentId}`,
    semesters: (facultyId, departmentId) =>
      `api/v1/faculties/${facultyId}/departments/${departmentId}/semesters`,
    semester: (facultyId, departmentId, semesterId) =>
      `api/v1/faculties/${facultyId}/departments/${departmentId}/semesters/${semesterId}`,
    subjects: (facultyId, departmentId, semesterId) =>
      `api/v1/faculties/${facultyId}/departments/${departmentId}/semesters/${semesterId}/subjects`,
    subject: (facultyId, departmentId, semesterId, subjectId) =>
      `api/v1/faculties/${facultyId}/departments/${departmentId}/semesters/${semesterId}/subjects/` +
      subjectId,
  },
  login: {
    login: "api/v1/auth/login",
    update: "api/v1/auth/update-user",
    checkPassword: "api/v1/auth/check-password",
    roles: (email) => `api/v1/users/${email}/roles`,
    lock: (email) => `api/v1/users/${email}/disable`,
    unlock: (email) => `api/v1/users/${email}/enable`,
    delete: (email) => `api/v1/users/${email}`,
  },
  attendances: {
    addAttendance: "api/v1/attendances",
    getStudentAttendances: (classId, subjectId) =>
      `api/v1/attendances/classes/${classId}/subjects/${subjectId}`,
    updateStudentAttendances: (classId, subjectId, attendanceId) =>
      `api/v1/attendances/classes/${classId}/subjects/${subjectId}/attendances/${attendanceId}`,
  },
  subjects: {
    subjectSearch: "api/v1/subjects/search?",
  },
  teachers: {
    teachers: "api/v1/teachers",
    teachersByFacultyId: (facultyId) =>
      `api/v1/teachers?facultyId=${facultyId}`,
    teacher: (id) => `api/v1/teachers/${id}`,
    getTeacherProfile: (id) => `api/v1/teachers/${id}/profile`,
    teacherSubjects: (teacherId) => `api/v1/teachers/${teacherId}/subjects`,
    teacherSubject: (teacherId, classId, subjectId) =>
      `api/v1/teachers/${teacherId}/classes/${classId}/subjects/${subjectId}`,
    teacherProfileForStudent: (id) =>
      `api/v1/teachers/${id}/profile-for-student`,
    teacherTeamateTeachers: (id) =>
      `api/v1/teachers/${id}/same-faculty-teachers`,
    teacherTeamateTeacher: (id, teacherId) =>
      `api/v1/teachers/${id}/same-faculty-teachers/${teacherId}`,
  },
  staffs: {
    staffs: "api/v1/staffs",
    staff: (id) => `api/v1/staffs/${id}`,
  },
  library: {
    book: (bookId) => `api/v1/library/books/${bookId}`,
    books: `api/v1/library/books`,
  },
  job: {
    jobs: `api/v1/jobs`,
    job: (jobId) => `api/v1/jobs/${jobId}`,
  },
  financial: {
    teacherContracts: `api/v1/financial-affairs/teacher-contracts`,
    teacherContract: (id) => `api/v1/financial-affairs/teacher-contracts/${id}`,
    staffContracts: `api/v1/financial-affairs/staff-contracts`,
    staffContract: (contractId) =>
      `api/v1/financial-affairs/staff-contracts/${contractId}`,
    defaultContractConditions: `api/v1/financial-affairs/default-contract-conditions`,
    defaultContractCondition: (defConId) =>
      `api/v1/financial-affairs/default-contract-conditions/${defConId}`,
  },
  files: {
    bookDoc: (bookId) => `/api/v1/files/library/books/${bookId}/document`,
    bookCover: (bookId) => `/api/v1/files/library/books/${bookId}/cover`,
    channelIcon: (channelId) => `files/channels/${channelId}/icon`,
    teacherProfile: (teacherId) => `files/teacher-profiles/${teacherId}`,
    studentProfile: (studentId) => `files/student-profiles/${studentId}`,
    staffProfile: (staffId) => `files/staff-profiles/${staffId}`,
    bookFiles: (bookId) => `/api/v1/files/library/books/${bookId}`,
  },
  classes: {
    classes: "api/v1/classes",
    classScoreSheet: (classId) => `api/v1/classes/${classId}/score-sheets`,
    getAllActiveClasses: "api/v1/classes/active",
    class: (classId) => `api/v1/classes/${classId}`,
    getClassesBySemesterId: (semesterId, page, size) =>
      `api/v1/classes?semesterId=${semesterId}&page=${page}&size=${size}`,
    creditSheets: (classId, confirmed, printed) => `api/v1/credit-sheets?classId=${classId}&confirmed=${confirmed}&printed=${printed}`
  },
  constants: {
    courseCategories: "api/v1/constants/course-categories",
    paymentStatus: "api/v1/constants/payment-status",
    relationNames: "api/v1/constants/relation-names",
    maritalStatus: "api/v1/constants/marital-status",
    genders: "api/v1/constants/genders",
    examTypes: "api/v1/constants/exam-types",
    attendancesStatus: "api/v1/constants/attendance-status",
    educationDegrees: "api/v1/constants/education-degrees",
    sections: "api/v1/constants/sections",
    complaintTypes: "api/v1/constants/complaints-suggestions",
    complaintStatus: "api/v1/constants/complaints-status",
    eventTypes: "api/v1/constants/event-types",
    userTypes: "api/v1/constants/user-types",
  },
  wordSuggestion: {
    student: (word, size) =>
      `api/v1/word-suggestions/students?word=${word}&size=${size}`,
    teacher: (word, size) =>
      `api/v1/word-suggestions/teachers?word=${word}&size=${size}`,
    staff: (word, size) =>
      `api/v1/word-suggestions/staffs?word=${word}&size=${size}`,
  },
  times: {
    times: "api/v1/times",
    timesFilter: (facultyId) => "api/v1/times?facultyId=" + facultyId,
    time: (id) => `api/v1/times/${id}`,
  },
  schedules: {
    addOneTeacherSubjectSchedule: (teacherId) =>
      `api/v1/schedules/teachers/${teacherId}/study-schedules`,
    getTeacherStudySchedule: (teacherId) =>
      `api/v1/schedules/teachers/${teacherId}/study-schedules`,
    updateOneTeacherSubjectSchedule: (teacherId, scheduleId) =>
      `api/v1/schedules/teachers/${teacherId}/study-schedules/${scheduleId}`,
    designTeacherStudySchedules: (facultyId, teacherId) =>
      `api/v1/schedules/faculties/${facultyId}/teachers/${teacherId}/study-schedules`,
    checkScheduleConflict: (weekDay, timeId, subjectId) =>
      `api/v1/schedules/study-schedules/check-conflict?day=${weekDay}&timeId=${timeId}&subjectId=${subjectId}`,
    //  getTeacherScheduleByTeacherId: (teacherId) => `teachers/${teacherId}/study-schedules`
    studentSchedule: (id) => `api/v1/schedules/students/${id}/study-schedules`,
    facultySchedule: (id) => `api/v1/schedules/faculties/${id}/study-schedule`,
    examScheduleConfiguration: (facultyId, examType) => `api/v1/schedules/exam-schedules-configs?facultyId=${facultyId}&examType=${examType}`,
    addExamScheduleConfiguration: `api/v1/schedules/exam-schedules-configs`,
    updateExamScheduleConfiguration: (configId) => `api/v1/schedules/exam-schedules-configs/${configId}`,
    getFacultyExamSchedule: (id, examType) => `api/v1/schedules/faculties/${id}/exam-schedules/${examType}`,
    classExamSchedule: (id, examType) => `api/v1/schedules/classes/${id}/exam-schedules/${examType}`,
  },
  settings: {
    settings: "api/v1/settings",
    universityInfo: "api/v1/settings/university-info",
  },
  complaints: {
    complaints: "api/v1/complaints",
    userCompaints: "api/v1/complaints/user-complaints",
    userCompaint: (id) => "api/v1/complaints/user-complaints/" + id,
    filterComplaints: (params, page, size) =>
      `api/v1/complaints?${params}&page=${page}&size=${size}`,
    updateComplaintStatus: (id) => `api/v1/complaints/${id}`,
  },
  creditSheet: {
    submitByStudent: (creditSheetId, studentId) =>
      `api/v1/credit-sheets/${creditSheetId}/submit-by-student/${studentId}`,
    creditSheets: (classId, studentId) => `api/v1/credit-sheets/search?classId=${classId}&studentId=${studentId}`
  },
  events: {
    events: "api/v1/events",
    oneEvent: (id) => "api/v1/events/" + id,
  },
  articles: {
    articles: "api/v1/articles",
    articlesForTeacher: (page, size) =>
      `api/v1/articles/for-teachers?page=${page}&size=${size}`,
    articlesForFollower: (page, size) =>
      `api/v1/articles/for-followers?page=${page}&size=${size}`,
    articlesForAdmin: (facultyId, finished, published, page, size) =>
      `api/v1/articles/for-admin?facultyId=${facultyId}&finished=${finished}&published=${published}&page=${page}&size=${size}`,
    article: (id) => "api/v1/articles/" + id,
    articleLike: (id) => "api/v1/articles/" + id + "/like",
    finished: (id) => "api/v1/articles/" + id + "/finished",
    unfinished: (id) => "api/v1/articles/" + id + "/unfinished",
    publish: (id) => "api/v1/articles/" + id + "/publish",
    unPublish: (id) => "api/v1/articles/" + id + "/un-publish",
    comments: (articleId, page, size) => `api/v1/articles/${articleId}/comments?page=${page}&size=${size}`,
    addComment: (articleId) => `api/v1/articles/${articleId}/comments`,
    comment: (articleId, articleCommentId) => `api/v1/articles/${articleId}/comments/${articleCommentId}`,
    replies: (articleId, articleCommentId) => `api/v1/articles/${articleId}/comments/${articleCommentId}/replies`,
    reply: (articleId, articleCommentId, replyId) => `api/v1/articles/${articleId}/comments/${articleCommentId}/replies/${replyId}`,
    likeComment: (articleId, articleCommentId) => `api/v1/articles/${articleId}/comments/${articleCommentId}/like`,
    addToFavorite: (articleId) => `api/v1/articles/${articleId}/add-to-favorite`,
    removeFromFavorite: (articleId) => `api/v1/articles/${articleId}/remove-from-favorite`,
    favoriteArticles: (page, size) => `api/v1/articles/favorite?page=${page}&size=${size}`
  },
  users: {
    follow: (id) => `api/v1/users/${id}/follow`,
    unFollow: (id) => `api/v1/users/${id}/un-follow`,
  },
  userReviews: {
    teachers: "api/v1/user-reviews/teachers",
    userReview: (id) => "api/v1/user-reviews/teachers/" + id,
  },
  notifications: {
    getAllUnSeenNotification: (page, size) => `api/v1/notifications?page=${page}&size${size}`,
    countAllUnSeenNotification: `api/v1/notifications/counts`
  }
};

export default APIEndpoints;
