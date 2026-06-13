/**
 * FieldCanvas — visual drag-and-drop field placement for signing requests.
 * Renders a document preview (or a blank A4 canvas if no doc uploaded) and
 * lets the user click to place fields, then drag/resize/delete them.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Move } from 'lucide-react';
import type { FieldType } from '@/lib/signing-types';
import { FIELD_TYPE_LABELS } from '@/lib/signing-types';
import { cn } from '@/lib/utils';

interface SignerDraft {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
}

interface FieldDraft {
  id: string;
  signerId: string;
  fieldType: FieldType;
  page: number;
  x: number;   // percentage 0-100
  y: number;   // percentage 0-100
  width: number;  // percentage 0-100
  height: number; // percentage 0-100
  required: boolean;
  label: string;
}

interface Props {
  signers: SignerDraft[];
  fields: FieldDraft[];
  setFields: React.Dispatch<React.SetStateAction<FieldDraft[]>>;
  docFile: File | null;
}

const FIELD_TYPES: FieldType[] = [
  'signature', 'initials', 'name', 'date', 'checkbox', 'text',
  'company_name', 'job_title', 'email_address', 'custom',
];

// Default sizes as % of canvas
const FIELD_DEFAULTS: Record<FieldType, { w: number; h: number }> = {
  signature:     { w: 22, h: 7 },
  initials:      { w: 10, h: 7 },
  name:          { w: 22, h: 5 },
  date:          { w: 14, h: 5 },
  checkbox:      { w: 4,  h: 4 },
  text:          { w: 22, h: 5 },
  company_name:  { w: 22, h: 5 },
  job_title:     { w: 22, h: 5 },
  email_address: { w: 22, h: 5 },
  custom:        { w: 22, h: 5 },
};

const SIGNER_COLORS = [
  'bg-blue-100 border-blue-400 text-blue-800',
  'bg-green-100 border-green-400 text-green-800',
  'bg-purple-100 border-purple-400 text-purple-800',
  'bg-orange-100 border-orange-400 text-orange-800',
  'bg-pink-100 border-pink-400 text-pink-800',
];

export default function FieldCanvas({ signers, fields, setFields, docFile }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeSigner, setActiveSigner] = useState(signers[0]?.id ?? '');
  const [activeFieldType, setActiveFieldType] = useState<FieldType>('signature');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const dragging = useRef<{ fieldId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Generate preview URL for uploaded doc
  useEffect(() => {
    if (!docFile) { setDocUrl(null); return; }
    const url = URL.createObjectURL(docFile);
    setDocUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [docFile]);

  const getCanvasRect = useCallback(() => canvasRef.current?.getBoundingClientRect() ?? null, []);

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    // Don't place if clicking on an existing field
    if ((e.target as HTMLElement).closest('[data-field]')) return;
    if (!activeSigner) return;

    const rect = getCanvasRect();
    if (!rect) return;

    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const { w, h } = FIELD_DEFAULTS[activeFieldType];

    // Centre field on click point, clamped to canvas
    const x = Math.max(0, Math.min(100 - w, xPct - w / 2));
    const y = Math.max(0, Math.min(100 - h, yPct - h / 2));

    const newField: FieldDraft = {
      id: crypto.randomUUID(),
      signerId: activeSigner,
      fieldType: activeFieldType,
      page: 1,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: w,
      height: h,
      required: true,
      label: '',
    };
    setFields(prev => [...prev, newField]);
    setSelectedField(newField.id);
  }

  function handleFieldMouseDown(e: React.MouseEvent, fieldId: string) {
    e.stopPropagation();
    setSelectedField(fieldId);
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    dragging.current = { fieldId, startX: e.clientX, startY: e.clientY, origX: field.x, origY: field.y };

    function onMouseMove(ev: MouseEvent) {
      if (!dragging.current) return;
      const rect = getCanvasRect();
      if (!rect) return;
      const dx = ((ev.clientX - dragging.current.startX) / rect.width) * 100;
      const dy = ((ev.clientY - dragging.current.startY) / rect.height) * 100;
      setFields(prev => prev.map(f => {
        if (f.id !== dragging.current!.fieldId) return f;
        const newX = Math.max(0, Math.min(100 - f.width, dragging.current!.origX + dx));
        const newY = Math.max(0, Math.min(100 - f.height, dragging.current!.origY + dy));
        return { ...f, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 };
      }));
    }

    function onMouseUp() {
      dragging.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function deleteField(fieldId: string) {
    setFields(prev => prev.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) setSelectedField(null);
  }

  function updateField(fieldId: string, updates: Partial<FieldDraft>) {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  }

  const selectedFieldData = fields.find(f => f.id === selectedField);
  const signerColorMap = Object.fromEntries(signers.map((s, i) => [s.id, SIGNER_COLORS[i % SIGNER_COLORS.length]]));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap p-3 bg-muted/30 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Signer:</span>
          <Select value={activeSigner} onValueChange={setActiveSigner}>
            <SelectTrigger className="h-8 text-xs w-40">
              <SelectValue placeholder="Select signer" />
            </SelectTrigger>
            <SelectContent>
              {signers.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Field:</span>
          <Select value={activeFieldType} onValueChange={v => setActiveFieldType(v as FieldType)}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map(ft => (
                <SelectItem key={ft} value={ft} className="text-xs">{FIELD_TYPE_LABELS[ft]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground ml-auto">Click on the canvas to place a field · Drag to reposition</p>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative w-full cursor-crosshair rounded-lg border-2 border-dashed border-border overflow-hidden select-none"
            style={{ aspectRatio: '1 / 1.414' /* A4 ratio */ }}
          >
            {/* Document background */}
            {docUrl && docFile?.type === 'application/pdf' ? (
              <iframe src={docUrl} className="absolute inset-0 w-full h-full pointer-events-none" title="Document preview" />
            ) : docUrl ? (
              <img src={docUrl} alt="Document" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
            ) : (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2 opacity-20">📄</div>
                  <p className="text-xs">No document uploaded — click to place fields</p>
                </div>
              </div>
            )}

            {/* Placed fields */}
            {fields.map(field => {
              const colorClass = signerColorMap[field.signerId] ?? SIGNER_COLORS[0];
              const isSelected = selectedField === field.id;
              return (
                <div
                  key={field.id}
                  data-field="true"
                  onMouseDown={e => handleFieldMouseDown(e, field.id)}
                  onClick={e => { e.stopPropagation(); setSelectedField(field.id); }}
                  className={cn(
                    'absolute border-2 rounded cursor-move flex items-center justify-center text-[9px] font-semibold overflow-hidden',
                    colorClass,
                    isSelected && 'ring-2 ring-offset-1 ring-primary shadow-lg',
                  )}
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    width: `${field.width}%`,
                    height: `${field.height}%`,
                  }}
                >
                  <span className="truncate px-1 pointer-events-none">
                    {FIELD_TYPE_LABELS[field.fieldType]}
                    {field.label && ` · ${field.label}`}
                  </span>
                  {isSelected && (
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); deleteField(field.id); }}
                      className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-bl text-[8px] hover:bg-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Field properties panel */}
        <div className="w-full lg:w-64 shrink-0 space-y-3">
          {selectedFieldData ? (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{FIELD_TYPE_LABELS[selectedFieldData.fieldType]}</h3>
                <Button variant="ghost" size="sm" onClick={() => deleteField(selectedFieldData.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Signer</label>
                <Select value={selectedFieldData.signerId} onValueChange={v => updateField(selectedFieldData.id, { signerId: v })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {signers.map(s => <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Field Type</label>
                <Select value={selectedFieldData.fieldType} onValueChange={v => updateField(selectedFieldData.id, { fieldType: v as FieldType })}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(ft => <SelectItem key={ft} value={ft} className="text-xs">{FIELD_TYPE_LABELS[ft]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Label (optional)</label>
                <input
                  type="text"
                  value={selectedFieldData.label}
                  onChange={e => updateField(selectedFieldData.id, { label: e.target.value })}
                  placeholder="e.g. Signature"
                  className="mt-1 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['x', 'y', 'width', 'height'] as const).map(prop => (
                  <div key={prop}>
                    <label className="text-xs text-muted-foreground capitalize">{prop === 'x' ? 'Left %' : prop === 'y' ? 'Top %' : prop === 'width' ? 'Width %' : 'Height %'}</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={selectedFieldData[prop]}
                      onChange={e => updateField(selectedFieldData.id, { [prop]: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Required</label>
                <Switch
                  checked={selectedFieldData.required}
                  onCheckedChange={v => updateField(selectedFieldData.id, { required: v })}
                  className="scale-75"
                />
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border border-border rounded-xl p-4 text-center text-xs text-muted-foreground">
              <Move className="w-5 h-5 mx-auto mb-2 opacity-40" />
              Click a field on the canvas to edit its properties
            </div>
          )}

          {/* Field summary */}
          {fields.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground mb-2">{fields.length} field{fields.length !== 1 ? 's' : ''} placed</p>
              {signers.map(s => {
                const count = fields.filter(f => f.signerId === s.id).length;
                if (count === 0) return null;
                return (
                  <div key={s.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{s.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 ml-2">{count}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
