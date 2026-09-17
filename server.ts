import 'dotenv/config';
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
app.use(async (req, res, next) => {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    req.user = await db.getUserById(userId);
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
app.get('/api/auth/me', async (req, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  const users = await db.getUsers();
  const defaultUser = (await db.getUserById('user-demo-1')) || users[0];
  res.json({ user: defaultUser });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = await db.getUserByEmail(email);
  if (!user) {
    const isAllowlisted = ADMIN_ALLOWLIST.includes(email.toLowerCase().trim()) || (await db.isEmailAdmin(email));
    const assignedRole = role === 'admin' && isAllowlisted ? 'admin' : 'user';
    const result = await db.createUser({
      name: email.split('@')[0],
      email,
      requestedRole: assignedRole,
    });
    user = result.user;
  }

  res.json({ user, message: 'Logged in successfully' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const requestedRole = role === 'admin' ? 'admin' : 'user';

  const { user, isAdminApproved } = await db.createUser({
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

app.post('/api/auth/switch-demo', async (req, res) => {
  const { role } = req.body;
  const targetId = role === 'admin' ? 'admin-demo-1' : 'user-demo-1';
  const users = await db.getUsers();
  const user = (await db.getUserById(targetId)) || users[0];
  res.json({ user });
});

// --- OPPORTUNITY ENDPOINTS ---
app.get('/api/opportunities', async (req, res) => {
  const { category, search, domain, mode, status, geography, sortBy, page = '1', limit = '12' } = req.query;

  let opportunities = await db.getOpportunities({
    category: category as string,
    search: search as string,
    domain: domain as string,
    mode: mode as string,
    status: status as string,
    geography: geography as string,
    includePending: false,
  });

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

app.get('/api/opportunities/:id', async (req, res) => {
  const op = await db.getOpportunityById(req.params.id);
  if (!op) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ data: op });
});

app.post('/api/opportunities', async (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const op = await db.createOpportunity({
    ...req.body,
    verificationStatus: 'verified',
    status: req.body.status || 'open',
    source: req.body.source || 'Admin Direct Entry',
  });
  res.status(201).json({ data: op });
});

app.patch('/api/opportunities/:id', async (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const updated = await db.updateOpportunity(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ data: updated });
});

app.delete('/api/opportunities/:id', async (req, res) => {
  const currentRole = req.user?.role || 'admin';
  if (currentRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Admin role required' });
  }

  const success = await db.deleteOpportunity(req.params.id, true);
  if (!success) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json({ success: true, message: 'Opportunity archived successfully' });
});

app.post('/api/admin/bulk-delete', async (req, res) => {
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
    if (await db.deleteOpportunity(id, true)) {
      deletedCount++;
    }
  }

  res.json({ success: true, deletedCount, message: `Successfully removed ${deletedCount} opportunities` });
});

// --- BOOKMARKS ---
app.get('/api/bookmarks', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const saved = await db.getBookmarks(userId);
  res.json({ data: saved });
});

app.post('/api/bookmarks/toggle', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const { opportunityId } = req.body;
  if (!opportunityId) {
    return res.status(400).json({ error: 'opportunityId is required' });
  }
  const result = await db.toggleBookmark(userId, opportunityId);
  res.json(result);
});

// --- REMINDERS ---
app.get('/api/reminders', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const reminders = await db.getReminders(userId);
  res.json({ data: reminders });
});

app.post('/api/reminders', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const { opportunityId, deadline, daysBefore, frequency, preferredTime, timezone } = req.body;
  if (!opportunityId || !deadline) {
    return res.status(400).json({ error: 'opportunityId and deadline are required' });
  }

  const reminder = await db.createReminder({
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

app.delete('/api/reminders/:id', async (req, res) => {
  const success = await db.deleteReminder(req.params.id);
  res.json({ success });
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const notifs = await db.getNotifications(userId);
  const unreadCount = notifs.filter((n) => !n.read).length;
  res.json({ data: notifs, unreadCount });
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  const success = await db.markNotificationRead(req.params.id);
  res.json({ success });
});

app.post('/api/notifications/mark-all-read', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  await db.markAllNotificationsRead(userId);
  res.json({ success: true });
});

app.delete('/api/notifications/:id', async (req, res) => {
  const success = await db.dismissNotification(req.params.id);
  res.json({ success });
});

// --- ADMIN STATS & REVIEW QUEUE ---
app.get('/api/admin/stats', async (req, res) => {
  const allOps = await db.getOpportunities({ includePending: true });
  const activeOps = allOps.filter((o) => o.status === 'open' || o.status === 'closing_soon');
  const expiredOps = allOps.filter((o) => o.status === 'closed');
  const reviewQueue = await db.getReviewQueue();
  const admins = await db.getAdmins();

  res.json({
    total: allOps.length,
    hackathons: allOps.filter((o) => o.category === 'hackathon' && o.verificationStatus === 'verified').length,
    internships: allOps.filter((o) => o.category === 'internship' && o.verificationStatus === 'verified').length,
    research: allOps.filter((o) => o.category === 'research' && o.verificationStatus === 'verified').length,
    opensource: allOps.filter((o) => o.category === 'opensource' && o.verificationStatus === 'verified').length,
    active: activeOps.length,
    expired: expiredOps.length,
    pendingReview: reviewQueue.length,
    aiDiscovered: allOps.filter((o) => o.source.includes('AI') || o.source.includes('Gemini')).length,
    allowlistedEmails: admins.map((a) => a.email),
    adminsCount: admins.length,
    pendingRequestsCount: (await db.getAdminAccessRequests()).filter((r) => r.status === 'pending').length,
  });
});

// --- ADMIN AUTH & APPROVAL WORKFLOW ---
app.post('/api/admin/auth/verify-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const adminRecord = await db.getAdminByEmail(normalizedEmail);

  if (adminRecord) {
    return res.json({ exists: true, message: 'Email registered in admin directory.' });
  } else {
    return res.json({ exists: false, message: 'Access Denied' });
  }
});

app.post('/api/admin/auth/login', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const adminRecord = await db.getAdminByEmail(normalizedEmail);

  if (!adminRecord) {
    return res.status(403).json({
      success: false,
      exists: false,
      error: 'Access Denied: Your email is not registered as an administrator.',
    });
  }

  if (!password) {
    return res.status(400).json({
      error: 'Password is required to access admin mode.',
      requiresPassword: true,
    });
  }

  if (adminRecord.password !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
  }

  let user = await db.getUserByEmail(normalizedEmail);
  if (!user) {
    const created = await db.createUser({
      name: adminRecord.name || name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      requestedRole: 'admin',
    });
    user = created.user;
  } else if (user.role !== 'admin') {
    user = (await db.updateUser(user.id, { role: 'admin' })) || user;
  }

  return res.json({
    success: true,
    user,
    isPrimary: adminRecord.isPrimary,
    message: 'Admin access verified',
  });
});

app.post('/api/admin/auth/request-access', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const accessReq = await db.createAdminAccessRequest(normalizedEmail, name);
  res.json({
    success: true,
    requestId: accessReq.id,
    expiresAt: accessReq.expiresAt,
    message: 'Access request sent to administrator. Awaiting authorization.',
  });
});

app.get('/api/admin/auth/status', async (req, res) => {
  const { id, email } = req.query;
  await db.cleanExpiredRequests();

  let reqItem = null;
  if (id) {
    reqItem = await db.getAdminAccessRequestById(id as string);
  } else if (email) {
    reqItem = await db.getAdminAccessRequestByEmail(email as string);
  }

  if (!reqItem) {
    return res.json({ status: 'not_found' });
  }

  if (reqItem.status === 'accepted') {
    let user = await db.getUserByEmail(reqItem.email);
    if (!user) {
      const created = await db.createUser({
        name: reqItem.name || reqItem.email.split('@')[0],
        email: reqItem.email,
        requestedRole: 'admin',
      });
      user = created.user;
    } else if (user.role !== 'admin') {
      user = (await db.updateUser(user.id, { role: 'admin' })) || user;
    }

    return res.json({
      status: 'accepted',
      user,
      message: 'Admin permission accepted! You now have admin access.',
    });
  }

  if (reqItem.status === 'rejected') {
    return res.json({ status: 'rejected', message: 'u cant acess it' });
  }

  if (reqItem.status === 'expired') {
    return res.json({ status: 'expired', message: 'henceforth not a authorised admin pls contact PRATIK' });
  }

  const remainingSeconds = Math.max(0, Math.round((new Date(reqItem.expiresAt).getTime() - Date.now()) / 1000));

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

app.post('/api/admin/auth/cancel-request', async (req, res) => {
  const { id } = req.body;
  if (id) {
    const r = await db.getAdminAccessRequestById(id);
    if (r && r.status === 'pending') {
      await db.rejectAdminAccessRequest(id, 'system-cancel');
    }
  }
  res.json({ success: true });
});

// --- ADMIN MANAGEMENT ENDPOINTS ---
app.get('/api/admin/manage/list', async (req, res) => {
  await db.cleanExpiredRequests();
  const admins = await db.getAdmins();
  const requests = await db.getAdminAccessRequests();
  res.json({
    admins,
    requests,
    primaryEmails: ['pratikpanda2006@gmail.com', 'freeuser13012026@gmail.com'],
  });
});

app.post('/api/admin/manage/add', async (req, res) => {
  const { email, password, name, addedBy } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const result = await db.addAdmin({
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

app.post('/api/admin/manage/change-password', async (req, res) => {
  const { email, newPassword, callerEmail } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  const normalizedCaller = (callerEmail || '').toLowerCase().trim();
  const normalizedTarget = email.toLowerCase().trim();

  if (normalizedCaller && normalizedCaller !== normalizedTarget) {
    if (!(await db.isPrimaryAdmin(normalizedCaller))) {
      return res.status(403).json({
        error: 'Only primary administrators can change other admins\u2019 passwords.',
      });
    }
  }

  const result = await db.updateAdminPassword(normalizedTarget, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: `Password updated successfully for ${normalizedTarget}.` });
});

app.post('/api/admin/manage/remove', async (req, res) => {
  const { email, callerEmail } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedCaller = (callerEmail || '').toLowerCase().trim();
  if (normalizedCaller && !(await db.isPrimaryAdmin(normalizedCaller))) {
    return res.status(403).json({ error: 'Only primary administrators can remove other administrators.' });
  }

  const result = await db.removeAdmin(email);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, message: `Admin ${email} removed successfully.` });
});

app.post('/api/admin/manage/requests/:id/accept', async (req, res) => {
  const { reviewedBy } = req.body;
  const result = await db.acceptAdminAccessRequest(req.params.id, reviewedBy || 'freeuser13012026@gmail.com');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({
    success: true,
    admin: result.admin,
    message: 'Access request accepted. User added to admins list with default password admin@2026.',
  });
});

app.post('/api/admin/manage/requests/:id/reject', async (req, res) => {
  const { reviewedBy } = req.body;
  const result = await db.rejectAdminAccessRequest(req.params.id, reviewedBy || 'freeuser13012026@gmail.com');
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, message: 'Access request rejected. User will receive denial notification.' });
});

app.get('/api/admin/review', async (req, res) => {
  const queue = await db.getReviewQueue();
  res.json({ data: queue });
});

app.post('/api/admin/review/:id/approve', async (req, res) => {
  const updated = await db.approveOpportunity(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ data: updated, message: 'Opportunity approved and published!' });
});

app.post('/api/admin/review/:id/reject', async (req, res) => {
  const updated = await db.rejectOpportunity(req.params.id);
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
app.get('/api/admin/config/gemini-key', async (req, res) => {
  const currentKey = await db.getGeminiApiKey();
  const maskedKey = currentKey
    ? (currentKey.length > 8 ? `${currentKey.slice(0, 4)}...${currentKey.slice(-4)}` : '****')
    : null;
  res.json({ configured: !!currentKey, maskedKey });
});

app.post('/api/admin/config/gemini-key', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }
  await db.setGeminiApiKey(apiKey.trim());
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
      pdfBase64, text, urls, apiKey, category, useFallbackSample,
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
app.post('/api/cron/process-reminders', async (req, res) => {
  const result = await db.processReminders();
  res.json({ success: true, ...result });
});

app.post('/api/cron/check-expiry', async (req, res) => {
  const result = await db.checkExpiry();
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
app.patch('/api/user/profile', async (req, res) => {
  const userId = req.user?.id || 'user-demo-1';
  const updated = await db.updateUser(userId, req.body);
  res.json({ data: updated });
});

// --- FEEDBACK & BUG REPORT ROUTES ---
app.get('/api/feedback', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const all = await db.getFeedbacks();
    const filtered = status && status !== 'all' ? all.filter((f) => f.status === status) : all;
    const pendingCount = all.filter((f) => f.status === 'pending').length;
    const resolvedCount = all.filter((f) => f.status === 'resolved').length;
    const bugsCount = all.filter((f) => f.type === 'bug' && f.status === 'pending').length;
    res.json({
      feedbacks: filtered,
      stats: {
        total: all.length,
        pending: pendingCount,
        resolved: resolvedCount,
        bugs: bugsCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch feedback' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { userId, userName, userEmail, type, title, description, severity } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const feedback = await db.createFeedback({
      userId: userId || req.user?.id,
      userName: userName || req.user?.name,
      userEmail: userEmail || req.user?.email,
      type: type || 'feedback',
      title,
      description,
      severity,
    });

    // Notify primary admins
    try {
      const users = await db.getUsers();
      const admins = users.filter((u) => u.role === 'admin');
      for (const a of admins) {
        await db.createNotification({
          userId: a.id,
          title: type === 'bug' ? '🚨 New Bug Report Submitted' : '💬 New User Feedback Received',
          message: `"${title}" submitted by ${userName || userEmail || 'a student user'}.`,
          type: 'system',
          read: false,
        } as any).catch(() => {});
      }
    } catch {
      // Ignore notification failures
    }

    res.json({
      success: true,
      feedback,
      message: 'Thank you for your feedback! The team has received your report.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit feedback' });
  }
});

app.patch('/api/feedback/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const resolvedBy = req.body.resolvedBy || req.user?.email || 'Admin';
    const updated = await db.toggleResolveFeedback(id, resolvedBy);
    if (!updated) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }
    res.json({ success: true, feedback: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update feedback status' });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await db.deleteFeedback(id);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete feedback' });
  }
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