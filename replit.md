# HCMS Membership Registration System

## Overview

This is a full-stack web application for Healthcare Management System (HCMS) membership registration. The application provides a complete registration workflow with payment processing, document upload, and multi-level approval system. It includes a user-facing registration portal and separate admin dashboards for District GS and State GS roles to manage the approval process.

The system handles membership applications, payment processing, document verification, and generates digital membership cards upon approval. Built with React, Node.js, and PostgreSQL, it provides a professional and secure platform for healthcare professional membership management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, professional UI design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication for admin users
- **File Upload**: Multer for handling multipart form data
- **API Design**: RESTful API structure with proper error handling middleware

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Tables**: 
  - Members table with comprehensive user data, document URLs, and application status
  - Admins table for role-based access control (District GS vs State GS)
- **Enums**: Strongly typed enums for gender, membership types, directorates, and application status

### Authentication & Authorization
- **Admin Authentication**: JWT tokens stored in localStorage with automatic token refresh
- **Role-based Access**: District GS and State GS roles with different permissions
- **Protected Routes**: Route guards based on authentication status and user roles
- **Multi-tab Synchronization**: Storage events for consistent auth state across browser tabs

### File Storage & Management
- **Cloud Storage**: Cloudinary for storing photos, ID cards, and signatures
- **Upload Handling**: Secure file upload with size and type validation
- **URL Management**: Cloudinary URLs stored in database for reliable access

### Payment Processing
- **Payment Gateway**: Razorpay integration supporting UPI, cards, and net banking
- **Amount**: Fixed ₹2000 fee for both new memberships and renewals
- **Security**: Payment signature verification for transaction authenticity
- **Order Management**: Proper order creation and payment verification flow

### Document Generation
- **PDF Generation**: PDFKit for creating professional membership ID cards
- **Card Design**: Credit card sized membership cards with member photos and details
- **Template System**: Structured PDF generation with proper formatting and branding

### Email System
- **Email Service**: Resend for modern, reliable email delivery
- **Notification Types**:
  - Registration confirmation with tracking number
  - Application approval with PDF attachment
  - Application rejection with reason
- **Template System**: HTML email templates for professional communication

### Admin Dashboard System
- **District GS Dashboard**: 
  - View applications from their district
  - Verify or reject applications with reasons
  - Application statistics and filtering
- **State GS Dashboard**:
  - Approve verified applications statewide
  - Generate unique membership IDs
  - Send approval emails with PDF cards
  - Comprehensive analytics and reporting

### Application Workflow
- **Multi-step Process**: Registration → Payment → District Verification → State Approval
- **Status Tracking**: Real-time status updates with tracking numbers
- **Rejection Handling**: Proper rejection flow with reason capture and email notification
- **ID Generation**: Unique membership ID generation upon final approval
- **ID Card Download**: Approved members can download their PDF membership cards via tracking page

### Security Measures
- **Input Validation**: Comprehensive validation using Zod schemas
- **File Security**: File type and size validation for uploads
- **Authentication**: Secure JWT implementation with proper expiration
- **CORS**: Proper cross-origin request handling
- **Environment Variables**: Sensitive data stored in environment variables

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **Cloudinary**: Cloud-based media storage and optimization service
- **Vercel**: Deployment platform for both frontend and backend hosting

### Payment & Communication
- **Razorpay**: Payment gateway for Indian market with UPI, card, and net banking support
- **Resend**: Modern email delivery service for transactional emails and notifications

### Development & Build Tools
- **Replit**: Development environment with live preview and collaboration features
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS compilation

### UI & Component Libraries
- **Radix UI**: Unstyled, accessible UI primitives for building the design system
- **Lucide React**: Modern icon library for consistent iconography
- **React Hook Form**: Form handling with performance optimization
- **TanStack Query**: Server state management with caching and synchronization

### File Processing & Generation
- **Multer**: Multipart/form-data handling for file uploads
- **PDFKit**: Client-side PDF generation for membership cards
- **Sharp** (via Cloudinary): Image processing and optimization

### Authentication & Security
- **bcrypt**: Password hashing for admin accounts
- **jsonwebtoken**: JWT token generation and verification
- **crypto**: Native Node.js crypto module for payment signature verification

### Type Safety & Validation
- **Zod**: Runtime type validation and schema definition
- **TypeScript**: Static type checking across the entire application
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for database validation