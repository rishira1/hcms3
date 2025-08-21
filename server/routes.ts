import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { storage } from "./storage";
import { uploadFile } from "./services/cloudinary";
import { createPaymentOrder, verifyPaymentSignature } from "./services/payment";
import { sendRegistrationConfirmation, sendApprovalNotification, sendRejectionNotification } from "./services/email";
import { generateMembershipCard } from "./services/pdf";
import { insertMemberSchema, loginAdminSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate admin users
const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await storage.getAdminById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Member registration endpoint
  app.post("/api/register", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idCard', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
  ]), async (req, res) => {
    try {
      // Validate form data
      const memberData = insertMemberSchema.parse(req.body);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.photo?.[0] || !files.idCard?.[0] || !files.signature?.[0]) {
        return res.status(400).json({ message: 'All files (photo, ID card, signature) are required' });
      }

      // Upload files to Cloudinary
      const [photoResult, idCardResult, signatureResult] = await Promise.all([
        uploadFile(files.photo[0].buffer, `photo_${Date.now()}`, 'hcms/photos'),
        uploadFile(files.idCard[0].buffer, `id_${Date.now()}`, 'hcms/ids'),
        uploadFile(files.signature[0].buffer, `sig_${Date.now()}`, 'hcms/signatures')
      ]);

      // Create member record
      const member = await storage.createMember({
        ...memberData,
        photoUrl: photoResult.secure_url,
        idCardUrl: idCardResult.secure_url,
        signatureUrl: signatureResult.secure_url,
        paymentStatus: 'pending'
      });

      res.json({
        success: true,
        trackingNumber: member.trackingNumber,
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          trackingNumber: member.trackingNumber
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: error.message || 'Registration failed',
        errors: error.issues || []
      });
    }
  });

  // Create payment order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { trackingNumber, amount = 2000 } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({ message: 'Tracking number is required' });
      }

      const member = await storage.getMemberByTrackingNumber(trackingNumber);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      const order = await createPaymentOrder(amount, trackingNumber);
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error('Payment order creation error:', error);
      res.status(500).json({ message: 'Failed to create payment order' });
    }
  });

  // Verify payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { paymentId, orderId, signature, trackingNumber } = req.body;

      if (!verifyPaymentSignature(paymentId, orderId, signature)) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      const member = await storage.getMemberByTrackingNumber(trackingNumber);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

      // Update payment status
      await storage.updateMemberStatus(member.id, 'submitted');
      
      // Send confirmation email
      await sendRegistrationConfirmation(member.email, member.name, member.trackingNumber);

      res.json({ success: true, message: 'Payment verified successfully' });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.status(500).json({ message: 'Payment verification failed' });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password, role } = loginAdminSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin || admin.role !== role) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username, role: admin.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
          district: admin.district
        }
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(400).json({ 
        message: error.message || 'Login failed',
        errors: error.issues || []
      });
    }
  });

  // Get applications for admin dashboard
  app.get("/api/admin/applications", authenticateAdmin, async (req: any, res) => {
    try {
      const { status, district } = req.query;
      const admin = req.admin;

      let applications;
      if (admin.role === 'district_gs') {
        // District GS sees applications from their district
        applications = await storage.getMembersByDistrict(admin.district || district);
        if (status) {
          applications = applications.filter(app => app.status === status);
        }
      } else if (admin.role === 'state_gs') {
        // State GS sees verified applications
        applications = await storage.getMembersByStatus(status || 'verified');
      }

      res.json({ applications: applications || [] });
    } catch (error: any) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });

  // Get application statistics
  app.get("/api/admin/stats", authenticateAdmin, async (req: any, res) => {
    try {
      const admin = req.admin;
      const stats = await storage.getApplicationStats(admin.role, admin.district);
      res.json(stats);
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Update application status (verify/reject by District GS)
  app.post("/api/admin/applications/:id/status", authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const admin = req.admin;

      if (admin.role !== 'district_gs' && admin.role !== 'state_gs') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const member = await storage.getMemberById(id);
      if (!member) {
        return res.status(404).json({ message: 'Application not found' });
      }

      await storage.updateMemberStatus(id, status, admin.id, rejectionReason);

      // Send notification email
      if (status === 'rejected') {
        await sendRejectionNotification(member.email, member.name, rejectionReason);
      }

      res.json({ success: true, message: 'Application status updated' });
    } catch (error: any) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Failed to update application status' });
    }
  });

  // Approve application and generate membership ID (State GS only)
  app.post("/api/admin/applications/:id/approve", authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const admin = req.admin;

      if (admin.role !== 'state_gs') {
        return res.status(403).json({ message: 'Only State GS can approve applications' });
      }

      const member = await storage.getMemberById(id);
      if (!member) {
        return res.status(404).json({ message: 'Application not found' });
      }

      if (member.status !== 'verified') {
        return res.status(400).json({ message: 'Application must be verified before approval' });
      }

      // Generate membership ID and update status
      const membershipId = await storage.generateMembershipId(id);
      await storage.updateMemberStatus(id, 'approved', admin.id);

      // Generate PDF membership card
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      
      const pdfBuffer = await generateMembershipCard({
        name: member.name,
        membershipId,
        photoUrl: member.photoUrl,
        designation: member.designation,
        district: member.district,
        validUntil: validUntil.toLocaleDateString('en-GB')
      });

      // Send approval notification with PDF attachment
      await sendApprovalNotification(member.email, member.name, membershipId, pdfBuffer);

      res.json({ 
        success: true, 
        message: 'Application approved and membership card sent',
        membershipId 
      });
    } catch (error: any) {
      console.error('Approve application error:', error);
      res.status(500).json({ message: 'Failed to approve application' });
    }
  });

  // Track application by tracking number
  app.get("/api/track/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      const member = await storage.getMemberByTrackingNumber(trackingNumber);
      if (!member) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json({
        trackingNumber: member.trackingNumber,
        applicantName: member.name,
        membershipType: member.membershipType,
        submittedDate: member.createdAt,
        status: member.status,
        membershipId: member.membershipId,
        rejectionReason: member.rejectionReason
      });
    } catch (error: any) {
      console.error('Track application error:', error);
      res.status(500).json({ message: 'Failed to track application' });
    }
  });

  // Get single application details (for admin view)
  app.get("/api/admin/applications/:id", authenticateAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const member = await storage.getMemberById(id);
      if (!member) {
        return res.status(404).json({ message: 'Application not found' });
      }

      res.json(member);
    } catch (error: any) {
      console.error('Get application details error:', error);
      res.status(500).json({ message: 'Failed to fetch application details' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
