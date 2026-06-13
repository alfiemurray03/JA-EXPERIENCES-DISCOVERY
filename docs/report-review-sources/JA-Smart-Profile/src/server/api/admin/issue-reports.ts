/**
 * Admin — Issue Reports API
 * GET  /api/admin/issue-reports        — list all
 * PATCH /api/admin/issue-reports/:id   — update status / notes
 */
import { type Request, type Response } from 'express';
import db from '../../db.js';

export function getIssueReports(_req: Request, res: Response) {
  const rows = db.prepare(`
    SELECT id, name, email, issue_type, subject, description, page_url,
           status, admin_notes, created_at, updated_at
    FROM issue_reports
    ORDER BY
      CASE status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
      created_at DESC
  `).all();
  return res.json({ success: true, data: rows });
}

export function updateIssueReport(req: Request, res: Response) {
  const { id } = req.params;
  const { status, admin_notes } = req.body as { status?: string; admin_notes?: string };

  const allowed = ['open', 'in_progress', 'resolved', 'closed'];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  db.prepare(`
    UPDATE issue_reports
    SET status = COALESCE(?, status),
        admin_notes = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status ?? null, admin_notes ?? null, id);

  return res.json({ success: true });
}
