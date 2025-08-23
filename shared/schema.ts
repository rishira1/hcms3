import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const genderEnum = pgEnum('gender', ['Male', 'Female']);
export const membershipTypeEnum = pgEnum('membership_type', ['New Membership', 'Annual Subscription fee']);
export const directorateEnum = pgEnum('directorate', ['DME', 'DMRHS', 'DPH&PM', 'ESI', 'Other']);
export const applicationStatusEnum = pgEnum('application_status', ['submitted', 'verified', 'approved', 'rejected']);
export const adminRoleEnum = pgEnum('admin_role', ['district_gs', 'state_gs']);

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackingNumber: varchar("tracking_number").notNull().unique(),
  
  // Personal Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  qualification: text("qualification").notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  spouseName: text("spouse_name"),
  panNumber: varchar("pan_number", { length: 10 }).notNull(),
  aadhaar: varchar("aadhaar", { length: 14 }).notNull(),
  joiningDate: date("joining_date").notNull(),
  address: text("address").notNull(),
  
  // Work Information
  designation: text("designation").notNull(),
  directorate: text("directorate").notNull(),
  workingStation: text("working_station").notNull(),
  district: text("district").notNull(),
  
  // Membership Information
  membershipType: membershipTypeEnum("membership_type").notNull(),
  membershipId: varchar("membership_id").unique(),
  
  // Documents (Cloudinary URLs)
  photoUrl: text("photo_url").notNull(),
  idCardUrl: text("id_card_url").notNull(),
  signatureUrl: text("signature_url").notNull(),
  
  // Payment Information
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status").default("pending"),
  amount: decimal("amount").default("2000"),
  
  // Status and workflow
  status: applicationStatusEnum("status").default("submitted"),
  rejectionReason: text("rejection_reason"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  approvedAt: timestamp("approved_at"),
  
  // Admin who processed
  verifiedBy: varchar("verified_by"),
  approvedBy: varchar("approved_by"),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: adminRoleEnum("role").notNull(),
  district: text("district"), // For district_gs, which district they manage
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  trackingNumber: true,
  membershipId: true,
  createdAt: true,
  verifiedAt: true,
  approvedAt: true,
  verifiedBy: true,
  approvedBy: true,
}).extend({
  name: z.string().min(1, "Name is required").regex(/^[A-Za-z\s]+$/, "Name should contain only letters and spaces"),
  email: z.string().email("Invalid email format"),
  qualification: z.string().min(1, "Qualification is required"),
  aadhaar: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, "Aadhaar should be in format: 1234 5678 9012"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const loginAdminSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(['district_gs', 'state_gs']),
});

// Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type LoginAdmin = z.infer<typeof loginAdminSchema>;

// Districts list
export const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam", 
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram"
] as const;
