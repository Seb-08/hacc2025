// src/app/form/general/schedule/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';
import { useState } from 'react';

export default function SchedulePage() {
  const { draft, setDraft, addDeletedScheduleId } = useReportDraft();
  const router = useRouter();

  const [newTask, setNewTask] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCompletion, setNewCompletion] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  function addScheduleItem() {
    setErrorMsg('');

    if (!newTask.trim()) {
      setErrorMsg('Please enter a task name.');
      return;
    }

    const completionValue = newCompletion === '' ? 0 : Number(newCompletion);
    if (completionValue > 100) {
      setErrorMsg('Completion percentage cannot exceed 100%.');
      return;
    }
    if (completionValue < 0) {
      setErrorMsg('Completion percentage cannot be negative.');
      return;
    }

    const newItem = {
      task: newTask,
      targetDate: newTarget,
      completionPercent: completionValue,
      notes: '',
    };

    setDraft((d) => ({ ...d, scheduleScope: [...d.scheduleScope, newItem] }));
    setNewTask('');
    setNewTarget('');
    setNewCompletion('');
  }

  function updateSchedule(idx: number, field: string, value: any) {
    setDraft((d) => {
      const copy = [...d.scheduleScope];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...d, scheduleScope: copy };
    });
  }

  function deleteScheduleItem(idx: number) {
    let removedId: number | null = null;

    setDraft((d) => {
      const copy = [...d.scheduleScope];
      const removed = copy.splice(idx, 1)[0];
      if (removed && typeof removed.id === 'number') {
        removedId = removed.id;
      }
      return { ...d, scheduleScope: copy };
    });

    if (removedId !== null) {
      addDeletedScheduleId(removedId);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Schedule & Scope</h1>
      <p className="text-gray-600 mt-1">
        Add project milestones, target dates, and progress updates.
      </p>

      {/* Add new milestone */}
      <div className="mt-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-medium mb-3">Add New Milestone</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Task</label>
            <input
              className="border rounded-lg px-3 py-2 w-full mt-1"
              placeholder="Task name"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Target Date</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full mt-1"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Completion (%)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="border rounded-lg px-3 py-2 w-full mt-1"
              value={newCompletion}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,3}$/.test(val)) setNewCompletion(val);
              }}
              placeholder="0–100"
            />
          </div>
        </div>

        {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}

        <button
          onClick={addScheduleItem}
          className="mt-4 px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          + Add Milestone
        </button>
      </div>

      {/* Current milestones list */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">Timeline Items</h2>
        {draft.scheduleScope.length === 0 && (
          <p className="text-gray-500 text-sm">No milestones yet — add one above.</p>
        )}
        <div className="space-y-4">
          {draft.scheduleScope.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <label className="text-sm font-medium">Task</label>
                  <input
                    className="border rounded-lg px-3 py-2 w-full mt-1"
                    value={item.task ?? ''}
                    onChange={(e) => updateSchedule(idx, 'task', e.target.value)}
                    placeholder="Milestone name"
                  />
                </div>
                <button
                  onClick={() => deleteScheduleItem(idx)}
                  className="ml-3 text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <input
                    type="date"
                    className="border rounded-lg px-3 py-2 w-full mt-1"
                    value={item.targetDate ?? ''}
                    onChange={(e) => updateSchedule(idx, 'targetDate', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Completion (%)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border rounded-lg px-3 py-2 w-full mt-1"
                    value={item.completionPercent?.toString() ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d{0,3}$/.test(val)) {
                        const num = val === '' ? 0 : Number(val);
                        if (num <= 100) updateSchedule(idx, 'completionPercent', num);
                      }
                    }}
                    placeholder="0–100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  rows={2}
                  className="border rounded-lg px-3 py-2 w-full mt-1"
                  value={item.notes ?? ''}
                  onChange={(e) => updateSchedule(idx, 'notes', e.target.value)}
                  placeholder="Notes"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button onClick={() => router.push('/form/general/issues')} className="px-4 py-2 rounded-lg border">
          Back to Issues
        </button>
        <button
          onClick={() => router.push('/form/general/financial')}
          className="px-4 py-2 rounded-lg text-white"
          style={{ background: 'linear-gradient(90deg, #00796B, #2FB8AC)' }}
        >
          Continue to Financials
        </button>
      </div>
    </div>
  );
}