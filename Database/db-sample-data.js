// ============================================
// College Administration Management System
// MongoDB Sample Data Insertion Script
// Version: 1.0
// Date: 2026-03-23
// ============================================
// 
// USAGE: mongosh < db-sample-data.js
// Run this AFTER db-init.js to populate with test data
//
// This creates 5 test users, 2 classes, videos, and related data
// ============================================

db = db.getSiblingDB("college_db");

console.log("=== Inserting Sample Data ===\n");

// Sample User IDs (we'll create these first)
const adminId = new ObjectId();
const teacherId = new ObjectId();
const student1Id = new ObjectId();
const student2Id = new ObjectId();
const student3Id = new ObjectId();

// ============================================
// STEP 1: Insert Users
// ============================================
console.log("Inserting sample users...");

db.users.insertMany([
  {
    _id: adminId,
    full_name: "Arjun Admin",
    email: "admin@college.edu",
    role: "admin",
    phone: "9876543210",
    profile_picture: null,
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  },
  {
    _id: teacherId,
    full_name: "Prof. Sharma",
    email: "sharma@college.edu",
    role: "teacher",
    phone: "9876543211",
    profile_picture: null,
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  },
  {
    _id: student1Id,
    full_name: "Rajesh Kumar",
    email: "rajesh@college.edu",
    role: "student",
    phone: "9876543212",
    profile_picture: null,
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  },
  {
    _id: student2Id,
    full_name: "Priya Singh",
    email: "priya@college.edu",
    role: "student",
    phone: "9876543213",
    profile_picture: null,
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  },
  {
    _id: student3Id,
    full_name: "Aman Patel",
    email: "aman@college.edu",
    role: "student",
    phone: "9876543214",
    profile_picture: null,
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  }
]);
console.log("✓ 5 users inserted");

// ============================================
// STEP 2: Insert Classes
// ============================================
console.log("Inserting sample classes...");

const classId = new ObjectId();
db.classes.insertMany([
  {
    _id: classId,
    class_code: "10A",
    subject: "Mathematics",
    teacher_id: teacherId,
    student_ids: [student1Id, student2Id, student3Id],
    schedule: [
      { day: "Mon", start: "09:00", end: "10:00", room: "A-101" },
      { day: "Wed", start: "09:00", end: "10:00", room: "A-101" },
      { day: "Fri", start: "09:00", end: "10:00", room: "A-101" }
    ],
    status: "active",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  }
]);
console.log("✓ 1 class inserted");

// ============================================
// STEP 3: Insert Videos
// ============================================
console.log("Inserting sample videos...");

const videoId = new ObjectId();
db.videos.insertMany([
  {
    _id: videoId,
    title: "Mathematics: Linear Equations",
    description: "Introduction to linear equations and solutions",
    subject: "Mathematics",
    class_id: classId,
    teacher_id: teacherId,
    video_url: "https://example.com/video1.mp4",
    thumbnail: null,
    duration_seconds: 900,
    view_count: 42,
    status: "published",
    is_deleted: false,
    created_at: new Date("2026-03-10"),
    updated_at: new Date("2026-03-23")
  }
]);
console.log("✓ 1 video inserted");

// ============================================
// STEP 4: Insert Fee Ledgers
// ============================================
console.log("Inserting sample fee ledgers...");

db.fee_ledgers.insertMany([
  {
    student_id: student1Id,
    academic_year: "2026-2027",
    total_fees: 60000,
    paid_amount: 35000,
    pending_amount: 25000,
    due_date: new Date("2026-04-10"),
    currency: "INR",
    status: "pending",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  },
  {
    student_id: student2Id,
    academic_year: "2026-2027",
    total_fees: 60000,
    paid_amount: 60000,
    pending_amount: 0,
    due_date: new Date("2026-04-10"),
    currency: "INR",
    status: "paid",
    is_deleted: false,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-03-23")
  }
]);
console.log("✓ 2 fee ledgers inserted");

// ============================================
// STEP 5: Insert Payments
// ============================================
console.log("Inserting sample payments...");

db.payments.insertMany([
  {
    student_id: student1Id,
    fee_ledger_id: db.fee_ledgers.findOne({ student_id: student1Id })._id,
    amount: 15000,
    currency: "INR",
    method: "razorpay",
    status: "success",
    refund_status: "none",
    transaction_id: "pay_QA11AA11",
    order_id: "order_QA11AA11",
    payment_gateway: "razorpay",
    gateway_payload: {
      razorpay_payment_id: "pay_QA11AA11",
      razorpay_order_id: "order_QA11AA11",
      razorpay_signature: "sig_abc123"
    },
    payment_captured: true,
    receipt_url: null,
    notes: {},
    is_deleted: false,
    created_at: new Date("2026-02-10T10:30:00.000Z"),
    updated_at: new Date("2026-02-10T10:30:00.000Z")
  }
]);
console.log("✓ 1 payment inserted");

// ============================================
// STEP 6: Insert Attendance
// ============================================
console.log("Inserting sample attendance records...");

db.attendance.insertMany([
  {
    student_id: student1Id,
    class_id: classId,
    date: new Date("2026-03-20"),
    status: "present",
    marked_by: teacherId,
    is_deleted: false,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-20")
  },
  {
    student_id: student2Id,
    class_id: classId,
    date: new Date("2026-03-20"),
    status: "present",
    marked_by: teacherId,
    is_deleted: false,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-20")
  },
  {
    student_id: student3Id,
    class_id: classId,
    date: new Date("2026-03-20"),
    status: "absent",
    marked_by: teacherId,
    is_deleted: false,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-20")
  }
]);
console.log("✓ 3 attendance records inserted");

// ============================================
// STEP 7: Insert Events
// ============================================
console.log("Inserting sample events...");

const eventId = new ObjectId();
db.events.insertMany([
  {
    _id: eventId,
    name: "Annual Sports Day 2026",
    description: "Annual inter-class sports competition",
    event_type: "sports",
    event_datetime: new Date("2026-04-15T09:00:00Z"),
    location: "College Ground",
    image: null,
    max_participants: 500,
    status: "published",
    created_by: adminId,
    rsvp_count: 0,
    is_deleted: false,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-23")
  }
]);
console.log("✓ 1 event inserted");

// ============================================
// STEP 8: Insert Event RSVPs
// ============================================
console.log("Inserting sample event RSVPs...");

db.event_rsvps.insertMany([
  {
    event_id: eventId,
    user_id: student1Id,
    rsvp_status: "yes",
    created_at: new Date("2026-03-22"),
    updated_at: new Date("2026-03-22")
  },
  {
    event_id: eventId,
    user_id: student2Id,
    rsvp_status: "maybe",
    created_at: new Date("2026-03-22"),
    updated_at: new Date("2026-03-22")
  }
]);
console.log("✓ 2 event RSVPs inserted");

// ============================================
// STEP 9: Insert Notifications
// ============================================
console.log("Inserting sample notifications...");

db.notifications.insertMany([
  {
    user_id: student1Id,
    title: "Payment Received",
    message: "Your fee payment of Rs. 15000 is successful.",
    type: "payment",
    read: false,
    link: {
      entity_type: "payment",
      entity_id: db.payments.findOne({ student_id: student1Id })._id,
      route: "/student/payments"
    },
    created_at: new Date("2026-02-10T10:30:00.000Z"),
    updated_at: new Date("2026-02-10T10:30:00.000Z"),
    is_deleted: false
  }
]);
console.log("✓ 1 notification inserted");

// ============================================
// STEP 10: Insert Video Watch Events
// ============================================
console.log("Inserting sample video watch events...");

db.video_watch_events.insertMany([
  {
    video_id: videoId,
    student_id: student1Id,
    class_id: classId,
    watched_duration_seconds: 450,
    video_total_duration_seconds: 900,
    progress_percent: 50.0,
    session_id: "session_001",
    watched_at: new Date("2026-03-20T14:00:00Z"),
    created_at: new Date("2026-03-20T14:00:00Z")
  }
]);
console.log("✓ 1 video watch event inserted");

// ============================================
// STEP 11: Insert Analytics Data
// ============================================
console.log("Inserting sample analytics data...");

db.analytics_daily_video.insertMany([
  {
    date: new Date("2026-03-20"),
    video_id: videoId,
    class_id: classId,
    subject: "Mathematics",
    views: 42,
    total_watch_time_minutes: 312,
    unique_students: 84,
    avg_completion_rate: 72.5,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-20")
  }
]);
console.log("✓ 1 analytics_daily_video inserted");

db.analytics_daily_engagement.insertMany([
  {
    date: new Date("2026-03-20"),
    class_id: classId,
    subject: "Mathematics",
    active_students: 48,
    engagement_rate: 78,
    high: 20,
    medium: 18,
    low: 10,
    created_at: new Date("2026-03-20"),
    updated_at: new Date("2026-03-20")
  }
]);
console.log("✓ 1 analytics_daily_engagement inserted");

// ============================================
// SUMMARY
// ============================================
console.log("\n=== Sample Data Insertion Complete ===");
console.log("Users: 5");
console.log("Classes: 1");
console.log("Videos: 1");
console.log("Fee Ledgers: 2");
console.log("Payments: 1");
console.log("Attendance Records: 3");
console.log("Events: 1");
console.log("Event RSVPs: 2");
console.log("Notifications: 1");
console.log("Watch Events: 1");
console.log("Analytics Records: 2");
console.log("\nDatabase is ready for API testing!");
