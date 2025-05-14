# NovaLearn Backend – Services Overview

This folder contains all business logic for the NovaLearn backend, split by domain.  
Each service handles a single responsibility and is used by one or more controllers.

---

## 📌 Service Index

### 🔐 `authService.ts`
Handles authentication:
- Register
- Login
- Token validation
- Password reset

Used by: `authController.ts`

---

### 👤 `userService.ts`
General user utilities:
- Fetching profiles
- Updating base user info

Used by: `profileController.ts`

---

### 🎓 `instructorService.ts`
Handles instructor-specific features:
- Instructor application (`applyForInstructor`)
- Application status (`getStatus`)
- Instructor dashboard stats

Used by: `instructorController.ts`

---

### 🧑‍🎓 `studentService.ts` *(optional future)*
Not currently a file — handled through:
- `enrollmentService.ts`
- `quizAttemptService.ts`

---

### 📚 `courseService.ts`
Handles:
- Course creation
- Public course browsing
- Course updates/deletion by instructors

Used by: `courseController.ts`

---

### 🧾 `enrollmentService.ts`
Tracks:
- Student enrollments
- Lesson progress per student
- Enrolled course list

Used by: `studentController.ts`

---

### 🧠 `quizService.ts`
Instructor-side quiz management:
- Create/update/delete quizzes
- Fetch quiz by ID or slug

Used by: `quizController.ts`

---

### 📝 `quizAttemptService.ts`
Student-side quiz logic:
- Submitting answers
- Calculating score
- Storing attempts
- Fetching quiz history

Used by: `studentController.ts`

---

### 🛡️ `adminService.ts`
Admin-only logic:
- Promote student → instructor
- Approve/reject instructors
- Promote user → admin
- Search users by role

Used by: `adminController.ts`

---

## ✅ Conventions

- All services return plain data objects (not Express responses)
- All services are used by controllers only — no direct use in routes
- Mongoose models are imported and queried here

