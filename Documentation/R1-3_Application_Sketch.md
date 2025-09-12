# R1-3: High-Level Application Sketch
**Hardware-as-a-Service (HaaS) System Architecture**

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT SIDE                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          React.js Frontend                                  │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │ │
│  │  │   Login Page     │  │  Registration    │  │    User Portal           │  │ │
│  │  │                  │  │     Page         │  │                          │  │ │
│  │  │  - Username      │  │  - New Username  │  │  - Project Management   │  │ │
│  │  │  - Password      │  │  - New Password  │  │  - Hardware Status       │  │ │
│  │  │  - Login Button  │  │  - Confirm       │  │  - Resource Management  │  │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                   HTTP/HTTPS
                                   REST API
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 SERVER SIDE                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Flask Backend                                     │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │ │
│  │  │   User Mgmt      │  │  Project Mgmt    │  │   Hardware Mgmt          │  │ │
│  │  │   (app.py)       │  │   (app.py)       │  │    (app.py)              │  │ │
│  │  │                  │  │                  │  │                          │  │ │
│  │  │  - /login        │  │  - /create_proj  │  │  - /get_hw_info          │  │ │
│  │  │  - /add_user     │  │  - /join_proj    │  │  - /check_out            │  │ │
│  │  │  - /main         │  │  - /get_projects │  │  - /check_in             │  │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                        │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        Database Layer                                       │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │ │
│  │  │   usersDB.py     │  │  projectsDB.py   │  │   hardwareDB.py          │  │ │
│  │  │                  │  │                  │  │                          │  │ │
│  │  │  - addUser()     │  │  - createProject │  │  - createHardwareSet()   │  │ │
│  │  │  - login()       │  │  - queryProject  │  │  - queryHardwareSet()    │  │ │
│  │  │  - joinProject() │  │  - addUser()     │  │  - updateAvailability()  │  │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                    MongoDB
                                        │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE STORAGE                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           MongoDB Collections                               │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │ │
│  │  │     Users        │  │     Projects     │  │      Hardware            │  │ │
│  │  │                  │  │                  │  │                          │  │ │
│  │  │  - username      │  │  - projectID     │  │  - hardwareID            │  │ │
│  │  │  - password      │  │  - name          │  │  - name                  │  │ │
│  │  │  - userID        │  │  - description   │  │  - capacity              │  │ │
│  │  │  - projects[]    │  │  - members[]     │  │  - availability          │  │ │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## User Interface Flow

### 1. Authentication Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│                 │    │                 │    │                     │
│   Login Page    │───→│  Authentication │───→│   User Portal       │
│                 │    │                 │    │                     │
│  - Username     │    │  - Validate     │    │  - Projects List    │
│  - Password     │    │  - Encrypt      │    │  - Hardware Status  │
│                 │    │  - Session      │    │                     │
└─────────────────┘    └─────────────────┘    └─────────────────────┘
         │
         ▼
┌─────────────────┐
│                 │
│ Registration    │
│                 │
│  - New User     │
│  - Password     │
│  - Confirmation │
│                 │
└─────────────────┘
```

### 2. Project Management Flow
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   User Portal       │───→│  Project Selection  │───→│   Project View      │
│                     │    │                     │    │                     │
│  - Create Project   │    │  - My Projects      │    │  - Project Info     │
│  - Join Project     │    │  - Available Proj   │    │  - Members          │
│  - View Projects    │    │  - Search Projects  │    │  - Hardware Usage   │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### 3. Hardware Management Flow
```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   Hardware Status   │───→│  Resource Request   │───→│   Transaction       │
│                     │    │                     │    │                     │
│  - HWSet1 Status    │    │  - Select Type      │    │  - Checkout         │
│  - HWSet2 Status    │    │  - Enter Quantity   │    │  - Checkin          │
│  - Availability     │    │  - Check Available  │    │  - Update Status    │
│                     │    │                     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │───→│   Flask API     │───→│    Database     │
│   (React.js)    │    │   (Python)      │    │   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        │
         │                        │                        ▼
         │                        │               ┌─────────────────┐
         │                        │               │                 │
         │                        └───────────────│  Data Storage   │
         │                                        │                 │
         │                                        │  - Users        │
         │                                        │  - Projects     │
         │                                        │  - Hardware     │
         │                                        │                 │
         │                                        └─────────────────┘
         │                                                 │
         └─────────────────────────────────────────────────┘
                        Response Data
```

## Component Hierarchy

```
App
├── AuthenticationComponent
│   ├── LoginForm
│   └── RegistrationForm
├── UserPortal
│   ├── ProjectManager
│   │   ├── CreateProject
│   │   ├── JoinProject
│   │   └── ProjectList
│   └── HardwareManager
│       ├── HardwareStatus
│       ├── CheckoutForm
│       └── CheckinForm
└── DatabaseComponents
    ├── UserAPI
    ├── ProjectAPI
    └── HardwareAPI
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │                 │  │                 │  │              │ │
│  │   Frontend      │  │   Backend       │  │  Database    │ │
│  │   Security      │  │   Security      │  │  Security    │ │
│  │                 │  │                 │  │              │ │
│  │ - Input Valid   │  │ - Auth Tokens   │  │ - Encrypted  │ │
│  │ - XSS Protection│  │ - Password Hash │  │ - Access     │ │
│  │ - CSRF Tokens   │  │ - Session Mgmt  │  │ - Control    │ │
│  │                 │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

This high-level sketch provides a comprehensive view of the HaaS system architecture, showing the relationships between frontend, backend, and database components, as well as the user flow and security considerations.