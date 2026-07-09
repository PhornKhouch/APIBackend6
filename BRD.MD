# Topic : SMS - Student Management System 
I. Introduction 


II. Scope
   Admin Portal
        Manage Students: Register, update profiles, assign to classes, track active/inactive status.

        Manage Teachers: Profile creation, assignment to specific subjects and classes.

        Manage Classes: Create classrooms, academic years, semesters, and schedules.

        Manage Subjects: Define course catalogs, descriptions, and prerequisites.

        Manage Student Payments: Track tuition fees, generate invoices, record payment history, and flag overdue balances.

        Manage Reports: Export system-wide data (financial reports, overall pass/fail rates, school-wide attendance metrics).

        Manage Users & Roles: Handle authentication, password resets, and permission settings for Admin vs. Teacher roles.

        Generate Certifications: Issue automated completion certificates, transcripts, or letters of recommendation based on grading data.

        Attendance Oversight: View global attendance data and manage master attendance records.

        Teacher Portal
        Dashboard: View personal teaching schedule and quick stats (total students, upcoming classes).

        Attendance Module: Mark and edit daily student attendance for assigned classes.

        Gradebook Module: Input, edit, and publish student marks/grades for specific subjects.

        Course Management: Upload basic lesson outlines, resources, and set homework tasks.

        Student Roster View: View profiles and emergency contact details of students enrolled in their classes.

    #out of scope 
    - student 
    9 . Attendance class 



III. Feature 
        Complete System Feature List
        1. Authentication & Security (RBAC)
            Role-Based Access Control (RBAC): Strict separation of menus and API endpoints between Admins and Teachers.

            User Management: Admin can create accounts, reset forgotten passwords, and activate/deactivate staff accounts.

            Session Management: Secure JWT-based login with auto-expiration for security.

        2. Admin Module Features
        Student Information Management (SIM):

        Create, Read, Update, Delete (CRUD) student profiles (Name, DOB, Gender, Photo, Contact, Emergency Contact).

        Assign or transfer students to specific classes/sections.

        Teacher Management:

        CRUD teacher profiles (Specialization, Bio, Contact, Hire Date).

        Assign teachers to subjects and specific class sections.

        Academic Structure Management:

        Class & Section Setup: Define academic years, semesters, room numbers, and maximum capacities.

        Subject Setup: Define subjects, course codes, and descriptions.

        Scheduling/Timetable: Link a Teacher, a Subject, a Class, and a Time Slot together.

        Billing & Student Payment System:

        Fee Configuration: Define tuition fees per class or per semester.

        Invoice Generation: Automatically create invoices when a student enrolls.

        Payment Recording: Manually log cash, ABA/bank transfers, or check payments (with receipt uploads).

        Status Tracking: Track Paid, Partial, and Overdue statuses with automatic late balance calculation.

        Certification & Transcript Generator:

        Automated template matching that pulls student names, final grades, and completion dates into a clean PDF certificate.

        Master Attendance & Reports:

        View school-wide daily/monthly attendance statistics.

        Export financial summaries (Income reports, outstanding debts) and academic metrics (Pass/Fail ratios) to Excel or PDF.

        3. Teacher Module Features
        Teacher Dashboard:

        A snapshot of today’s teaching schedule, total active classes, and quick alerts for pending attendance.

        Digital Roster & Class View:

        View list of students enrolled in their assigned classes with basic profile details.

        Smart Attendance Management:

        Daily Roll Call Grid: A quick interface (Checkboxes/Radio buttons) to mark students as Present, Absent, Late, or Excused.

        Attendance History: Edit attendance records within a specific time window (e.g., within 48 hours).

        Gradebook & Assessment System:

        Weight Configuration: Define grading criteria (e.g., Attendance 10%, Midterm 40%, Final Exam 50%).

        Bulk Grade Entry: A spreadsheet-like interface to rapidly enter scores for assignments, quizzes, and exams.

        Auto-Calculation: System automatically computes final GPA or Letter Grades based on the weight rules.

        Lesson & Resource Management:

        Upload lesson plans, syllabus guidelines, and homework descriptions (for internal teacher tracking and administrative transparency).


IV. Conclusion


Tech Stack : 
Frontend : HTML CSS Javascript
Backend : Node js , Express , MYSQl DB 

Deployment 
    API : Railway PlateForm
    Frontend : Vercel , Netlify


