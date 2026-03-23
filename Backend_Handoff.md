# Backend Handoff

Version: 1.0  
Date: 2026-03-23  
Owner: Kulwant (DB handoff)  
Consumers: Arpit (Payments), Bhavishya (Analytics)

## 1) Execution Order
1. Kulwant finalizes DB schema and indexes from Database_Plan.md.
2. Same-day 30-minute schema/API sync with Arpit and Bhavishya.
3. Arpit and Bhavishya implement in parallel after sync.
4. Shared middleware standards are enforced across both tracks.

## 2) Non-Negotiable Backend Contracts
1. Stable success envelope:

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

2. Stable error envelope:

```json
{
  "success": false,
  "message": "Human readable error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

3. Dates in ISO-8601 UTC.
4. API response keys in camelCase.
5. Notifications API must return `id` (string), not only `_id`.

## 3) API Payload Contracts (Frontend-Matching)

### 3.1 GET /payments/pending-fees
```json
{
  "success": true,
  "data": {
    "totalFees": 60000,
    "paidAmount": 35000,
    "pendingAmount": 25000,
    "dueDate": "2026-04-10"
  }
}
```

### 3.2 GET /payments/history
```json
{
  "success": true,
  "data": [
    {
      "_id": "txn-1001",
      "amount": 15000,
      "status": "success",
      "method": "razorpay",
      "transactionId": "pay_QA11AA11",
      "createdAt": "2026-02-10T10:30:00.000Z",
      "receiptUrl": "https://.../receipt-txn-1001.pdf",
      "refundStatus": "none"
    }
  ]
}
```

### 3.3 GET /analytics/viewership-trends
```json
{
  "success": true,
  "data": {
    "trends": [
      { "period": "Mon", "views": 120, "watchTime": 75, "activeStudents": 42 }
    ],
    "peakTimes": [
      { "day": "Mon", "slots": [25, 34, 18, 12] }
    ]
  }
}
```

### 3.4 GET /analytics/engagement
```json
{
  "success": true,
  "data": {
    "activeStudents": 52,
    "engagementRate": 78,
    "breakdown": [
      { "name": "High Engagement", "value": 42 },
      { "name": "Medium Engagement", "value": 36 },
      { "name": "Low Engagement", "value": 22 }
    ]
  }
}
```

### 3.5 GET /analytics/videos
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "title": "Mathematics: Linear Equations",
        "views": 420,
        "watchTime": 312,
        "completionRate": 86
      }
    ]
  }
}
```

### 3.6 GET /api/notifications
```json
{
  "success": true,
  "data": [
    {
      "id": "67e0c4f7b7f7aa00223b9081",
      "title": "Payment received",
      "message": "Your fee payment of Rs. 15000 is successful.",
      "type": "payment",
      "read": false,
      "createdAt": "2026-03-22T08:00:00.000Z",
      "link": {
        "entityType": "payment",
        "entityId": "67e0c4a0b7f7aa00223b9001",
        "route": "/student/payments"
      }
    }
  ]
}
```

## 4) Required Query Outputs (Validation)

### 4.1 pending fees
```json
{
  "totalFees": 60000,
  "paidAmount": 35000,
  "pendingAmount": 25000,
  "dueDate": "2026-04-10"
}
```

### 4.2 payment history
```json
[
  {
    "_id": "txn-1001",
    "amount": 15000,
    "status": "success",
    "method": "razorpay",
    "transactionId": "pay_QA11AA11",
    "createdAt": "2026-02-10T10:30:00.000Z",
    "receiptUrl": "https://.../receipt-txn-1001.pdf",
    "refundStatus": "none"
  }
]
```

### 4.3 viewership trends
```json
{
  "trends": [
    { "period": "Mon", "views": 120, "watchTime": 75, "activeStudents": 42 },
    { "period": "Tue", "views": 150, "watchTime": 88, "activeStudents": 48 }
  ],
  "peakTimes": [
    { "day": "Mon", "slots": [25, 34, 18, 12] },
    { "day": "Tue", "slots": [22, 38, 21, 15] }
  ]
}
```

### 4.4 engagement breakdown
```json
{
  "activeStudents": 52,
  "engagementRate": 78,
  "breakdown": [
    { "name": "High Engagement", "value": 42 },
    { "name": "Medium Engagement", "value": 36 },
    { "name": "Low Engagement", "value": 22 }
  ]
}
```

### 4.5 most watched videos
```json
{
  "videos": [
    { "title": "Mathematics: Linear Equations", "views": 420, "watchTime": 312, "completionRate": 86 },
    { "title": "Physics: Kinematics Basics", "views": 355, "watchTime": 271, "completionRate": 79 }
  ]
}
```

## 5) Parallel Implementation Split

### 5.1 Arpit
- Payments lifecycle: initiate, verify, webhook, payment history, pending fees, receipt generation.
- Maintain strict consistency across `payments`, `fee_ledgers`, `payment_webhook_events`.

### 5.2 Bhavishya
- Analytics endpoints using `video_watch_events`, `analytics_daily_video`, `analytics_daily_engagement`.
- Implement aggregation jobs and read models for trend endpoints.

### 5.3 Shared
- RBAC role guards.
- Common response/error envelope.
- Input validation and pagination consistency.

## 6) Backend Done Criteria
1. All required indexes from Database_Plan.md are created and verified.
2. Sample outputs in Section 4 are returned exactly.
3. Frontend payments and analytics pages run without fallback data.
4. Duplicate webhook events do not create duplicate payment records.
5. Notification payload includes routable `link` metadata and `id` field.