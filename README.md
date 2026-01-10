# 🏫 FixMyCampus – Campus Issue Reporting System

FixMyCampus is a web-based platform designed to help students easily report campus-related issues (like infrastructure, cleanliness, Wi-Fi, safety, etc.) and enable institutional administrators to efficiently track, manage, and resolve them.

🔗 **Live Demo:**  
👉 https://shubham-2005-dev.github.io/FixMyCampus/

---

## 🚀 Features

### 👨‍🎓 Student Features
- Secure login using Firebase Authentication
- Submit campus issues with:
  - Title & description
  - Category (e.g., Infrastructure, Hostel, Academic, etc.)
  - Priority level
  - Image upload (proof of issue)
- Track issue status (Pending / In Progress / Resolved)
- Real-time updates

### 🧑‍💼 Admin Features
- Secure admin-only access
- View all reported issues in a centralized dashboard
- Update issue status
- Analyze issues using charts & analytics
- Admin access is **restricted by email IDs defined directly in code**

> ⚠️ **Important:**  
> To become an admin, the email ID **must be explicitly mentioned in the JavaScript code**.  
> This ensures only authorized institutional members get admin privileges.

---

## 🔐 Admin Access Configuration

Admin emails are hardcoded in the JavaScript file for security and institutional control.

### Example (admin.js / auth logic):
```javascript
const adminEmails = [
  "admin@college.edu",
  "principal@college.edu",
  "itcell@college.edu"
];

if (adminEmails.includes(user.email)) {
  // Grant admin access
}
