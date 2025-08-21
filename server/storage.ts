import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { members, admins, type Member, type InsertMember, type Admin, type InsertAdmin } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const connection = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(connection);

export interface IStorage {
  // Member operations
  createMember(member: InsertMember): Promise<Member>;
  getMemberByTrackingNumber(trackingNumber: string): Promise<Member | undefined>;
  getMemberById(id: string): Promise<Member | undefined>;
  updateMemberStatus(id: string, status: string, adminId?: string, rejectionReason?: string): Promise<void>;
  generateMembershipId(memberId: string): Promise<string>;
  getMembersByStatus(status: string, district?: string): Promise<Member[]>;
  getMembersByDistrict(district: string): Promise<Member[]>;
  
  // Admin operations
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminById(id: string): Promise<Admin | undefined>;
  
  // Statistics
  getApplicationStats(adminRole?: string, district?: string): Promise<{
    pending: number;
    verified: number;
    approved: number;
    rejected: number;
    total: number;
    thisMonth?: number;
    idsGenerated?: number;
    totalMembers?: number;
  }>;
  
  // Generate tracking number
  generateTrackingNumber(): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  async createMember(memberData: InsertMember): Promise<Member> {
    const trackingNumber = await this.generateTrackingNumber();
    
    const [member] = await db.insert(members).values({
      ...memberData,
      trackingNumber,
    }).returning();
    
    return member;
  }

  async getMemberByTrackingNumber(trackingNumber: string): Promise<Member | undefined> {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.trackingNumber, trackingNumber));
    
    return member;
  }

  async getMemberById(id: string): Promise<Member | undefined> {
    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, id));
    
    return member;
  }

  async updateMemberStatus(id: string, status: string, adminId?: string, rejectionReason?: string): Promise<void> {
    const updates: any = { status };
    
    if (status === 'verified' && adminId) {
      updates.verifiedBy = adminId;
      updates.verifiedAt = new Date();
    } else if (status === 'approved' && adminId) {
      updates.approvedBy = adminId;
      updates.approvedAt = new Date();
    } else if (status === 'rejected') {
      updates.rejectionReason = rejectionReason;
    }
    
    await db
      .update(members)
      .set(updates)
      .where(eq(members.id, id));
  }

  async generateMembershipId(memberId: string): Promise<string> {
    const year = new Date().getFullYear();
    const membershipId = `HCMS-${year}-MEM-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    
    await db
      .update(members)
      .set({ membershipId })
      .where(eq(members.id, memberId));
    
    return membershipId;
  }

  async getMembersByStatus(status: string, district?: string): Promise<Member[]> {
    if (district) {
      return await db
        .select()
        .from(members)
        .where(and(eq(members.status, status as any), eq(members.district, district)))
        .orderBy(desc(members.createdAt));
    }
    
    return await db
      .select()
      .from(members)
      .where(eq(members.status, status as any))
      .orderBy(desc(members.createdAt));
  }

  async getMembersByDistrict(district: string): Promise<Member[]> {
    return await db
      .select()
      .from(members)
      .where(eq(members.district, district))
      .orderBy(desc(members.createdAt));
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));
    
    return admin;
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, id));
    
    return admin;
  }

  async getApplicationStats(adminRole?: string, district?: string) {
    const baseQuery = db.select({ count: count() }).from(members);
    
    const [pendingResult] = await baseQuery.where(eq(members.status, 'submitted'));
    const [verifiedResult] = await baseQuery.where(eq(members.status, 'verified'));
    const [approvedResult] = await baseQuery.where(eq(members.status, 'approved'));
    const [rejectedResult] = await baseQuery.where(eq(members.status, 'rejected'));
    const [totalResult] = await baseQuery;
    
    const stats = {
      pending: pendingResult.count,
      verified: verifiedResult.count,
      approved: approvedResult.count,
      rejected: rejectedResult.count,
      total: totalResult.count,
    };

    if (adminRole === 'state_gs') {
      // Additional stats for state GS
      const [thisMonthResult] = await baseQuery.where(
        sql`EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
      );
      
      const [idsGeneratedResult] = await baseQuery.where(sql`membership_id IS NOT NULL`);
      
      return {
        ...stats,
        thisMonth: thisMonthResult.count,
        idsGenerated: idsGeneratedResult.count,
        totalMembers: approvedResult.count,
      };
    }

    return stats;
  }

  async generateTrackingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const randomNum = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
    return `HCMS-${year}-${randomNum}`;
  }
}

export const storage = new DatabaseStorage();
