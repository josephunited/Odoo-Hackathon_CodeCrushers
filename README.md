# 🚀 AssetFlow - Enterprise Asset & Resource Management System

> A modern Enterprise Asset & Resource Management System built for the **Odoo Hackathon** to streamline asset tracking, resource booking, maintenance management, and auditing within organizations.

## 👥 Team CodeCrushers

| Name | Responsibility |
|------|----------------|
| **Aparna** | Authentication, Organization Setup, Employee & Department Management |
| **Sooraj** | Asset Management, Asset Allocation & Transfer |
| **Anna** | Resource Booking, Maintenance & Notifications |
| **Joseph** | Dashboard, Reports, Audit, Analytics & Integration |

---

# 📌 Project Overview

AssetFlow is designed to help organizations efficiently manage:

- 📦 Enterprise Assets
- 👥 Employees & Departments
- 📅 Resource Booking
- 🔧 Maintenance Requests
- 📊 Reports & Analytics
- 📋 Audit Management
- 🔔 Notifications

The application provides role-based access control and a centralized dashboard for administrators and employees.

---

# ✨ Features

## 🔐 Authentication
- Secure Login
- JWT Authentication
- Role-Based Access Control
- User Registration

---

## 🏢 Organization Management

- Department Management
- Employee Directory
- Asset Categories
- User Roles

---

## 📦 Asset Management

- Asset Registration
- Asset Allocation
- Asset Transfer
- Asset Return
- Asset History
- Asset Status Tracking

---

## 📅 Resource Booking

- Resource Booking
- Booking Calendar
- Booking Approval
- Active Bookings

---

## 🔧 Maintenance

- Raise Maintenance Requests
- Assign Technician
- Track Maintenance Status
- Maintenance History

---

## 📋 Audit

- Create Audit Cycle
- Assign Auditors
- Verify Assets
- Missing Asset Reports
- Audit History

---

## 📊 Dashboard & Reports

- Dashboard KPIs
- Asset Utilization
- Booking Reports
- Maintenance Reports
- Department Statistics
- Export Reports

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

---

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- JWT Authentication
- Spring Data JPA (Hibernate)
- REST APIs

---

## Database

- MySQL

---

## Tools

- Git & GitHub
- Postman
- Maven
- IntelliJ IDEA / VS Code
- Excalidraw (UI Mockups)

---

# 📁 Project Structure

```text
AssetFlow
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/assetflow/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   ├── service/
│   │   │   │   └── AssetFlowApplication.java
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── database/
├── docs/
└── README.md
```

---

# 🗄 Database Modules

- Users
- Roles
- Departments
- Employees
- Asset Categories
- Assets
- Asset Allocation
- Resource Booking
- Maintenance
- Audit
- Activity Logs

---

# 👨‍💻 Development Workflow

```text
main
    ▲
    │
develop
    ▲
 ┌──┼────────┬────────┐
 │  │        │        │
Aparna  Sooraj   Anna   Joseph
```

Each team member works on their own feature branch.

Branches:

```
feature/aparna-auth

feature/sooraj-assets

feature/anna-booking

feature/joseph-dashboard
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/josephunited/Odoo-Hackathon_CodeCrushers.git
```

---

## Backend Setup

```bash
cd backend
```

Configure `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/assetflow

spring.datasource.username=root

spring.datasource.password=yourpassword
```

Run

```bash
mvn spring-boot:run
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 User Roles

- Admin
- Asset Manager
- Department Head
- Employee

---

# 📷 UI Design

The user interface was designed using **Excalidraw** and implemented using **React + Tailwind CSS**.

---

# 📈 Future Enhancements

- QR Code Asset Tracking
- RFID Integration
- Email Notifications
- Mobile Application
- AI-powered Asset Insights
- Predictive Maintenance

---

# 📄 License

This project was developed as part of the **Odoo Hackathon** for educational and demonstration purposes.

---

# 🙌 Acknowledgements

- Odoo Hackathon
- Spring Boot
- React
- Tailwind CSS
- MySQL
- Open Source Community

---

## ⭐ If you like this project, don't forget to star the repository!
