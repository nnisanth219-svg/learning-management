'use client';

import { Button, ButtonSpinner } from '@/components/ui';
import type { StudentStatus } from '@/data/types';
import { useEffect, useState } from 'react';

export type StudentFormValues = {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  status: StudentStatus;
};

type Props = {
  saving?: boolean;
  formKey?: number;
  onSave: (values: StudentFormValues) => Promise<void>;
  onCancel: () => void;
};

const INITIAL: StudentFormValues = {
  name: '',
  email: '',
  phone: '',
  qualification: '',
  status: 'active',
};

export function StudentForm({ saving, formKey = 0, onSave, onCancel }: Props) {
  const [values, setValues] = useState<StudentFormValues>(INITIAL);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(INITIAL);
    setError('');
  }, [formKey]);

  function update<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student.');
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
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email *</label>
          <input
            required
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="+1 555 0100"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Qualification</label>
          <input
            value={values.qualification}
            onChange={(e) => update('qualification', e.target.value)}
            className="enterprise-input mt-1.5"
            placeholder="Bachelor's in Computer Science"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status *</label>
          <select
            value={values.status}
            onChange={(e) => update('status', e.target.value as StudentStatus)}
            className="enterprise-input mt-1.5"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
          {saving ? <ButtonSpinner /> : null}
          Save Student
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </form>
  );
}
