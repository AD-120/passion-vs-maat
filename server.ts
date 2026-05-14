import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route to send email
  app.post('/api/send-tier-list', async (req, res) => {
    const { name, maatLevels, bushidoLevels } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const formatLevels = (levels: any[]) => {
      return levels.map(level => `
        <div style="margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 5px solid ${level.color}">
          <h3 style="margin: 0 0 10px 0; font-family: sans-serif; color: #333;">${level.name}</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${level.items.map((item: string) => `<li style="margin-bottom: 5px; font-family: sans-serif; color: #555;">${item}</li>`).join('')}
            ${level.items.length === 0 ? '<li style="color: #999; font-style: italic;">אין פריטים בדירוג זה</li>' : ''}
          </ul>
        </div>
      `).join('');
    };

    const htmlContent = `
      <div style="direction: rtl; font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
        <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">דירוג המידות של ${name}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.8;">שילוב של 42 הצהרות המעת וקוד הבושידו</p>
        </div>
        
        <div style="padding: 20px;">
          <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748;">42 הצהרות המעת (נגד אדם ורכוש)</h2>
          ${formatLevels(maatLevels)}
          
          <h2 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px; color: #2d3748;">קוד הבושידו</h2>
          ${formatLevels(bushidoLevels)}
        </div>
        
        <div style="background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7;">
          נשלח מהאפליקציה Spiritual Tier List
        </div>
      </div>
    `;

    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not provided. Email not sent.');
        return res.status(200).json({ 
          success: true, 
          message: 'האפליקציה במצב דמו (אין פרטי SMTP), אבל התצוגה מוכנה!',
          htmlPreview: htmlContent 
        });
      }

      await transporter.sendMail({
        from: `"Spiritual Tier List" <${process.env.SMTP_USER}>`,
        to: "avrahaaam@gmail.com",
        subject: `דירוג רוחני חדש מאת: ${name}`,
        html: htmlContent,
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
