const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

const FEE_STATUS = {
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

const PLACEMENT_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  SELECTED: 'selected',
  REJECTED: 'rejected',
};

const NOTIFICATION_TYPE = {
  GENERAL: 'general',
  ACADEMIC: 'academic',
  EXAMINATION: 'examination',
  FEES: 'fees',
  PLACEMENT: 'placement',
  EMERGENCY: 'emergency',
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  FEE_STATUS,
  PLACEMENT_STATUS,
  NOTIFICATION_TYPE,
  USER_STATUS,
};
