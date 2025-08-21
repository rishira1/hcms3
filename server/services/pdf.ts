import PDFDocument from 'pdfkit';

interface MembershipCardData {
  name: string;
  membershipId: string;
  photoUrl: string;
  designation: string;
  district: string;
  validUntil: string;
}

export async function generateMembershipCard(data: MembershipCardData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [336, 212], // Credit card size (3.375" x 2.125" at 96 DPI)
        margins: { top: 10, bottom: 10, left: 10, right: 10 }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Card background and border
      doc.rect(0, 0, 336, 212)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      // Header background
      doc.rect(0, 0, 336, 50)
         .fillAndStroke('#2563eb', '#1d4ed8');

      // Header text
      doc.fillColor('white')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('HEALTHCARE MANAGEMENT SYSTEM', 10, 15);

      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica')
         .text('Official Membership Card', 10, 32);

      // Member photo placeholder (would be actual photo in real implementation)
      doc.rect(15, 60, 60, 75)
         .fillAndStroke('#e5e7eb', '#d1d5db');
      
      doc.fillColor('#6b7280')
         .fontSize(8)
         .text('PHOTO', 35, 90);

      // Member information
      doc.fillColor('#1f2937')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(data.name, 85, 65);

      doc.fillColor('#4b5563')
         .fontSize(9)
         .font('Helvetica')
         .text(`ID: ${data.membershipId}`, 85, 82);

      doc.text(`Designation: ${data.designation}`, 85, 95);
      doc.text(`District: ${data.district}`, 85, 108);

      // Valid until
      doc.fillColor('#059669')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text(`Valid Until: ${data.validUntil}`, 85, 125);

      // Footer
      doc.fillColor('#6b7280')
         .fontSize(7)
         .font('Helvetica')
         .text('This is an official membership card. Keep it safe and present when required.', 15, 155);

      // QR code placeholder (would be actual QR code in real implementation)
      doc.rect(250, 60, 70, 70)
         .fillAndStroke('#f3f4f6', '#d1d5db');
      
      doc.fillColor('#6b7280')
         .fontSize(8)
         .text('QR CODE', 270, 90);

      // Government logo placeholder
      doc.fillColor('#6b7280')
         .fontSize(6)
         .text('Govt. Logo', 15, 180);

      // Security features
      doc.fillColor('#e2e8f0')
         .fontSize(6)
         .text('*** OFFICIAL DOCUMENT ***', 85, 180);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
