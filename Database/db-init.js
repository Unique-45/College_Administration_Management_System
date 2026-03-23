// ============================================
// College Administration Management System
// MongoDB Database Initialization Script
// Version: 1.0
// Date: 2026-03-23
// ============================================
// 
// USAGE: mongosh < db-init.js
// In MongoDB Atlas shell or local mongosh CLI
//
// This script creates all collections, validators, and indexes
// ============================================

// 1. Create or switch to database
db = db.getSiblingDB("college_db");

console.log("=== Starting Database Initialization ===\n");

// ============================================
// STEP 1: CREATE COLLECTIONS WITH VALIDATORS
// ============================================
console.log("Creating collections with validation...\n");

// Collection 1: users
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["full_name", "email", "role", "status", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        full_name: { bsonType: "string" },
        email: { bsonType: "string" },
        role: { enum: ["admin", "teacher", "student"] },
        phone: { bsonType: ["string", "null"] },
        profile_picture: { bsonType: ["string", "null"] },
        status: { enum: ["active", "inactive"] },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ users collection created");

// Collection 2: classes
db.createCollection("classes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["class_code", "subject", "teacher_id", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        class_code: { bsonType: "string" },
        subject: { bsonType: "string" },
        teacher_id: { bsonType: "objectId" },
        student_ids: { bsonType: "array", items: { bsonType: "objectId" } },
        schedule: { bsonType: "array" },
        status: { enum: ["active", "archived"] },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ classes collection created");

// Collection 3: attendance
db.createCollection("attendance", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["student_id", "class_id", "date", "status", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        student_id: { bsonType: "objectId" },
        class_id: { bsonType: "objectId" },
        date: { bsonType: "date" },
        status: { enum: ["present", "absent", "late"] },
        marked_by: { bsonType: "objectId" },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ attendance collection created");

// Collection 4: videos
db.createCollection("videos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "class_id", "teacher_id", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },
        subject: { bsonType: "string" },
        class_id: { bsonType: "objectId" },
        teacher_id: { bsonType: "objectId" },
        video_url: { bsonType: "string" },
        thumbnail: { bsonType: ["string", "null"] },
        duration_seconds: { bsonType: "int" },
        view_count: { bsonType: "int" },
        status: { enum: ["published", "draft", "archived"] },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ videos collection created");

// Collection 5: fee_ledgers
db.createCollection("fee_ledgers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["student_id", "academic_year", "total_fees", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        student_id: { bsonType: "objectId" },
        academic_year: { bsonType: "string" },
        total_fees: { bsonType: "int" },
        paid_amount: { bsonType: "int" },
        pending_amount: { bsonType: "int" },
        due_date: { bsonType: "date" },
        currency: { bsonType: "string" },
        status: { enum: ["pending", "partial", "paid", "overdue"] },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ fee_ledgers collection created");

// Collection 6: payments
db.createCollection("payments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["student_id", "amount", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        student_id: { bsonType: "objectId" },
        fee_ledger_id: { bsonType: "objectId" },
        amount: { bsonType: "int" },
        currency: { bsonType: "string" },
        method: { enum: ["razorpay", "upi", "cash", "bank_transfer"] },
        status: { enum: ["success", "failed", "pending", "refunded", "partially_refunded"] },
        refund_status: { enum: ["none", "initiated", "processed", "failed"] },
        transaction_id: { bsonType: ["string", "null"] },
        order_id: { bsonType: ["string", "null"] },
        payment_gateway: { enum: ["razorpay", "upi"] },
        gateway_payload: { bsonType: "object" },
        payment_captured: { bsonType: "bool" },
        receipt_url: { bsonType: ["string", "null"] },
        notes: { bsonType: "object" },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ payments collection created");

// Collection 7: payment_webhook_events
db.createCollection("payment_webhook_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "gateway", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        gateway: { bsonType: "string" },
        event_id: { bsonType: "string" },
        event_type: { bsonType: "string" },
        signature_valid: { bsonType: "bool" },
        payload_hash: { bsonType: "string" },
        processed: { bsonType: "bool" },
        processed_at: { bsonType: "date" },
        created_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ payment_webhook_events collection created");

// Collection 8: events
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "event_datetime", "location", "created_by", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },
        event_type: { enum: ["academic", "sports", "cultural", "workshop", "seminar", "meetup", "other"] },
        event_datetime: { bsonType: "date" },
        location: { bsonType: "string" },
        image: { bsonType: ["string", "null"] },
        max_participants: { bsonType: "int" },
        status: { enum: ["draft", "published", "cancelled", "completed"] },
        created_by: { bsonType: "objectId" },
        rsvp_count: { bsonType: "int" },
        is_deleted: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ events collection created");

// Collection 9: event_rsvps
db.createCollection("event_rsvps", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "user_id", "rsvp_status"],
      properties: {
        _id: { bsonType: "objectId" },
        event_id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        rsvp_status: { enum: ["yes", "no", "maybe"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ event_rsvps collection created");

// Collection 10: notifications
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "message", "type", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "objectId" },
        title: { bsonType: ["string", "null"] },
        message: { bsonType: "string" },
        type: { enum: ["payment", "attendance", "event", "video", "system"] },
        read: { bsonType: "bool" },
        link: { bsonType: "object" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
        is_deleted: { bsonType: "bool" }
      }
    }
  }
});
console.log("✓ notifications collection created");

// Collection 11: video_watch_events
db.createCollection("video_watch_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["video_id", "student_id", "watched_at"],
      properties: {
        _id: { bsonType: "objectId" },
        video_id: { bsonType: "objectId" },
        student_id: { bsonType: "objectId" },
        class_id: { bsonType: "objectId" },
        watched_duration_seconds: { bsonType: "int" },
        video_total_duration_seconds: { bsonType: "int" },
        progress_percent: { bsonType: "double" },
        session_id: { bsonType: "string" },
        watched_at: { bsonType: "date" },
        created_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ video_watch_events collection created");

// Collection 12: analytics_daily_video
db.createCollection("analytics_daily_video", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["date", "video_id", "class_id"],
      properties: {
        _id: { bsonType: "objectId" },
        date: { bsonType: "date" },
        video_id: { bsonType: "objectId" },
        class_id: { bsonType: "objectId" },
        subject: { bsonType: "string" },
        views: { bsonType: "int" },
        total_watch_time_minutes: { bsonType: "int" },
        unique_students: { bsonType: "int" },
        avg_completion_rate: { bsonType: "double" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ analytics_daily_video collection created");

// Collection 13: analytics_daily_engagement
db.createCollection("analytics_daily_engagement", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["date", "class_id"],
      properties: {
        _id: { bsonType: "objectId" },
        date: { bsonType: "date" },
        class_id: { bsonType: "objectId" },
        subject: { bsonType: "string" },
        active_students: { bsonType: "int" },
        engagement_rate: { bsonType: "int" },
        high: { bsonType: "int" },
        medium: { bsonType: "int" },
        low: { bsonType: "int" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});
console.log("✓ analytics_daily_engagement collection created");

console.log("\n✓ All 13 collections created successfully!\n");

// ============================================
// STEP 2: CREATE INDEXES (Critical for Performance)
// ============================================
console.log("Creating indexes for optimal performance...\n");

// Payment Indexes (Arpit's track)
db.payments.createIndex({ transaction_id: 1 }, { unique: true, sparse: true });
db.payments.createIndex({ order_id: 1 }, { unique: true, sparse: true });
db.payments.createIndex({ student_id: 1, status: 1, created_at: -1 });
db.payments.createIndex({ student_id: 1, created_at: -1 });
db.payments.createIndex({ status: 1, created_at: -1 });
console.log("✓ payments indexes created");

// Fee Ledger Indexes
db.fee_ledgers.createIndex({ student_id: 1, academic_year: 1 }, { unique: true });
db.fee_ledgers.createIndex({ student_id: 1, status: 1, due_date: 1 });
console.log("✓ fee_ledgers indexes created");

// Webhook Indexes
db.payment_webhook_events.createIndex({ event_id: 1 }, { unique: true });
db.payment_webhook_events.createIndex({ gateway: 1, created_at: -1 });
console.log("✓ payment_webhook_events indexes created");

// Analytics Indexes (Bhavishya's track)
db.video_watch_events.createIndex({ video_id: 1, watched_at: -1 });
db.video_watch_events.createIndex({ student_id: 1, watched_at: -1 });
db.video_watch_events.createIndex({ class_id: 1, watched_at: -1 });
console.log("✓ video_watch_events indexes created");

db.analytics_daily_video.createIndex({ date: 1, class_id: 1, video_id: 1 }, { unique: true });
db.analytics_daily_video.createIndex({ date: 1, subject: 1 });
db.analytics_daily_video.createIndex({ video_id: 1, date: -1 });
console.log("✓ analytics_daily_video indexes created");

db.analytics_daily_engagement.createIndex({ date: 1, class_id: 1 }, { unique: true });
db.analytics_daily_engagement.createIndex({ date: 1, subject: 1 });
console.log("✓ analytics_daily_engagement indexes created");

// Link/Relationship Indexes
db.event_rsvps.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
db.notifications.createIndex({ user_id: 1, read: 1, created_at: -1 });
db.notifications.createIndex({ type: 1, created_at: -1 });
console.log("✓ Link/relationship indexes created");

console.log("\n✓ All indexes created successfully!\n");

// ============================================
// SUMMARY
// ============================================
console.log("=== Database Initialization Complete ===");
console.log("Database: college_db");
console.log("Collections: 13");
console.log("Indexes: 21");
console.log("\nNext: Backend team can now insert sample data and run API tests");
