require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Faculty = require('../src/models/Faculty');
const Department = require('../src/models/Department');
const Course = require('../src/models/Course');
const Subject = require('../src/models/Subject');
const Attendance = require('../src/models/Attendance');
const Fee = require('../src/models/Fee');
const Timetable = require('../src/models/Timetable');
const Examination = require('../src/models/Examination');
const Result = require('../src/models/Result');
const Notification = require('../src/models/Notification');
const Placement = require('../src/models/Placement');
const { ROLES, ATTENDANCE_STATUS, FEE_STATUS } = require('../src/config/constants');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Faculty.deleteMany({}),
      Department.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Attendance.deleteMany({}),
      Fee.deleteMany({}),
      Timetable.deleteMany({}),
      Examination.deleteMany({}),
      Result.deleteMany({}),
      Notification.deleteMany({}),
      Placement.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    // Create PB Siddhartha College Departments
    const departments = await Department.insertMany([
      {
        name: 'Computer Science & Applications',
        code: 'CSA',
        description: 'Department of Computer Science & Applications (BCA & B.Sc CS)',
        status: 'active',
      },
      {
        name: 'Commerce & Business Administration',
        code: 'COM',
        description: 'Department of Commerce and Business Studies (B.Com & BBA)',
        status: 'active',
      },
      {
        name: 'Mathematics & Physical Sciences',
        code: 'MPS',
        description: 'Department of Mathematics, Physics, and Electronics',
        status: 'active',
      },
      {
        name: 'English & Humanities',
        code: 'ENG',
        description: 'Department of English, Economics, and Social Sciences',
        status: 'active',
      },
    ]);

    console.log('Created departments for PB Siddhartha College of Arts & Science');

    // Create 3-Year Undergraduate Courses (6 Semesters each)
    const courses = await Course.insertMany([
      {
        name: 'Bachelor of Computer Applications (BCA)',
        code: 'BCA',
        department: departments[0]._id,
        duration: 3,
        degree: 'Bachelor of Computer Applications',
        description: '3-Year (6 Semesters) Autonomous Program in Software Development, Cloud & AI',
        status: 'active',
      },
      {
        name: 'B.Sc Computer Science & Data Science',
        code: 'BSCDS',
        department: departments[0]._id,
        duration: 3,
        degree: 'Bachelor of Science',
        description: '3-Year (6 Semesters) Program in Computational Sciences and Big Data Analytics',
        status: 'active',
      },
      {
        name: 'B.Com Computer Applications & Honours',
        code: 'BCOMCA',
        department: departments[1]._id,
        duration: 3,
        degree: 'Bachelor of Commerce',
        description: '3-Year (6 Semesters) Autonomous Program in Advanced Accounting, Taxation & Fintech',
        status: 'active',
      },
      {
        name: 'Bachelor of Business Administration (BBA)',
        code: 'BBA',
        department: departments[1]._id,
        duration: 3,
        degree: 'Bachelor of Business Administration',
        description: '3-Year (6 Semesters) Professional Program in Management, HR & Marketing',
        status: 'active',
      },
      {
        name: 'B.Sc Mathematics, Physics & Computer Science (MPCs)',
        code: 'BSCMPCS',
        department: departments[2]._id,
        duration: 3,
        degree: 'Bachelor of Science',
        description: '3-Year (6 Semesters) Core Physical and Mathematical Sciences Program',
        status: 'active',
      },
    ]);

    console.log('Created 6-semester courses');

    // Create admin user
    const adminUser = await User.create({
      name: 'PB Siddhartha Admin',
      email: 'admin@pbsiddhartha.ac.in',
      username: 'admin',
      password: 'admin123',
      role: ROLES.ADMIN,
      department: departments[0]._id,
      status: 'active',
    });

    // Create faculty users
    const facultyHashedPassword = await bcrypt.hash('Faculty@123', 10);
    const facultyUsers = await User.insertMany([
      {
        name: 'Dr. K. Sridhar',
        email: 'faculty1@pbsiddhartha.ac.in',
        password: facultyHashedPassword,
        role: ROLES.FACULTY,
        department: departments[0]._id,
        status: 'active',
      },
      {
        name: 'Prof. V. Swapna',
        email: 'faculty2@pbsiddhartha.ac.in',
        password: facultyHashedPassword,
        role: ROLES.FACULTY,
        department: departments[0]._id,
        status: 'active',
      },
      {
        name: 'Dr. Ch. Venkateswarlu',
        email: 'faculty3@pbsiddhartha.ac.in',
        password: facultyHashedPassword,
        role: ROLES.FACULTY,
        department: departments[1]._id,
        status: 'active',
      },
      {
        name: 'Prof. G. Rama Krishna',
        email: 'faculty4@pbsiddhartha.ac.in',
        password: facultyHashedPassword,
        role: ROLES.FACULTY,
        department: departments[2]._id,
        status: 'active',
      },
      {
        name: 'Dr. T. Madhuri',
        email: 'faculty5@pbsiddhartha.ac.in',
        password: facultyHashedPassword,
        role: ROLES.FACULTY,
        department: departments[3]._id,
        status: 'active',
      },
    ]);

    console.log('Created faculty users');

    // Create faculty records
    const faculty = await Faculty.insertMany([
      {
        userId: facultyUsers[0]._id,
        employeeId: 'PBSFAC01',
        department: departments[0]._id,
        designation: 'Professor & Head of Department',
        qualification: 'PhD in Computer Science',
        joiningDate: new Date('2014-06-15'),
        status: 'active',
      },
      {
        userId: facultyUsers[1]._id,
        employeeId: 'PBSFAC02',
        department: departments[0]._id,
        designation: 'Associate Professor',
        qualification: 'M.Tech, PhD',
        joiningDate: new Date('2017-07-20'),
        status: 'active',
      },
      {
        userId: facultyUsers[2]._id,
        employeeId: 'PBSFAC03',
        department: departments[1]._id,
        designation: 'Associate Professor',
        qualification: 'M.Com, MBA, PhD',
        joiningDate: new Date('2015-08-10'),
        status: 'active',
      },
      {
        userId: facultyUsers[3]._id,
        employeeId: 'PBSFAC04',
        department: departments[2]._id,
        designation: 'Assistant Professor',
        qualification: 'M.Sc Mathematics, CSIR-NET',
        joiningDate: new Date('2019-06-15'),
        status: 'active',
      },
      {
        userId: facultyUsers[4]._id,
        employeeId: 'PBSFAC05',
        department: departments[3]._id,
        designation: 'Associate Professor',
        qualification: 'MA English, PhD',
        joiningDate: new Date('2013-01-01'),
        status: 'active',
      },
    ]);

    console.log('Created faculty records');

    // Create subjects distributed across Semesters 1 to 6
    const subjects = await Subject.insertMany([
      // Semester 1
      {
        name: 'Programming with Python',
        code: 'BCA101',
        course: courses[0]._id,
        semester: 1,
        credits: 4,
        faculty: faculty[0]._id,
        description: 'Fundamentals of Python, algorithms and data processing',
        status: 'active',
      },
      {
        name: 'Financial Accounting & Reporting',
        code: 'COM101',
        course: courses[2]._id,
        semester: 1,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Principles of accounting, ledger, and trial balance',
        status: 'active',
      },
      // Semester 2
      {
        name: 'Data Structures using C++',
        code: 'BCA201',
        course: courses[0]._id,
        semester: 2,
        credits: 4,
        faculty: faculty[1]._id,
        description: 'Stacks, Queues, Linked Lists, Trees, and Graph algorithms',
        status: 'active',
      },
      {
        name: 'Business Statistics',
        code: 'BBA201',
        course: courses[3]._id,
        semester: 2,
        credits: 4,
        faculty: faculty[3]._id,
        description: 'Probability, hypothesis testing, and business decision models',
        status: 'active',
      },
      // Semester 3
      {
        name: 'Database Management Systems (DBMS)',
        code: 'BCA301',
        course: courses[0]._id,
        semester: 3,
        credits: 4,
        faculty: faculty[0]._id,
        description: 'Relational model, SQL, normalization, and indexing',
        status: 'active',
      },
      {
        name: 'Corporate Accounting',
        code: 'COM301',
        course: courses[2]._id,
        semester: 3,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Share capital accounting, debentures, and company balance sheets',
        status: 'active',
      },
      // Semester 4
      {
        name: 'Web Technologies & Full Stack',
        code: 'BCA401',
        course: courses[0]._id,
        semester: 4,
        credits: 4,
        faculty: faculty[1]._id,
        description: 'HTML5, CSS3, JavaScript, Node.js, and React basics',
        status: 'active',
      },
      {
        name: 'Operating Systems & Linux',
        code: 'BCA402',
        course: courses[0]._id,
        semester: 4,
        credits: 3,
        faculty: faculty[0]._id,
        description: 'Process management, memory paging, file systems, and bash',
        status: 'active',
      },
      // Semester 5
      {
        name: 'Cloud Computing & DevOps',
        code: 'BCA501',
        course: courses[0]._id,
        semester: 5,
        credits: 4,
        faculty: faculty[1]._id,
        description: 'Virtualization, AWS/GCP essentials, Docker, and CI/CD',
        status: 'active',
      },
      {
        name: 'Financial Management',
        code: 'BBA501',
        course: courses[3]._id,
        semester: 5,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Capital budgeting, working capital, and portfolio theory',
        status: 'active',
      },
      // Semester 6
      {
        name: 'Machine Learning & AI',
        code: 'BCA601',
        course: courses[0]._id,
        semester: 6,
        credits: 4,
        faculty: faculty[0]._id,
        description: 'Supervised/unsupervised learning, neural networks, and model deployment',
        status: 'active',
      },
      {
        name: 'Major Project & Viva Voce',
        code: 'BCA602',
        course: courses[0]._id,
        semester: 6,
        credits: 6,
        faculty: faculty[1]._id,
        description: 'Independent industry capstone application and defense',
        status: 'active',
      },
      {
        name: 'Computer Fundamentals & Office Automation',
        code: 'BSC101',
        course: courses[1]._id,
        semester: 1,
        credits: 4,
        faculty: faculty[0]._id,
        description: 'Computer architecture, operating systems, productivity tools, and digital literacy',
        status: 'active',
      },
      {
        name: 'Digital Logic & Computer Organization',
        code: 'BSC201',
        course: courses[1]._id,
        semester: 2,
        credits: 4,
        faculty: faculty[1]._id,
        description: 'Logic gates, combinational circuits, processor organization, and memory systems',
        status: 'active',
      },
      {
        name: 'Statistics for Data Science',
        code: 'BSC301',
        course: courses[1]._id,
        semester: 3,
        credits: 4,
        faculty: faculty[3]._id,
        description: 'Descriptive statistics, probability distributions, estimation, and hypothesis testing',
        status: 'active',
      },
      {
        name: 'Data Visualization with Python',
        code: 'BSC401',
        course: courses[1]._id,
        semester: 4,
        credits: 4,
        faculty: faculty[0]._id,
        description: 'Data preparation, charts, dashboards, and storytelling with analytical data',
        status: 'active',
      },
      {
        name: 'Big Data Analytics',
        code: 'BSC501',
        course: courses[1]._id,
        semester: 5,
        credits: 4,
        faculty: faculty[1]._id,
        description: 'Distributed processing, data pipelines, Hadoop concepts, and analytics workloads',
        status: 'active',
      },
      {
        name: 'Data Science Capstone Project',
        code: 'BSC601',
        course: courses[1]._id,
        semester: 6,
        credits: 6,
        faculty: faculty[3]._id,
        description: 'End-to-end data science project, documentation, presentation, and viva',
        status: 'active',
      },
      {
        name: 'Business Communication & Soft Skills',
        code: 'BCOM101',
        course: courses[2]._id,
        semester: 1,
        credits: 3,
        faculty: faculty[2]._id,
        description: 'Professional communication, presentations, workplace writing, and employability skills',
        status: 'active',
      },
      {
        name: 'Business Law & Corporate Regulations',
        code: 'BCOM201',
        course: courses[2]._id,
        semester: 2,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Contracts, company law, consumer protection, and corporate compliance',
        status: 'active',
      },
      {
        name: 'Cost and Management Accounting',
        code: 'BCOM401',
        course: courses[2]._id,
        semester: 4,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Cost classification, budgeting, variance analysis, and managerial decisions',
        status: 'active',
      },
      {
        name: 'Human Resource Management',
        code: 'BBA301',
        course: courses[3]._id,
        semester: 3,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Recruitment, performance management, compensation, and employee relations',
        status: 'active',
      },
      {
        name: 'Marketing Management',
        code: 'BBA401',
        course: courses[3]._id,
        semester: 4,
        credits: 4,
        faculty: faculty[2]._id,
        description: 'Market research, consumer behavior, product strategy, and digital marketing',
        status: 'active',
      },
      {
        name: 'Entrepreneurship & Startup Management',
        code: 'BBA601',
        course: courses[3]._id,
        semester: 6,
        credits: 5,
        faculty: faculty[2]._id,
        description: 'Business models, funding, venture planning, innovation, and startup execution',
        status: 'active',
      },
      {
        name: 'Mathematical Methods',
        code: 'MPC101',
        course: courses[4]._id,
        semester: 1,
        credits: 4,
        faculty: faculty[3]._id,
        description: 'Calculus, matrices, differential equations, and mathematical modelling',
        status: 'active',
      },
      {
        name: 'Classical Mechanics & Waves',
        code: 'MPC201',
        course: courses[4]._id,
        semester: 2,
        credits: 4,
        faculty: faculty[3]._id,
        description: 'Newtonian mechanics, oscillations, wave motion, and applications',
        status: 'active',
      },
      {
        name: 'Electronics & Embedded Systems',
        code: 'MPC401',
        course: courses[4]._id,
        semester: 4,
        credits: 4,
        faculty: faculty[3]._id,
        description: 'Semiconductor devices, digital electronics, microcontrollers, and embedded design',
        status: 'active',
      },
    ]);

    console.log('Created subjects across Semesters 1 to 6');

    // Create student users
    const studentHashedPassword = await bcrypt.hash('Student@123', 10);
    const studentUsers = await User.insertMany(
      Array.from({ length: 30 }, (_, i) => ({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@pbsiddhartha.ac.in`,
        password: studentHashedPassword,
        role: ROLES.STUDENT,
        department: departments[i % departments.length]._id,
        status: 'active',
      }))
    );

    console.log('Created student user logins with @pbsiddhartha.ac.in');

    // Create student records (Years 1 to 3, Semesters 1 to 6)
    const students = await Student.insertMany(
      Array.from({ length: 30 }, (_, i) => {
        // semester between 1 and 6
        const semester = (i % 6) + 1;
        // year calculated from semester: sem 1-2 = year 1, sem 3-4 = year 2, sem 5-6 = year 3
        const year = Math.ceil(semester / 2);
        const courseIndex = i % courses.length;

        return {
          userId: studentUsers[i]._id,
          studentId: `PBS24${courses[courseIndex].code}${String(i + 1).padStart(3, '0')}`,
          department: courses[courseIndex].department,
          course: courses[courseIndex]._id,
          year,
          semester,
          section: String.fromCharCode(65 + (i % 2)), // Section A or B
          assignedFaculty: [faculty[i % faculty.length]._id],
          dateOfBirth: new Date('2004-05-15'),
          address: `Vijayawada, Andhra Pradesh, PIN 520010 - Student ${i + 1}`,
          guardianName: `Parent of Student ${i + 1}`,
          guardianPhone: '9848012345',
          status: 'active',
        };
      })
    );

    console.log('Created student records conforming to 3 years and 6 semesters');

    // Create timetables for active semesters (e.g. Semesters 2, 4, 6)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timetableEntries = [];
    let roomCounter = 101;

    for (let sIndex = 0; sIndex < subjects.length; sIndex++) {
      const sub = subjects[sIndex];
      const dayIndex = sIndex % days.length;
      timetableEntries.push({
        course: sub.course,
        department: departments[0]._id,
        semester: sub.semester,
        section: 'A',
        subject: sub._id,
        faculty: sub.faculty || faculty[0]._id,
        day: days[dayIndex],
        startTime: '09:30',
        endTime: '10:30',
        room: `Siddhartha Block - Room ${roomCounter++}`,
      });
    }

    await Timetable.insertMany(timetableEntries);
    console.log('Created timetables for PB Siddhartha');

    // Create attendance records for ALL 30 students over the past 25 days
    const attendanceRecords = [];
    const today = new Date();
    for (let dayOffset = 1; dayOffset <= 25; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      if (date.getDay() === 0) continue; // Skip Sunday

      for (let sIdx = 0; sIdx < students.length; sIdx++) {
        // Find matching subjects for student's course or fallback
        const studentCourseSubjects = subjects.filter(
          (sub) => sub.course.toString() === students[sIdx].course.toString()
        );
        const sub = studentCourseSubjects.length > 0 ? studentCourseSubjects[dayOffset % studentCourseSubjects.length] : subjects[sIdx % subjects.length];
        
        // 88% average presence rate with slight deterministic variation
        const isPresent = ((sIdx + dayOffset) % 7 !== 0);
        attendanceRecords.push({
          student: students[sIdx]._id,
          subject: sub._id,
          faculty: sub.faculty || faculty[0]._id,
          date,
          status: isPresent ? ATTENDANCE_STATUS.PRESENT : ATTENDANCE_STATUS.ABSENT,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records across all students`);

    // Create fees for 6-semester structure
    const feeRecords = [];
    for (let i = 0; i < 30; i++) {
      const sem = students[i].semester;
      const isPaid = i % 3 === 0;
      const isPartial = i % 3 === 1;
      feeRecords.push({
        student: students[i]._id,
        academicYear: '2024-2025',
        semester: sem,
        feeType: 'Autonomous Tuition & Lab Fee',
        amount: 32000,
        dueDate: new Date('2024-10-31'),
        paidAmount: isPaid ? 32000 : isPartial ? 18000 : 0,
        status: isPaid ? FEE_STATUS.PAID : isPartial ? FEE_STATUS.PARTIALLY_PAID : FEE_STATUS.PENDING,
        paymentDate: isPaid ? new Date('2024-08-15') : isPartial ? new Date('2024-08-20') : null,
        transactionId: isPaid ? `PBS_TXN_${100000 + i}` : isPartial ? `PBS_TXN_${200000 + i}` : undefined,
      });
    }

    await Fee.insertMany(feeRecords);
    console.log('Created fee records with status and transactions');

    // Create examinations across Semesters 1 to 6
    const exams = await Examination.insertMany([
      {
        name: 'Continuous Internal Assessment (CIA-I) - Python Programming',
        course: courses[0]._id,
        semester: 1,
        subject: subjects[0]._id,
        date: new Date('2024-09-15'),
        startTime: '10:00',
        endTime: '12:00',
        room: 'Siddhartha Block 101',
        totalMarks: 50,
      },
      {
        name: 'Continuous Internal Assessment (CIA-I) - Data Structures',
        course: courses[0]._id,
        semester: 2,
        subject: subjects[2]._id,
        date: new Date('2024-10-15'),
        startTime: '10:00',
        endTime: '12:00',
        room: 'Auditorium Hall 1',
        totalMarks: 50,
      },
      {
        name: 'Continuous Internal Assessment (CIA-I) - DBMS',
        course: courses[0]._id,
        semester: 3,
        subject: subjects[4]._id,
        date: new Date('2024-10-18'),
        startTime: '10:00',
        endTime: '12:00',
        room: 'Siddhartha Block 204',
        totalMarks: 50,
      },
      {
        name: 'Semester End Examination (SEE) - Web Technologies',
        course: courses[0]._id,
        semester: 4,
        subject: subjects[6]._id,
        date: new Date('2024-11-20'),
        startTime: '09:30',
        endTime: '12:30',
        room: 'Siddhartha Block 202',
        totalMarks: 75,
      },
      {
        name: 'Semester End Examination (SEE) - Cloud Computing & DevOps',
        course: courses[0]._id,
        semester: 5,
        subject: subjects[8]._id,
        date: new Date('2024-11-22'),
        startTime: '09:30',
        endTime: '12:30',
        room: 'Siddhartha Block 301',
        totalMarks: 75,
      },
      {
        name: 'Semester End Examination (SEE) - Machine Learning & AI',
        course: courses[0]._id,
        semester: 6,
        subject: subjects[10]._id,
        date: new Date('2024-11-25'),
        startTime: '14:00',
        endTime: '17:00',
        room: 'Siddhartha Block 305',
        totalMarks: 75,
      },
    ]);

    console.log('Created autonomous examinations across Semesters 1 to 6');

    // Helper to calculate grade from marks
    const getGrade = (marks, maxMarks) => {
      const pct = (marks / maxMarks) * 100;
      if (pct >= 90) return 'O';
      if (pct >= 80) return 'A+';
      if (pct >= 70) return 'A';
      if (pct >= 60) return 'B+';
      if (pct >= 50) return 'B';
      return 'C';
    };

    // Create results for ALL 30 students across multiple exams/subjects
    const results = [];
    for (let i = 0; i < students.length; i++) {
      // 2 to 3 exam results per student
      for (let eIdx = 0; eIdx < exams.length; eIdx++) {
        const exam = exams[eIdx];
        // match student's course or general
        const sub = subjects.find(s => s._id.toString() === exam.subject.toString()) || subjects[0];
        const maxMarks = exam.totalMarks || 75;
        // high performance realistic scores
        const marks = Math.min(maxMarks, Math.floor(maxMarks * 0.72) + ((i * 3 + eIdx * 5) % Math.floor(maxMarks * 0.25)));
        const grade = getGrade(marks, maxMarks);

        results.push({
          student: students[i]._id,
          subject: sub._id,
          examination: exam._id,
          marks,
          maxMarks,
          grade,
          remarks: grade === 'O' ? 'Outstanding Performance' : grade === 'A+' ? 'Excellent' : 'Passed with Credit',
        });
      }
    }

    await Result.insertMany(results);
    console.log(`Created ${results.length} result records across all 30 students with dynamic grades`);

    // Create authentic notifications for PB Siddhartha College of Arts & Science
    await Notification.insertMany([
      {
        title: 'Autonomous Semester End Examinations (SEE) Notification',
        message: 'PB Siddhartha College Examination Cell has released the timetable for Odd Semester (Semesters 1, 3, 5) examinations.',
        type: 'examination',
        targetRole: 'student',
        createdBy: adminUser._id,
        readBy: [],
      },
      {
        title: 'Siddhartha Youth Festival & Techno-Cultural Meet',
        message: 'Annual College Cultural & Literary Fest registrations are now open for all undergraduate departments.',
        type: 'general',
        targetRole: 'student',
        createdBy: adminUser._id,
        readBy: [],
      },
      {
        title: 'Campus Placement Drive - TCS & Wipro for BCA/B.Sc',
        message: 'On-campus recruitment drive for final year (Semester 6) students will begin on November 10. Register on the portal.',
        type: 'placement',
        targetRole: 'student',
        createdBy: adminUser._id,
        readBy: [],
      },
      {
        title: 'Semester Tuition Fee Submission Deadline',
        message: 'All students are requested to clear their Semester fee dues before October 31 to obtain examination hall tickets.',
        type: 'fees',
        targetRole: 'student',
        createdBy: adminUser._id,
        readBy: [],
      },
    ]);

    console.log('Created college notifications');

    // Create placements tailored for PB Siddhartha College graduates
    const placements = await Placement.insertMany([
      {
        companyName: 'Tata Consultancy Services (TCS)',
        jobTitle: 'Software Engineer - Smart Hiring',
        description: 'Exclusive campus hiring for BCA & B.Sc CS graduates with strong aptitude and programming skills.',
        location: 'Hyderabad / Chennai',
        salary: 360000,
        eligibility: 'BCA / B.Sc (Maths, Stats, CS), 6 Semesters aggregate CGPA >= 6.5',
        deadline: new Date('2024-11-20'),
        requirements: 'Python, C++, Java, relational databases, communication skills',
        status: 'active',
      },
      {
        companyName: 'Wipro Limited',
        jobTitle: 'WILP - Graduate Scholar Trainee',
        description: 'Work Integrated Learning Program with sponsored higher education M.Tech from premier institutes.',
        location: 'Bangalore / Hyderabad',
        salary: 320000,
        eligibility: 'BCA / B.Sc with 60% throughout 6 semesters, Mathematics in 12th standard',
        deadline: new Date('2024-11-30'),
        requirements: 'Fundamentals of Computing, Operating Systems, Web Basics',
        status: 'active',
      },
      {
        companyName: 'Deloitte India',
        jobTitle: 'Associate - Tax & Financial Services',
        description: 'Graduate analyst roles in corporate taxation, audit support, and advisory.',
        location: 'Hyderabad',
        salary: 420000,
        eligibility: 'B.Com Honours / BBA graduates, CGPA >= 7.0',
        deadline: new Date('2024-12-05'),
        requirements: 'Corporate Accounting, Tally/ERP, Financial Modelling in Excel',
        status: 'active',
      },
      {
        companyName: 'Tech Mahindra',
        jobTitle: 'Associate Technical Operations',
        description: 'Cloud infrastructure support and enterprise web applications maintenance.',
        location: 'Vijayawada / Hyderabad',
        salary: 300000,
        eligibility: 'All 3-Year Undergraduate Degree final semester students with no active backlogs',
        deadline: new Date('2024-12-15'),
        requirements: 'Computer Networks, Linux fundamentals, SQL basics',
        status: 'active',
      },
    ]);

    console.log('Created campus placements');

    await mongoose.connection.close();
    console.log('\n======================================================');
    console.log('PB Siddhartha College of Arts & Science ERP Seeded!');
    console.log('Autonomous 3-Year Degree Curriculum (6 Semesters)');
    console.log('======================================================');
    console.log('\n=== Demo Credentials ===');
    console.log('Admin:   admin   / admin123');
    console.log('Faculty: faculty1@pbsiddhartha.ac.in / Faculty@123');
    console.log('Student: student1@pbsiddhartha.ac.in / Student@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
