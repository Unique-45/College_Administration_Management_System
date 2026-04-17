---
description: Describe when these instructions should be loaded by the agent based on task context
applyTo: 'Whenever Architecture is planned for anything be it Frontend or Backend all structures, approach, design and any feature is implemented - It should be completely relevant with this file ' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Contents
1. Introduction
1.1	Purpose
1.2	Document Conventions
1.3	Intended Audience and Reading Suggestions
1.4	Product Scope
1.5	References
2. Overall Description
2.1	System Environment 
2.2	Functional Requirements Specification 
2.3	User Classes and Their Characteristics 
2.4	Operating Environment 
2.5	 Design and Implementation Constraints
2.6	 User Documentation
2.7	 Assumptions and Dependencies
3. External Interface Requirements
3.1 User Interfaces
3.2 Hardware Interfaces
3.3 Software Interfaces
3.4 Communication Interfaces

4. System Features
4.1 User Authentication & Role Management
4.2 Video Content Management (Teacher)
4.3 Subject-Wise Video Streaming (Student)
4.4 Reach Analytics

5. Other Non-Functional Requirements
5.1 Performance Requirements
5.2 Safety Requirements
5.3 Security Requirements
5.4 Software Quality Attributes
5.5 Business Rules

6. Other Requirements
7.0 Software Design
   7.1 System Architecture
   7.2 Detailed Design
       7.2.1 Class Diagrams
       7.2.2 Sequence Diagrams
   7.3 Database Schema
   7.4 Security Design
       7.4.1 Authentication and Authorization Mechanisms
       7.4.2 Security Protocols
8.0 Traceability
    8.1 Requirement-to-Design Mapping
1	Introduction

1.1	Purpose 
The purpose of this Software Requirements Specification (SRS) is to define the functional and non-functional requirements for the College Administration Management System. This document focuses on the core user authentication, video content management, subject-wise streaming, and reach analytics modules, detailing how these features operate within the system's three-tier MERN stack architecture.
1.2	Document Conventions
This document follows standard IEEE 830-1998 conventions for software requirements. Features are prioritized based on their essential role in the system. Security protocols, roles (Admin, Teacher, Student), and specific database references (e.g., MongoDB collections) are capitalized for clarity.
1.3	Intended Audience and Reading Suggestions 
This document is intended for software developers, system architects, project managers, and quality assurance testers. Developers should focus on Section 4 (System Features) and Section 3 (External Interfaces), while project managers may review Section 2 (Overall Description) and Section 5 (Non-Functional Requirements) to understand the system's scope and constraints.
1.4	Product Scope
The College Administration Management System is a centralized digital platform that automates academic and administrative campus operations.
The system enables:
•	Secure login using JWT-based stateless authentication.
•	Role-based dashboards for Admin, Teacher, and Student.
•	Teacher-driven attendance marking with real-time updates.
•	Secure online fee payments verified using cryptographic webhook validation.
•	Event creation and campus notification broadcasting.
•	Subject-wise video content upload and streaming.
1.5 References
•	Software Requirements Specification and Design.pdf (Core System Architecture & Schema)
•	IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications






2. Overall Description
2.1 System Environment
 The system utilizes a three-tier client-server architecture based on the MERN stack (MongoDB, Express.js, React.js/HTML/JS, Node.js). The presentation layer provides an interactive user interface accessible via web and mobile browsers, while the business logic layer (Node.js/Express.js) executes core campus logic and acts as a bridge to the MongoDB database.
 
2.2 Functional Requirements Specification
 The system must provide robust authentication, allow teachers to upload and manage video course materials, enable students to stream subject-wise content, and offer real-time monitoring and analytics regarding user reach and attendance.
2.3 User Classes and Their Characteristics 
The system operates on a Role-Based Access Control (RBAC) model with three primary user classes:
•	Admin: Has system-wide privileges, including managing user accounts and overseeing platform analytics.
•	Teacher: Can manage class information, mark attendance, generate reports, and upload/manage video content.
•	Student: Can access the system to view attendance, stream video content, and pay fees.
 
2.4 Operating Environment 
The server-side application operates on a Node.js runtime environment. The database is hosted on MongoDB, a NoSQL database system. The client-side application is designed to run on standard modern web browsers (e.g., Chrome, Safari, Firefox) on both desktop and mobile devices.

2.5 Design and Implementation Constraints 
The system was initially conceptualized and developed to be functional and scalable under rapid development constraints (e.g., a 12-hour Hackathon timeframe). All data persistence must conform to the NoSQL schema-less flexibility of MongoDB. Strict security constraints mandate the use of HTTPS, JWT for state management, and bcrypt for password hashing.
2.6 User Documentation 
The system will be accompanied by an interactive dashboard manual detailing how to navigate campus events, upload videos, and stream content. API documentation will be provided for future developers.
2.7	Assumptions and Dependencies 
It is assumed that users have a reliable internet connection to stream video content and utilize real-time monitoring. The system is highly dependent on MongoDB for data storage and relies on external gateways (like Razorpay/UPI) for processing any campus fee payments

3. External Interface Requirements
3.1 User Interface
The UI shall:
•	Provide login interface with JWT token storage.
•	Show role-specific dashboard.
•	Provide:
o	Attendance portal (Teacher)
o	Payment portal (Student)
o	Event management interface
o	Video streaming interface
o	Notification panel
3.2 Hardware Interfaces 
The system requires standard device inputs (keyboard, mouse, touchscreens) and relies on user device hardware (cameras, microphones) for teachers producing or uploading video content. Display outputs are required to support video streaming.




3.3 Software Interfaces
The backend shall interface with MongoDB collections defined in:
•	Users
•	Class
•	Attendance
•	Events
•	Payments
•	Notifications
The Payments collection must:
•	Store transaction_id (Unique, Indexed)
•	Store payment_captured boolean
•	Prevent duplicate webhook events
3.4 Communication Interfaces
•	All client-server communication must use HTTPS.
•	Payment gateway communication must use secure REST APIs.
•	Webhook endpoints must validate cryptographic signature before updating payment status.















4. System Features
4.1 User Authentication & Role Management
•	Description: Secure, stateless authentication and authorization using JSON Web Tokens (JWT).
•	Functional Requirements:
o	The system shall validate credentials and hash passwords using bcrypt.
o	The system shall issue a digitally signed JWT upon successful login.
o	The system's RBAC middleware shall check the JWT payload to enforce strict permissions based on Admin, Teacher, or Student roles.
 
4.2 Video Content Management (Teacher)
•	Description: Teachers can securely upload, manage, and categorize educational video content to the platform.
•	Functional Requirements:
o	The system shall provide an interface for users with the Teacher role to upload video files.
o	The system shall allow teachers to categorize videos by class_id and subject.
o	The system shall store metadata for the uploaded content and link it to the teacher's _id.

4.3 Subject-Wise Video Streaming (Student)
•	Description: Students can access and stream educational videos categorized by their specific subjects.
•	Functional Requirements:
o	The system shall allow users with the Student role to browse video content assigned to their specific batch and department.
o	The system shall provide an integrated media player for video streaming.
o	The system shall only permit authenticated users to access video streams.
4.4 Reach Analytics
•	Description: The system provides real-time monitoring and analytics regarding content reach, attendance, and user engagement.
•	Functional Requirements:
o	The system shall track student interactions and attendance metrics (Present, Absent, Late) via the Attendance collection.
o	The system shall push real-time notification alerts and analytics data to the administrative and teacher dashboards.
o	The system shall generate reports correlating video viewership with student engagement.





5. Other Non-Functional Requirements
5.1 Performance Requirements 
The system must efficiently handle multiple concurrent users accessing the portal and streaming video simultaneously. Real-time tracking capabilities must reflect database updates (such as marked attendance or payment confirmations) across the UI with minimal latency.
5.2 Safety Requirements
 To prevent data loss, the system uses a robust NoSQL database (MongoDB) capable of handling unstructured data, and all sensitive records (like payments and attendance) feature an is_deleted boolean field to allow for soft deletions rather than permanent data loss.
5.3 Security Requirements 
The system features strict security protocols:
•	Encryption: Passwords are hashed via bcrypt or argon2.
•	Transport: Encrypted in transit using HTTPS to prevent eavesdropping.
•	Input Validation: Express middleware must sanitize inputs to protect against SQL/NoSQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).
5.4 Software Quality Attributes
•	Reliability: The MERN architecture ensures a stable and predictable application flow.
•	Maintainability: Following a strict three-tier architecture separates concerns between the presentation, business logic, and data layers.
•	Scalability: MongoDB provides high flexibility and scalability for handling large datasets and unstructured video metadata.
5.5 Business Rules
•	Only authenticated Admin users can create new teacher accounts.
•	Only Teacher roles can modify attendance records or upload video content to their assigned subjects.
•	Financial transactions must be strictly verified using cryptographic signatures (x-razorpay-signature) combined with a server-side webhook secret.




6. Other Requirements
Database Schema Integration 
All features interact directly with the established MongoDB schemas, including the Users, Class, Attendance, Events, Payments, and Notifications collections. Any newly introduced modules (such as video content mapping) must adhere to the existing structural constraints, utilizing indexed ObjectId foreign keys (e.g., student_id, teacher_id) to maintain referential integrity.
























7.0 Software Design
7.1 System Architecture
The College Administration Management System utilizes a three-tier client-server architecture based on the MERN stack (MongoDB, Express.js, React.js, Node.js).
•	Presentation Layer (Client-Side): Developed to provide an interactive and responsive user interface accessible via web and mobile browsers. It communicates with the backend via RESTful APIs.
•	Business Logic Layer (Server-Side): Handled by Node.js and Express.js, this layer processes user requests, handles API routing, executes core campus logic (e.g., attendance tracking, event scheduling), and acts as a bridge between the client and the database. It also integrates external services such as the Razorpay payment gateway for fee processing.
•	Data Layer: MongoDB, a NoSQL database, is used for dynamic and flexible storage of structured and unstructured data, such as student profiles, attendance records, and payment logs.















7.2 Detailed Design
7.2.1 Class Diagrams
The following details the logical structure of the primary entities within the system, defining their attributes and operations (methods).


























7.2.2 Sequence Diagrams
The following outlines the chronological sequence of interactions between objects for two primary use cases.
Sequence 1: Teacher Marking Attendance








Sequence 2: Online Fee Payment via Gateway (Razorpay/UPI)









7.3 Database Schema
The database model is designed using MongoDB, leveraging its schema-less flexibility to handle large datasets. Core collections include:
•	Users Collection: Stores authentication credentials and system roles. Fields: _id (ObjectId, PK), username (String, Unique, Indexed), password (String, Hashed using bcrypt), email (String, Unique, Indexed), role (String: Admin, Teacher, Student), profile_picture (String, optional), created_at (Date),
updated_at (Date), is_deleted (Boolean, default: false)
Indexes: 
1.	Unique index on email
2.	Unique index on username
3.	Index on role
•	Class Collection: Stores Class/Course Information. Fields: _id (ObjectId, PK), teacher_id (ObjectId, FK → Users, Indexed), subject (String), class_time (String), class_code (String, Unique, Indexed), created_at (Date), updated_at (Date), is_deleted (Boolean)
Indexes: 
1.	Unique index on email
2.	Unique index on username
3.	Index on role
•	Attendance Collection: Maps students to class participation records. Fields: _id (ObjectId, PK),
student_id (ObjectId, FK → Users, Indexed), class_id (ObjectId, FK → Class, Indexed), date (Date, Indexed), status (String: Present, Absent, Late), created_at (Date), updated_at (Date), is_deleted (Boolean).
Indexes: 
1.	Unique index on email
2.	Unique index on username
3.	Index on role
•	Events Collection: Stores campus event data. Fields: _id (ObjectId, PK), event_name (String), date (Date, Indexed), description (String), created_by (ObjectId, FK → Users, Indexed), created_at (Date), updated_at (Date), is_deleted (Boolean)
Indexes: 
1.	Index on date
2.	Index on created_by
•	Payments/Transactions Collection: Stores fee payment records. Fields: __id (ObjectId, PK), student_id (ObjectId, FK → Users, Indexed), amount (Float status (String: Paid, Pending, Failed, Indexed), transaction_id (String, Unique, Indexed), receipt_id (String), payment_captured (boolean), created_at (Date), updated_at (Date), is_deleted (Boolean).
Indexes: 
1.	Unique index on transaction_id 
2.	Index on student_id
3.	Index on status
•	Notifications Collection: Stores system alerts. Fields: _id (ObjectId, PK), user_id (ObjectId, FK → Users, Indexed, message (String), status (String: Read, Unread, Indexed), timestamp (Date, Indexed), created_at (Date), is_deleted (Boolean).
Indexes: 
1.	Compound index on { user_id, status }
2.	Index on timestamp


7.4 Security Design
7.4.1 Authentication and Authorization Mechanisms
•	JWT (JSON Web Tokens): Used for secure, stateless authentication. Once a user logs in, the backend issues a digitally signed JWT, which the client stores and sends with subsequent requests to verify identity without relying on server-side session storage.
•	Role-Based Access Control (RBAC): Middleware checks the JWT payload to enforce strict permissions based on the user's role. For example, only authenticated Admin users can create new teacher accounts, and only Teacher roles can modify attendance records.

7.4.2 Security Protocols
•	Data Encryption: Sensitive data, such as user passwords, are hashed and encrypted using robust algorithms like bcrypt or argon2 before being persisted in the database.
•	Transport Security: The system mandates HTTPS to encrypt data in transit, ensuring secure communication between the client browser and the API server, protecting against eavesdropping.
•	Input Validation & Attack Prevention: The system utilizes secure coding practices and Express middleware to sanitize inputs, protecting against SQL/NoSQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).
•	Webhook Signature Validation: Payment gateway responses are strictly verified using cryptographic signatures (x-razorpay-signature) combined with a server-side webhook_secret to ensure payment confirmations are legitimately from the payment provider and not spoofed.

 

8.0 Traceability
8.1 Requirement-to-Design Mapping
Requirement / Use Case ID	Requirement / Use Case Name	Design ID(s)	Design Artifact
UC-01	User Login & Authentication	D-CL-01, D-SEC-01	Class Diagram, Security List
UC-02	Mark Student Attendance	D-CL-03, D-CL-04, D-SQ-01	Class Diagram, Sequence Diagram
UC-03	Pay Campus Fees	D-CL-05, D-SQ-02	Class Diagram, Sequence Diagram
UC-04	View Attendance Records	D-CL-02, D-CL-04	Class Diagram
UC-05	Manage Campus Events	D-CL-01	Class Diagram
NFR-01	Secure Access & Authorization	D-SEC-01, D-SEC-02	Security List
NFR-02	Protect Financial Transactions	D-SEC-02, D-SQ-02	Security List, Sequence Diagram

