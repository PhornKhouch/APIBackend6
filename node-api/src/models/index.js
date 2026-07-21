const sequelize = require("../config/dbconnectSeqeulize");

const User = require("./User");
const Teacher = require("./Teacher");
const Student = require("./Student");
const StudentEmergencyContact = require("./StudentEmergencyContact");
const AcademicYear = require("./AcademicYear");
const Semester = require("./Semester");
const Subject = require("./Subject");
const Class = require("./Class");
const ClassEnrollment = require("./ClassEnrollment");
const TimeSlot = require("./TimeSlot");
const Schedule = require("./Schedule");
const ScheduleStudent = require("./ScheduleStudent");
const AttendanceRecord = require("./AttendanceRecord");
const GradingCriteria = require("./GradingCriteria");
const Assessment = require("./Assessment");
const Grade = require("./Grade");
const FinalGrade = require("./FinalGrade");
const FeeStructure = require("./FeeStructure");
const Invoice = require("./Invoice");
const Payment = require("./Payment");
const Certificate = require("./Certificate");
const LessonResource = require("./LessonResource");

// users <-> teachers
User.hasOne(Teacher, { foreignKey: "user_id" });
Teacher.belongsTo(User, { foreignKey: "user_id" });

// students <-> student_emergency_contacts
Student.hasMany(StudentEmergencyContact, { foreignKey: "student_id" });
StudentEmergencyContact.belongsTo(Student, { foreignKey: "student_id" });

// academic_years <-> semesters
AcademicYear.hasMany(Semester, { foreignKey: "academic_year_id" });
Semester.belongsTo(AcademicYear, { foreignKey: "academic_year_id" });

// subjects self-reference (prerequisite)
Subject.belongsTo(Subject, { as: "Prerequisite", foreignKey: "prerequisite_subject_id" });
Subject.hasMany(Subject, { as: "Dependents", foreignKey: "prerequisite_subject_id" });

// classes
AcademicYear.hasMany(Class, { foreignKey: "academic_year_id" });
Class.belongsTo(AcademicYear, { foreignKey: "academic_year_id" });
Semester.hasMany(Class, { foreignKey: "semester_id" });
Class.belongsTo(Semester, { foreignKey: "semester_id" });
Teacher.hasMany(Class, { as: "HomeroomClasses", foreignKey: "homeroom_teacher_id" });
Class.belongsTo(Teacher, { as: "HomeroomTeacher", foreignKey: "homeroom_teacher_id" });

// class_enrollments (students <-> classes)
Student.hasMany(ClassEnrollment, { foreignKey: "student_id" });
ClassEnrollment.belongsTo(Student, { foreignKey: "student_id" });
Class.hasMany(ClassEnrollment, { foreignKey: "class_id" });
ClassEnrollment.belongsTo(Class, { foreignKey: "class_id" });

// schedules
Class.hasMany(Schedule, { foreignKey: "class_id" });
Schedule.belongsTo(Class, { foreignKey: "class_id" });
Subject.hasMany(Schedule, { foreignKey: "subject_id" });
Schedule.belongsTo(Subject, { foreignKey: "subject_id" });
Teacher.hasMany(Schedule, { foreignKey: "teacher_id" });
Schedule.belongsTo(Teacher, { foreignKey: "teacher_id" });
TimeSlot.hasMany(Schedule, { foreignKey: "time_slot_id" });
Schedule.belongsTo(TimeSlot, { foreignKey: "time_slot_id" });

// schedule_students (students assigned to a specific schedule entry)
Schedule.hasMany(ScheduleStudent, { foreignKey: "schedule_id" });
ScheduleStudent.belongsTo(Schedule, { foreignKey: "schedule_id" });
Student.hasMany(ScheduleStudent, { foreignKey: "student_id" });
ScheduleStudent.belongsTo(Student, { foreignKey: "student_id" });

// attendance_records
Schedule.hasMany(AttendanceRecord, { foreignKey: "schedule_id" });
AttendanceRecord.belongsTo(Schedule, { foreignKey: "schedule_id" });
Student.hasMany(AttendanceRecord, { foreignKey: "student_id" });
AttendanceRecord.belongsTo(Student, { foreignKey: "student_id" });
Teacher.hasMany(AttendanceRecord, { as: "MarkedAttendance", foreignKey: "marked_by" });
AttendanceRecord.belongsTo(Teacher, { as: "MarkedByTeacher", foreignKey: "marked_by" });

// grading_criteria
Subject.hasMany(GradingCriteria, { foreignKey: "subject_id" });
GradingCriteria.belongsTo(Subject, { foreignKey: "subject_id" });
Class.hasMany(GradingCriteria, { foreignKey: "class_id" });
GradingCriteria.belongsTo(Class, { foreignKey: "class_id" });

// assessments
GradingCriteria.hasMany(Assessment, { foreignKey: "criteria_id" });
Assessment.belongsTo(GradingCriteria, { foreignKey: "criteria_id" });
Class.hasMany(Assessment, { foreignKey: "class_id" });
Assessment.belongsTo(Class, { foreignKey: "class_id" });
Subject.hasMany(Assessment, { foreignKey: "subject_id" });
Assessment.belongsTo(Subject, { foreignKey: "subject_id" });
Teacher.hasMany(Assessment, { foreignKey: "teacher_id" });
Assessment.belongsTo(Teacher, { foreignKey: "teacher_id" });

// grades
Assessment.hasMany(Grade, { foreignKey: "assessment_id" });
Grade.belongsTo(Assessment, { foreignKey: "assessment_id" });
Student.hasMany(Grade, { foreignKey: "student_id" });
Grade.belongsTo(Student, { foreignKey: "student_id" });
Teacher.hasMany(Grade, { as: "EnteredGrades", foreignKey: "entered_by" });
Grade.belongsTo(Teacher, { as: "EnteredByTeacher", foreignKey: "entered_by" });

// final_grades
Student.hasMany(FinalGrade, { foreignKey: "student_id" });
FinalGrade.belongsTo(Student, { foreignKey: "student_id" });
Subject.hasMany(FinalGrade, { foreignKey: "subject_id" });
FinalGrade.belongsTo(Subject, { foreignKey: "subject_id" });
Class.hasMany(FinalGrade, { foreignKey: "class_id" });
FinalGrade.belongsTo(Class, { foreignKey: "class_id" });
Semester.hasMany(FinalGrade, { foreignKey: "semester_id" });
FinalGrade.belongsTo(Semester, { foreignKey: "semester_id" });

// fee_structures
Class.hasMany(FeeStructure, { foreignKey: "class_id" });
FeeStructure.belongsTo(Class, { foreignKey: "class_id" });
Semester.hasMany(FeeStructure, { foreignKey: "semester_id" });
FeeStructure.belongsTo(Semester, { foreignKey: "semester_id" });

// invoices
Student.hasMany(Invoice, { foreignKey: "student_id" });
Invoice.belongsTo(Student, { foreignKey: "student_id" });
FeeStructure.hasMany(Invoice, { foreignKey: "fee_id" });
Invoice.belongsTo(FeeStructure, { foreignKey: "fee_id" });
Semester.hasMany(Invoice, { foreignKey: "semester_id" });
Invoice.belongsTo(Semester, { foreignKey: "semester_id" });

// payments
Invoice.hasMany(Payment, { foreignKey: "invoice_id" });
Payment.belongsTo(Invoice, { foreignKey: "invoice_id" });
User.hasMany(Payment, { as: "RecordedPayments", foreignKey: "recorded_by" });
Payment.belongsTo(User, { as: "RecordedByUser", foreignKey: "recorded_by" });

// certificates
Student.hasMany(Certificate, { foreignKey: "student_id" });
Certificate.belongsTo(Student, { foreignKey: "student_id" });
User.hasMany(Certificate, { as: "IssuedCertificates", foreignKey: "issued_by" });
Certificate.belongsTo(User, { as: "IssuedByUser", foreignKey: "issued_by" });

// lesson_resources
Schedule.hasMany(LessonResource, { foreignKey: "schedule_id" });
LessonResource.belongsTo(Schedule, { foreignKey: "schedule_id" });
Teacher.hasMany(LessonResource, { foreignKey: "teacher_id" });
LessonResource.belongsTo(Teacher, { foreignKey: "teacher_id" });

module.exports = {
  sequelize,
  User,
  Teacher,
  Student,
  StudentEmergencyContact,
  AcademicYear,
  Semester,
  Subject,
  Class,
  ClassEnrollment,
  TimeSlot,
  Schedule,
  ScheduleStudent,
  AttendanceRecord,
  GradingCriteria,
  Assessment,
  Grade,
  FinalGrade,
  FeeStructure,
  Invoice,
  Payment,
  Certificate,
  LessonResource,
};
