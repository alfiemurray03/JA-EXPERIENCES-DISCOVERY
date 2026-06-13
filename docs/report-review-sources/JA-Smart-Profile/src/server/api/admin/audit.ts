import { type Request, type Response } from 'express';
import { type AuthRequest } from '../../middleware/auth.js';
import db from '../../db.js';
import { writeAudit, writeAuditLog } from '../../lib/audit.js';

export { writeAuditLog };

// Ensure legal_policies table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS legal_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    effective_date TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    is_published INTEGER NOT NULL DEFAULT 1,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getAuditLog(req: Request, res: Response) {
  try {
    const { actor_type, resource_type, action, search, limit = '500', offset = '0' } = req.query as Record<string, string>;

    let query = `SELECT * FROM audit_log WHERE 1=1`;
    const params: (string | number)[] = [];

    if (actor_type) { query += ` AND actor_type = ?`; params.push(actor_type); }
    if (resource_type) { query += ` AND resource_type = ?`; params.push(resource_type); }
    if (action) { query += ` AND action LIKE ?`; params.push(`%${action}%`); }
    if (search) {
      query += ` AND (actor_name LIKE ? OR actor_email LIKE ? OR action LIKE ? OR resource_label LIKE ? OR details LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit) || 500, parseInt(offset) || 0);

    const entries = db.prepare(query).all(...params);
    const total = (db.prepare(`SELECT COUNT(*) as c FROM audit_log`).get() as { c: number }).c;

    res.json({ success: true, data: entries, total });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
  }
}

// Legal policies
export function getLegalPolicies(_req: Request, res: Response) {
  try {
    const rows = db.prepare('SELECT * FROM legal_policies').all() as {
      key: string; title: string; version: string; effective_date: string;
      content: string; is_published: number; last_updated: string;
    }[];
    const data: Record<string, object> = {};
    for (const row of rows) {
      data[row.key] = { ...row, is_published: row.is_published === 1 };
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch legal policies' });
  }
}

export function updateLegalPolicy(req: AuthRequest, res: Response) {
  try {
    const { key } = req.params;
    const { title, version, effective_date, content, is_published, last_updated } = req.body;
    const existing = db.prepare('SELECT id FROM legal_policies WHERE key = ?').get(key);
    if (existing) {
      db.prepare(`
        UPDATE legal_policies SET title=?, version=?, effective_date=?, content=?, is_published=?, last_updated=? WHERE key=?
      `).run(title, version, effective_date, content, is_published ? 1 : 0, last_updated || new Date().toISOString(), key);
    } else {
      db.prepare(`
        INSERT INTO legal_policies (key, title, version, effective_date, content, is_published, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(key, title, version, effective_date, content, is_published ? 1 : 0, last_updated || new Date().toISOString());
    }
    if (req.user) {
      writeAudit({
        actorId: req.user.id, actorName: req.user.name, actorEmail: req.user.email,
        actorType: 'admin', action: 'update', resourceType: 'legal_policy',
        resourceId: String(key), resourceLabel: title,
        details: `Updated ${title} to v${version}`,
        ipAddress: req.ip,
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update legal policy' });
  }
}

// Public endpoint — returns published policies
export function getPublicPolicy(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const policy = db.prepare('SELECT * FROM legal_policies WHERE key = ? AND is_published = 1').get(key) as {
      key: string; title: string; version: string; effective_date: string;
      content: string; is_published: number; last_updated: string;
    } | undefined;
    if (!policy) return res.status(404).json({ success: false, error: 'Policy not found' });
    res.json({ success: true, data: { ...policy, is_published: true } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch policy' });
  }
}
