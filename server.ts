import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db, ADMIN_ALLOWLIST } from './server/store';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper middleware to extract current user (using simple session header or default demo user)
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    req.user = db.getUserById(userId);
  }
  next();
});

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// --- AUTH ENDPOINTS ---
app.get('/api/auth/me', (req, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  // Default to student demo user if not logged in
  const defaultUser = db.getUserById('user-demo-1') || db.getUsers()[0];
  res.json({ user: defaultUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If logging in with demo admin or new email
    const isAllowlisted = ADMIN_ALLOWLIST.includes(email.toLowerCase().trim()) || db.isEmailAdmin(email);
    const assignedRole = role === 'admin' && isAllowlisted ? 'admin' : 'user';
    const result = db.createUser({
      name: email.split('@')[0],
      email,
      requestedRole: assignedRole,
    });
    user = result.user;
  }

  res.json({ user, message: 'Logged in successfully' });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isAllowlisted = ADMIN_ALLOWLIST.includes(normalizedEmail) || db.isEmailAdmin(normalizedEmail);
  const requestedRole = role === 'admin' ? 'admin' : 'user';

  const { user, isAdminApproved } = db.createUser({
    name,
    email: normalizedEmail,
    requestedRole,
  });

  res.json({
    user,
    isAdminApproved,
    message: requestedRole === 'admin' && !isAdminApproved
      ? 'Admin request pending allowlist authorization. Account created as student user.'
      : 'Account created successfully',
  });
});

app.post('/api/auth/switch-demo', (req, res) => {
  const { role } = req.body; // 'user' | 'admin'
  const targetId = role === 'admin' ? 'admin-demo-1' : 'user-demo-1';
  const user = db.getUserById(targetId) || db.getUsers()[0];
  res.json({ user });
});

// --- OPPORTUNITY ENDPOINTS ---
app.get('/api/opportunities', (req, res) => {
  const { category, search, domain, mode, status, geography, sortBy, page = '1', limit = '12' } = req.query;

  let opportunities = db.getOpportunities({
    category: category as string,
    search: search as string,
    domain: domain as string,
    mode: mode as string,
    status: status as string,
    geography: geography as string,
    includePending: false,
  });

  // Sorting
  if (sortBy === 'deadline_asc') {
    opportunities.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sortBy === 'start_date') {
    opportunities.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  } else if (sortBy === 'popularity') {
    opportunities.sort((a, b) => b.bookmarksCount - a.bookmarksCount);
  } else if (sortBy === 'organization') {
    opportunities.sort((a, b) => a.organization.localeCompare(b.organization));
  } else if (sortBy === 'recently_updated') {
    opportunities.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else {
    // Default: nearest deadline first among active ones
    opportunities.sort((a, b) => {
      if (a.status === 'closed' && b.status !== 'closed') return 1;
      if (a.status !== 'closed' && b.status === 'closed') return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
  const total = opportunities.length;
  const paginated = opportunities.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

app.get('/api/opportunities/:id', (req, res) => {
  const op = db.getOpportunityById(req.params.id);
  if (!op) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ data: op });
});

// Admin Opportunity CRUD
app.post('/api/opportunities', (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const op = db.createOpportunity({
    ...req.body,
    verificationStatus: 'verified',
    status: req.body.status || 'open',
    source: req.body.source || 'Admin Direct Entry',
  });
  res.status(201).json({ data: op });
});

app.patch('/api/opportunities/:id', (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const updated = db.updateOpportunity(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ data: updated });
});

app.delete('/api/opportunities/:id', (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const success = db.deleteOpportunity(req.params.id, true);
  if (!success) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ success: true, message: 'Opportunity archived successfully' });
});

app.post('/api/admin/bulk-delete', (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Array of opportunity IDs is required' });
  }

  let deletedCount = 0;
  for (const id of ids) {
    if (db.deleteOpportunity(id, true)) {
      deletedCount++;
    }
  }

  res.json({ success: true, deletedCount, message: `Successfully removed ${deletedCount} opportunities` });
});

// --- BOOKMARKS ---
app.get('/api/bookmarks', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const saved = db.getBookmarks(userId);
  res.json({ data: saved });
});

app.post('/api/bookmarks/toggle', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const { opportunityId } = req.body;
  if (!opportunityId) {
    return res.status(400).json({ error: 'opportunityId is required' });
  }
  const result = db.toggleBookmark(userId, opportunityId);
  res.json(result);
});

// --- REMINDERS ---
app.get('/api/reminders', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const reminders = db.getReminders(userId);
  res.json({ data: reminders });
});

app.post('/api/reminders', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const { opportunityId, deadline, daysBefore, frequency, preferredTime, timezone } = req.body;
  if (!opportunityId || !deadline) {
    return res.status(400).json({ error: 'opportunityId and deadline are required' });
  }

  const reminder = db.createReminder({
    userId,
    opportunityId,
    deadline,
    daysBefore: daysBefore || 3,
    frequency: frequency || 'every_3_days',
    preferredTime: preferredTime || '20:00',
    timezone: timezone || 'UTC',
  });

  res.status(201).json({ data: reminder, message: 'Reminder set successfully' });
});

app.delete('/api/reminders/:id', (req, res) => {
  const success = db.deleteReminder(req.params.id);
  res.json({ success });
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const notifs = db.getNotifications(userId);
  const unreadCount = notifs.filter((n) => !n.read).length;
  res.json({ data: notifs, unreadCount });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const success = db.markNotificationRead(req.params.id);
  res.json({ success });
});

app.post('/api/notifications/mark-all-read', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  db.markAllNotificationsRead(userId);
  res.json({ success: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const success = db.dismissNotification(req.params.id);
  res.json({ success });
});

// --- ADMIN STATS & REVIEW QUEUE ---
app.get('/api/admin/stats', (req, res) => {
  const allOps = db.getOpportunities({ includePending: true });
  const activeOps = allOps.filter((o) => o.status === 'open' || o.status === 'closing_soon');
  const expiredOps = allOps.filter((o) => o.status === 'closed');
  const reviewQueue = db.getReviewQueue();
  const admins = db.getAdmins();

  res.json({
    total: allOps.length,
    hackathons: allOps.filter((o) => o.category === 'hackathon' && o.verificationStatus === 'verified').length,
    internships: allOps.filter((o) => o.category === 'internship' && o.verificationStatus === 'verified').length,
    research: allOps.filter((o) => o.category === 'research' && o.verificationStatus === 'verified').length,
    active: activeOps.length,
    expired: expiredOps.length,
    pendingReview: reviewQueue.length,
    aiDiscovered: allOps.filter((o) => o.source.includes('AI') || o.source.includes('Gemini')).length,
    allowlistedEmails: admins.map((a) => a.email),
    adminsCount: admins.length,
    pendingRequestsCount: db.getAdminAccessRequests().filter((r) => r.status === 'pending').length,
  });
});

// ==========================================
// --- ADMIN AUTH & APPROVAL WORKFLOW API ---
// ==========================================

// Verify if an email is registered in the admin database
app.post('/api/admin/auth/verify-email', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const adminRecord = db.getAdminByEmail(normalizedEmail);

  if (adminRecord) {
    return res.json({
      exists: true,
      message: 'Email registered in admin directory.',
    });
  } else {
    return res.json({
      exists: false,
      message: 'Access Denied',
    });
  }
});

// Login as admin: requires valid email in admins.json and matching password
app.post('/api/admin/auth/login', (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const adminRecord = db.getAdminByEmail(normalizedEmail);

  // If email is NOT in admins.json
  if (!adminRecord) {
    return res.status(403).json({
      success: false,
      exists: false,
      error: 'Access Denied: Your email is not registered as an administrator.',
    });
  }

  // If email IS in admins.json
  if (!password) {
    return res.status(400).json({
      error: 'Password is required to access admin mode.',
      requiresPassword: true,
    });
  }

  if (adminRecord.password !== password) {
    return res.status(401).json({
      error: 'Incorrect password. Please verify and try again.',
    });
  }

  let user = db.getUserByEmail(normalizedEmail);
  if (!user) {
    const created = db.createUser({
      name: adminRecord.name || name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      requestedRole: 'admin',
    });
    user = created.user;
  } else if (user.role !== 'admin') {
    user = db.updateUser(user.id, { role: 'admin' }) || user;
  }

  return res.json({
    success: true,
    user,
    isPrimary: adminRecord.isPrimary,
    message: 'Admin access verified',
  });
});

// Explicitly submit an access request to administrator
app.post('/api/admin/auth/request-access', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const accessReq = db.createAdminAccessRequest(normalizedEmail, name);
  res.json({
    success: true,
    requestId: accessReq.id,
    expiresAt: accessReq.expiresAt,
    message: 'Access request sent to administrator. Awaiting authorization.',
  });
});

// Check status of a pending access request (polled by client)
app.get('/api/admin/auth/status', (req, res) => {
  const { id, email } = req.query;
  db.cleanExpiredRequests();

  let reqItem = null;
  if (id) {
    reqItem = db.getAdminAccessRequestById(id as string);
  } else if (email) {
    reqItem = db.getAdminAccessRequestByEmail(email as string);
  }

  if (!reqItem) {
    return res.json({ status: 'not_found' });
  }

  if (reqItem.status === 'accepted') {
    let user = db.getUserByEmail(reqItem.email);
    if (!user) {
      const created = db.createUser({
        name: reqItem.name || reqItem.email.split('@')[0],
        email: reqItem.email,
        requestedRole: 'admin',
      });
      user = created.user;
    } else if (user.role !== 'admin') {
      user = db.updateUser(user.id, { role: 'admin' }) || user;
    }

    return res.json({
      status: 'accepted',
      user,
      message: 'Admin permission accepted! You now have admin access.',
    });
  }

  if (reqItem.status === 'rejected') {
    return res.json({
      status: 'rejected',
      message: 'u cant acess it',
    });
  }

  if (reqItem.status === 'expired') {
    return res.json({
      status: 'expired',
      message: 'henceforth not a authorised admin pls contact PRATIK',
    });
  }

  // Pending
  const remainingSeconds = Math.max(
    0,
    Math.round((new Date(reqItem.expiresAt).getTime() - Date.now()) / 1000)
  );

  return res.json({
    status: 'pending',
    requestId: reqItem.id,
    email: reqItem.email,
    requestedAt: reqItem.requestedAt,
    expiresAt: reqItem.expiresAt,
    remainingSeconds,
    targetAdminEmail: 'freeuser13012026@gmail.com',
  });
});

// Cancel a pending access request
app.post('/api/admin/auth/cancel-request', (req, res) => {
  const { id } = req.body;
  if (id) {
    const r = db.getAdminAccessRequestById(id);
    if (r && r.status === 'pending') {
      r.status = 'expired';
      db.saveAdminRequests();
    }
  }
  res.json({ success: true });
});

// --- ADMIN MANAGEMENT ENDPOINTS ---

// List all approved admins and pending requests
app.get('/api/admin/manage/list', (req, res) => {
  db.cleanExpiredRequests();
  const admins = db.getAdmins();
  const requests = db.getAdminAccessRequests();
  res.json({
    admins,
    requests,
    primaryEmails: ['pratikpanda2006@gmail.com', 'freeuser13012026@gmail.com'],
  });
});

// Primary admin adds a new admin directly
app.post('/api/admin/manage/add', (req, res) => {
  const { email, password, name, addedBy } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const result = db.addAdmin({
    email,
    password: password || 'admin@2026',
    name,
    addedBy: addedBy || 'Primary Administrator',
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    admin: result.admin,
    message: `Admin ${email} added successfully with default password.`,
  });
});

// Update password of self or another admin (if primary)
app.post('/api/admin/manage/change-password', (req, res) => {
  const { email, newPassword, callerEmail } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  const normalizedCaller = (callerEmail || '').toLowerCase().trim();
  const normalizedTarget = email.toLowerCase().trim();

  // If modifying someone else's password, must be primary admin
  if (normalizedCaller && normalizedCaller !== normalizedTarget) {
    if (!db.isPrimaryAdmin(normalizedCaller)) {
      return res.status(403).json({
        error: 'Only primary administrators (pratikpanda2006@gmail.com / freeuser13012026@gmail.com) can change other admins’ passwords.',
      });
    }
  }

  const result = db.updateAdminPassword(normalizedTarget, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: `Password updated successfully for ${normalizedTarget}.` });
});

// Remove an admin (cannot remove primary admins)
app.post('/api/admin/manage/remove', (req, res) => {
  const { email, callerEmail } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedCaller = (callerEmail || '').toLowerCase().trim();
  if (normalizedCaller && !db.isPrimaryAdmin(normalizedCaller)) {
    return res.status(403).json({
      error: 'Only primary administrators can remove other administrators.',
    });
  }

  const result = db.removeAdmin(email);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: `Admin ${email} removed successfully.` });
});

// Primary admin accepts an access request
app.post('/api/admin/manage/requests/:id/accept', (req, res) => {
  const { reviewedBy } = req.body;
  const result = db.acceptAdminAccessRequest(req.params.id, reviewedBy || 'freeuser13012026@gmail.com');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    success: true,
    admin: result.admin,
    message: 'Access request accepted. User added to admins list with default password admin@2026.',
  });
});

// Primary admin rejects an access request
app.post('/api/admin/manage/requests/:id/reject', (req, res) => {
  const { reviewedBy } = req.body;
  const result = db.rejectAdminAccessRequest(req.params.id, reviewedBy || 'freeuser13012026@gmail.com');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    success: true,
    message: 'Access request rejected. User will receive denial notification.',
  });
});

app.get('/api/admin/review', (req, res) => {
  const queue = db.getReviewQueue();
  res.json({ data: queue });
});

app.post('/api/admin/review/:id/approve', (req, res) => {
  const updated = db.approveOpportunity(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ data: updated, message: 'Opportunity approved and published!' });
});

app.post('/api/admin/review/:id/reject', (req, res) => {
  const updated = db.rejectOpportunity(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ data: updated, message: 'Opportunity rejected.' });
});

app.post('/api/admin/discover', async (req, res) => {
  try {
    const { category } = req.body;
    const result = await db.runAIDiscovery(category);
    res.json({
      success: true,
      ...result,
      message: `Discovered ${result.discoveredCount} new opportunities (${result.duplicatesSkipped} duplicates skipped). Submitted to Review Queue.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Discovery pipeline failed' });
  }
});

// --- AI PDF & LINK EXTRACTION FOR REVIEW QUEUE ---
app.get('/api/admin/config/gemini-key', (req, res) => {
  const currentKey = db.getGeminiApiKey();
  const maskedKey = currentKey
    ? (currentKey.length > 8 ? `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}` : '****')
    : null;
  res.json({
    configured: !!currentKey,
    maskedKey,
  });
});

app.post('/api/admin/config/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }
  db.setGeminiApiKey(apiKey.trim());
  res.json({
    success: true,
    message: 'Gemini API key updated successfully.',
    maskedKey: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`,
  });
});

const handleExtractOpportunities = async (req: express.Request, res: express.Response) => {
  try {
    const { pdfBase64, text, urls, apiKey, category, useFallbackSample } = req.body;

    const result = await db.extractOpportunitiesFromContent({
      pdfBase64,
      text,
      urls,
      apiKey,
      category,
      useFallbackSample,
    });

    if (result.limitExceeded && result.discoveredCount === 0) {
      return res.status(429).json({
        success: false,
        error: 'limit of ai exceeded pls use new api key',
        limitExceeded: true,
        message: 'limit of ai exceeded pls use new api key',
      });
    }

    res.json({
      success: true,
      discoveredCount: result.discoveredCount,
      duplicatesSkipped: result.duplicatesSkipped,
      items: result.items,
      limitExceeded: result.limitExceeded,
      warning: result.warning,
      message: result.limitExceeded
        ? `limit of ai exceeded pls use new api key (Extracted ${result.discoveredCount} opportunities via fallback)`
        : `Extracted ${result.discoveredCount} opportunities (${result.duplicatesSkipped} duplicates skipped). Submitted to AI Review Queue.`,
    });
  } catch (err: any) {
    const errMsg = (err.message || '').toLowerCase();
    const isLimit =
      err.status === 429 ||
      err.limitExceeded ||
      errMsg.includes('limit of ai exceeded') ||
      errMsg.includes('resource_exhausted') ||
      errMsg.includes('quota') ||
      errMsg.includes('rate limit');

    if (isLimit) {
      return res.status(429).json({
        success: false,
        error: 'limit of ai exceeded pls use new api key',
        limitExceeded: true,
        message: 'limit of ai exceeded pls use new api key',
      });
    }

    console.error('Error in opportunity extraction:', err);
    res.status(500).json({ error: err.message || 'Failed to extract opportunities' });
  }
};

app.post('/api/admin/extract-opportunities', handleExtractOpportunities);
app.post('/api/admin/extract-from-source', handleExtractOpportunities);

// --- CRON ENGINE ENDPOINTS ---
app.post('/api/cron/process-reminders', (req, res) => {
  const result = db.processReminders();
  res.json({ success: true, ...result });
});

app.post('/api/cron/check-expiry', (req, res) => {
  const result = db.checkExpiry();
  res.json({ success: true, ...result });
});

// --- AI ELIGIBILITY ADVISOR ---
app.post('/api/ai/eligibility', async (req, res) => {
  try {
    const { opportunityId, profile } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: 'opportunityId is required' });
    }
    const result = await db.checkEligibility(opportunityId, profile || {
      skills: ['Python', 'TypeScript', 'PyTorch'],
      interests: ['AI/ML', 'Software Development'],
      education: 'Undergraduate Student',
    });
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Eligibility check failed' });
  }
});

// --- USER PROFILE & ONBOARDING ---
app.patch('/api/user/profile', (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const updated = db.updateUser(userId, req.body);
  res.json({ data: updated });
});

// --- VITE DEV / PRODUCTION STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexup Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
