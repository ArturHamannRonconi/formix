'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormSettings as FormSettingsType } from '@/services/forms/forms.types';

interface FormSettingsProps {
  settings: FormSettingsType;
  onChange: (settings: Partial<FormSettingsType>) => void;
}

export function FormSettings({ settings, onChange }: FormSettingsProps) {
  const [domainInput, setDomainInput] = useState('');

  function handleAddDomain(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const domain = domainInput.trim().replace(/^,/, '').trim();
      if (domain && !settings.allowedEmailDomains.includes(domain)) {
        onChange({ allowedEmailDomains: [...settings.allowedEmailDomains, domain] });
      }
      setDomainInput('');
    }
  }

  function handleRemoveDomain(domain: string) {
    onChange({
      allowedEmailDomains: settings.allowedEmailDomains.filter((d) => d !== domain),
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">Expiração (opcional)</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={settings.expiresAt ?? ''}
          onChange={(e) => onChange({ expiresAt: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxResponses">Máximo de respostas (opcional)</Label>
        <Input
          id="maxResponses"
          type="number"
          min={1}
          value={settings.maxResponses ?? ''}
          onChange={(e) =>
            onChange({ maxResponses: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="Sem limite"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          id="allowMultipleResponses"
          type="checkbox"
          checked={settings.allowMultipleResponses}
          onChange={(e) => onChange({ allowMultipleResponses: e.target.checked })}
          className="rounded border-slate-300 accent-violet-600 size-4"
        />
        <Label htmlFor="allowMultipleResponses" className="cursor-pointer">
          Permitir múltiplas respostas
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="allowedEmailDomains">Domínios de email permitidos</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {settings.allowedEmailDomains.map((domain) => (
            <span
              key={domain}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"
            >
              {domain}
              <button
                type="button"
                onClick={() => handleRemoveDomain(domain)}
                className="text-violet-400 hover:text-violet-700"
                aria-label={`Remover ${domain}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <Input
          id="allowedEmailDomains"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          onKeyDown={handleAddDomain}
          placeholder="ex: empresa.com (Enter para adicionar)"
        />
        <p className="text-xs text-muted-foreground">
          Pressione Enter ou vírgula para adicionar um domínio.
        </p>
      </div>
    </div>
  );
}
