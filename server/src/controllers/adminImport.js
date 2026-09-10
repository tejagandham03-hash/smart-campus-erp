const XLSX = require('xlsx');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');

const text = (value) => String(value ?? '').trim();
const normalized = (value) => text(value).toLowerCase().replace(/[\s_()\-.]/g, '');

const rowValue = (row, ...keys) => {
  const entries = Object.entries(row);
  const wanted = keys.map(normalized);
  const entry = entries.find(([key]) => wanted.includes(normalized(key)));
  return entry ? text(entry[1]) : '';
};

const findByCodeOrName = (map, records, value) => {
  const normalizedValue = normalized(value);
  return map.get(String(value).trim().toUpperCase())
    || records.find((item) => normalized(item.code) === normalizedValue || normalized(item.name) === normalizedValue);
};

exports.downloadTemplate = (req, res) => {
  const type = req.params.type;
  const headers = type === 'faculty'
    ? [['Name', 'Email', 'Password', 'Phone', 'Employee ID', 'Department Code', 'Designation', 'Qualification', 'Joining Date']]
    : [['Name', 'Email', 'Password', 'Phone', 'Student ID', 'Department Code', 'Course Code', 'Semester', 'Section', 'Assigned Faculty IDs']];
  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  worksheet['!cols'] = headers[0].map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, type === 'faculty' ? 'Faculty' : 'Students');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-import-template.xlsx`);
  res.send(buffer);
};

exports.bulkImport = async (req, res, next) => {
  try {
    const type = req.params.type;
    if (!req.file || !['students', 'faculty'].includes(type)) return res.status(422).json({ success: false, message: 'Choose a valid student or faculty spreadsheet' });
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
    if (!rows.length) return res.status(422).json({ success: false, message: 'The spreadsheet has no data rows' });
    const departments = await Department.find({});
    const departmentByCode = new Map(departments.map((item) => [item.code.toUpperCase(), item]));
    const courses = await Course.find({});
    const courseByCode = new Map(courses.map((item) => [item.code.toUpperCase(), item]));
    const facultyRecords = await Faculty.find({});
    const facultyByEmployeeId = new Map(facultyRecords.map((item) => [item.employeeId.toUpperCase(), item]));
    const errors = [];
    const payloads = [];
    const emails = new Set();
    const ids = new Set();

    rows.forEach((row, index) => {
      const line = index + 2;
      const email = rowValue(row, 'Email').toLowerCase();
      const departmentValue = rowValue(row, 'Department Code', 'Department', 'Department Name');
      const department = findByCodeOrName(departmentByCode, departments, departmentValue);
      if (!email || !rowValue(row, 'Name', 'Full Name') || !rowValue(row, 'Password', 'Temporary Password')) errors.push(`Row ${line}: name, email, and password are required`);
      if (emails.has(email)) errors.push(`Row ${line}: duplicate email in spreadsheet`);
      emails.add(email);
      if (!department) errors.push(`Row ${line}: department code was not found`);
      if (type === 'faculty') {
        const employeeId = rowValue(row, 'Employee ID', 'EmployeeId');
        if (!employeeId || !rowValue(row, 'Designation') || !rowValue(row, 'Qualification') || !rowValue(row, 'Joining Date')) errors.push(`Row ${line}: employee ID, designation, qualification, and joining date are required`);
        if (ids.has(employeeId)) errors.push(`Row ${line}: duplicate employee ID in spreadsheet`);
        ids.add(employeeId);
        payloads.push({ row, line, email, department, employeeId });
      } else {
        const studentId = rowValue(row, 'Student ID', 'StudentId', 'Roll Number');
        const courseValue = rowValue(row, 'Course Code', 'Course', 'Course Name');
        const course = findByCodeOrName(courseByCode, courses, courseValue);
        const semester = Number(rowValue(row, 'Semester'));
        const assignedFaculty = rowValue(row, 'Assigned Faculty IDs', 'Assigned Faculty', 'Faculty IDs').split(',').map((id) => facultyByEmployeeId.get(id.trim().toUpperCase())?._id).filter(Boolean);
        if (!studentId || !course || ![1, 2, 3, 4, 5, 6].includes(semester) || !rowValue(row, 'Section')) errors.push(`Row ${line}: student ID, valid course code, semester 1-6, and section are required`);
        if (!course || (department && String(course.department) !== String(department._id))) errors.push(`Row ${line}: course does not belong to department`);
        if (ids.has(studentId)) errors.push(`Row ${line}: duplicate student ID in spreadsheet`);
        ids.add(studentId);
        payloads.push({ row, line, email, department, course, studentId, semester, assignedFaculty });
      }
    });
    const existingUsers = await User.find({ email: { $in: [...emails] } }).select('email');
    if (existingUsers.length) errors.push(`Existing email(s): ${existingUsers.map((item) => item.email).join(', ')}`);
    if (errors.length) return res.status(422).json({ success: false, message: 'Spreadsheet validation failed', errors });

    const created = [];
    for (const item of payloads) {
      const user = await User.create({ name: rowValue(item.row, 'Name', 'Full Name'), email: item.email, password: rowValue(item.row, 'Password', 'Temporary Password'), phone: rowValue(item.row, 'Phone'), role: type === 'faculty' ? 'faculty' : 'student', department: item.department._id });
      if (type === 'faculty') {
        created.push(await Faculty.create({ userId: user._id, employeeId: item.employeeId, department: item.department._id, designation: rowValue(item.row, 'Designation'), qualification: rowValue(item.row, 'Qualification'), joiningDate: new Date(rowValue(item.row, 'Joining Date')) }));
      } else {
        created.push(await Student.create({ userId: user._id, studentId: item.studentId, department: item.department._id, course: item.course._id, semester: item.semester, year: Math.ceil(item.semester / 2), section: rowValue(item.row, 'Section'), assignedFaculty: item.assignedFaculty }));
      }
    }
    res.status(201).json({ success: true, message: `${created.length} ${type} imported successfully`, data: { created: created.length } });
  } catch (error) { next(error); }
};
