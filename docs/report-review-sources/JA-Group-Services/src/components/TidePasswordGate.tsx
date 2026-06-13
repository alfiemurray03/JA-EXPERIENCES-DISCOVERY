import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIDE_PASSWORD = '432342';
const STORAGE_KEY = 'tide_page_auth';

interface Props {
  children: React.ReactNode;
}

export default function TidePasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === TIDE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF3FF] border border-[#C7D7F5] flex items-center justify-center">
            <Lock className="h-6 w-6 text-[#1A3FA8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0A1F44]">Protected Page</h1>
            <p className="text-gray-500 text-sm mt-1">Enter the password to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="Password"
              autoFocus
              className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm text-[#0A1F44] outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:ring-[#1A3FA8]/20 focus:border-[#1A3FA8]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">Incorrect password. Please try again.</p>}
          <Button
            type="submit"
            className="w-full bg-[#1A3FA8] hover:bg-[#153588] text-white font-bold py-5"
          >
            Unlock Page
          </Button>
        </form>
      </div>
    </div>
  );
}
