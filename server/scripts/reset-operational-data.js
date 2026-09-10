require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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
const PlacementApplication = require('../src/models/PlacementApplication');
const Chat = require('../src/models/Chat');
const Material = require('../src/models/Material');

async function resetOperationalData() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    Student.deleteMany({}), Faculty.deleteMany({}), Department.deleteMany({}), Course.deleteMany({}),
    Subject.deleteMany({}), Attendance.deleteMany({}), Fee.deleteMany({}), Timetable.deleteMany({}),
    Examination.deleteMany({}), Result.deleteMany({}), Notification.deleteMany({}), Placement.deleteMany({}),
    PlacementApplication.deleteMany({}), Chat.deleteMany({}), Material.deleteMany({}), User.deleteMany({ role: { $ne: 'admin' } }),
  ]);
  await User.updateMany({ role: 'admin' }, { $unset: { department: 1 } });
  const uploadDirectory = path.join(__dirname, '../uploads/materials');
  if (fs.existsSync(uploadDirectory)) {
    for (const entry of fs.readdirSync(uploadDirectory)) fs.rmSync(path.join(uploadDirectory, entry), { recursive: true, force: true });
  }
  console.log('Operational data cleared. Admin accounts were preserved.');
  await mongoose.disconnect();
}

resetOperationalData().catch((error) => { console.error(error); process.exitCode = 1; });
