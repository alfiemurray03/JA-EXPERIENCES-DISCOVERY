/**
 * LogoUploader
 * ─────────────
 * Lets users either:
 *  1. Paste a URL (http/https or relative path)
 *  2. Upload a PNG / SVG / JPEG / WebP file — converted to a data-URL so it
 *     works without a backend upload endpoint.
 *
 * Props:
 *  value    — current logo URL (data-URL or http URL or '')
 *  onChange — called with the new URL string
 */

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Link2, Image } from 'lucide-react';

interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const ACCEPTED = 'image/png,image/svg+xml,image/jpeg,image/webp';
const MAX_SIZE_MB = 2;

export default function LogoUploader({ value, onChange, disabled }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value?.startsWith('http') || value?.startsWith('/') ? value : '');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    setError('');
    if (!file.type.match(/^image\/(png|svg\+xml|jpeg|webp)$/)) {
      setError('Only PNG, SVG, JPEG, or WebP files are supported.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.[0]) handleFile(files[0]);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleUrlApply() {
    setError('');
    const url = urlInput.trim();
    if (!url) { onChange(''); return; }
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      setError('Enter a valid URL starting with http://, https://, or /');
      return;
    }
    onChange(url);
  }

  const hasLogo = !!value;
  const isDataUrl = value?.startsWith('data:');
  const previewSrc = hasLogo ? value : '';

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Logo</Label>

      {/* Preview */}
      {hasLogo && (
        <div className="flex items-center gap-3 p-2.5 bg-muted/40 border border-border rounded-lg">
          <img
            src={previewSrc}
            alt="Logo preview"
            className="h-10 w-auto max-w-[120px] object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground font-medium truncate">
              {isDataUrl ? 'Uploaded file' : value}
            </p>
            <p className="text-[10px] text-muted-foreground">Logo applied</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { onChange(''); setUrlInput(''); }}
            disabled={disabled}
            className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-0.5 bg-muted rounded-md">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded transition-colors ${
            tab === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          disabled={disabled}
        >
          <Upload className="w-3 h-3" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded transition-colors ${
            tab === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          disabled={disabled}
        >
          <Link2 className="w-3 h-3" /> Paste URL
        </button>
      </div>

      {tab === 'upload' ? (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 cursor-pointer transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Image className="w-6 h-6 text-muted-foreground" />
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">Drop your logo here</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">PNG, SVG, JPEG, WebP — max {MAX_SIZE_MB} MB</p>
          </div>
          <Button type="button" variant="outline" size="sm" className="text-xs h-7 gap-1.5" disabled={disabled}>
            <Upload className="w-3 h-3" /> Browse Files
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleInputChange}
            className="sr-only"
            disabled={disabled}
          />
        </div>
      ) : (
        /* URL input */
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
            placeholder="https://example.com/logo.png"
            className="h-8 text-xs flex-1"
            disabled={disabled}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleUrlApply}
            className="h-8 text-xs shrink-0"
            disabled={disabled}
          >
            Apply
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
