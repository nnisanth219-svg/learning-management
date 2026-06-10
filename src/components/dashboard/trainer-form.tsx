'use client';

import { Button, ButtonSpinner } from '@/components/ui';
import type { Trainer } from '@/data/types';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export type TrainerFormValues = {
  name: string;
  title: string;
  bio: string;
  experience: string;
  availability: Trainer['availability'];
  skills: string;
};

type Props = {
  saving?: boolean;
  formKey?: number;
  onSave: (values: TrainerFormValues, photoFile: File | null) => Promise<void>;
  onCancel: () => void;
};

const INITIAL: TrainerFormValues = {
  name: '',
  title: '',
  bio: '',
  experience: '',
  availability: 'available',
  skills: '',
};

export function TrainerForm({ saving, formKey = 0, onSave, onCancel }: Props) {
  const [values, setValues] = useState<TrainerFormValues>(INITIAL);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(INITIAL);
    setPhotoFile(null);
    setPreviewUrl(null);
    setError('');
  }, [formKey]);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function update<K extends keyof TrainerFormValues>(key: K, value: TrainerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!photoFile) {
      setError('Please upload a trainer photo.');
      return;
    }
    try {
      await onSave(values, photoFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trainer.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Full Name *</label>
          <input
            required
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            className="enterprise-input mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input
            required
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="Senior Web Development Instructor"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Bio *</label>
          <textarea
            required
            rows={3}
            value={values.bio}
            onChange={(e) => update('bio', e.target.value)}
            className="enterprise-input mt-1.5 !h-auto resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Experience *</label>
          <input
            required
            value={values.experience}
            onChange={(e) => update('experience', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="10+ years"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Availability *</label>
          <select
            value={values.availability}
            onChange={(e) => update('availability', e.target.value as Trainer['availability'])}
            className="enterprise-input mt-1.5"
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Skills</label>
          <input
            value={values.skills}
            onChange={(e) => update('skills', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="React, Node.js, TypeScript (comma-separated)"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Upload Photo *</label>
          <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/80 bg-subtle/50 px-4 py-3 text-sm text-muted hover:border-primary/40">
            <Upload className="h-4 w-4 shrink-0" />
            {photoFile ? photoFile.name : 'Choose image file (required)'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-1.5 text-xs text-muted">Stored in Firebase Storage.</p>
        </div>
      </div>

      {previewUrl ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-subtle">
          <Image src={previewUrl} alt="Trainer preview" fill className="object-cover" sizes="128px" />
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
          {saving ? <ButtonSpinner /> : null}
          Save Trainer
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}
