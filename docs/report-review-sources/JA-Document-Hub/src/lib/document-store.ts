import type { SavedDocument, DocumentFolder } from './document-types';
import { generateDocRef } from './doc-ref';

// ── Auth ──────────────────────────────────────────────────────────────────────
// All auth state is stored server-side (MySQL + httpOnly session cookie).
// No personal data is written to localStorage.

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  plan: 'free' | 'personal' | 'standard' | 'professional' | 'org_starter' | 'org_growth' | 'org_professional';
  usageType?: 'personal' | 'business' | 'both';
  planIsLifetime?: boolean;
  planExpiresAt?: string | null;
  orgId?: number | null;
  createdAt: string;
}

/** Register via server API */
export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  company?: string,
  usageType?: string,
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName, company, usageType }),
      credentials: 'include',
    });
    return await res.json() as { success: boolean; error?: string; user?: AuthUser };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/** Login via server API */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    return await res.json() as { success: boolean; error?: string; user?: AuthUser };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

/** Logout via server API — clears httpOnly session cookie server-side */
export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch { /* ignore */ }
}

/** No-op kept for API compatibility — user data is never cached locally */
export function getCurrentUser(): AuthUser | null {
  return null;
}

/** Fetch current user from server (source of truth) */
export async function refreshCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json() as { success: boolean; user?: AuthUser };
    return data.success && data.user ? data.user : null;
  } catch {
    return null;
  }
}

export async function updateUserProfile(updates: Partial<AuthUser>): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

// ── Documents — server API ────────────────────────────────────────────────────

export async function getDocuments(): Promise<SavedDocument[]> {
  try {
    const res = await fetch('/api/documents', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json() as { success: boolean; documents?: SavedDocument[] };
    return data.documents ?? [];
  } catch {
    return [];
  }
}

export async function saveDocument(
  doc: Omit<SavedDocument, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'docRef'>
): Promise<SavedDocument | null> {
  try {
    const docRef = generateDocRef(doc.category);
    // Support legacy wizard shape (formData/generatedContent) and new shape (fields/content)
    const fields = doc.fields ?? (doc.formData ? { ...doc.formData, _templateName: doc.templateName } : {});
    const content = doc.content ?? doc.generatedContent ?? '';
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: doc.templateId,
        title: doc.title,
        category: doc.category,
        status: doc.status,
        docRef,
        fields,
        content,
        folderId: doc.folderId,
      }),
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean; document?: SavedDocument };
    return data.document ?? null;
  } catch {
    return null;
  }
}

export async function updateDocument(id: string, updates: Partial<SavedDocument>): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function duplicateDocument(id: string): Promise<SavedDocument | null> {
  try {
    // Fetch the original
    const res = await fetch(`/api/documents/${id}`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json() as { success: boolean; document?: SavedDocument };
    const original = data.document;
    if (!original) return null;

    // Create a copy
    return saveDocument({
      templateId: original.templateId,
      templateName: original.templateName,
      title: original.title + ' (Copy)',
      category: original.category,
      status: 'draft',
      fields: original.fields,
      content: original.content,
      folderId: original.folderId,
    });
  } catch {
    return null;
  }
}

// ── Folders — server API ──────────────────────────────────────────────────────

export async function getFolders(): Promise<DocumentFolder[]> {
  try {
    const res = await fetch('/api/folders', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json() as { success: boolean; folders?: DocumentFolder[] };
    return data.folders ?? [];
  } catch {
    return [];
  }
}

export async function createFolder(name: string, color: string): Promise<DocumentFolder | null> {
  try {
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean; folder?: DocumentFolder };
    return data.folder ?? null;
  } catch {
    return null;
  }
}

export async function deleteFolder(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/folders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

