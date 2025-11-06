'use client';

import { useRouter } from 'next/navigation';
import { useReportDraft } from '~/components/report-draft-provider';
import { useState } from 'react';

export default function SchedulePage() {
  const { draft, setDraft } = useReportDraft();
  const router = useRouter();

  const [newTask, setNewTask] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newCompletion, setNewCompletion] = useState(0);

  function addScheduleItem() {
    if (!newTask.trim()) return;
    const newItem = {
      task: newTask,
      startDate: newStart,
      endDate: newEnd,
      completionPercent: newCompletion,
      notes: '',
    };
    setDraft((d) => ({ ...d, scheduleScope: [...d.scheduleScope, newItem] }));
    setNewTask('');
    setNewStart('');
    setNewEnd('');
    setNewCompletion(0);
  }

  function updateSchedule(idx: number, field: string, value: any) {
    setDraft((d) => {
      const copy = [...d.scheduleScope];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...d, scheduleScope: copy };
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Schedule & Scope</h1>
      <p className="text-gray-600 mt-1">
        Add project milestones, completion progress, and schedule targets.
      </p>

      {/* Add new milestone */}
      <div className="mt-6 border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-medium mb-3">Add New Milestone</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Task name"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
          />
          <input
            type="number"
            min={0}
            max={100}
            className="border rounded-lg px-3 py-2"
            value={newCompletion}
            onChange={(e) => setNewCompletion(Number(e.target.value))}
            placeholder="% complete"
          />
        </div>

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
            <div
              key={idx}
              className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm"
            >
              <input
                className="border rounded-lg px-3 py-2"
                value={item.task ?? ''}
                onChange={(e) => updateSchedule(idx, 'task', e.target.value)}
                placeholder="Milestone name"
              />
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2"
                  value={item.startDate ?? ''}
                  onChange={(e) =>
                    updateSchedule(idx, 'startDate', e.target.value)
                  }
                />
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2"
                  value={item.endDate ?? ''}
                  onChange={(e) =>
                    updateSchedule(idx, 'endDate', e.target.value)
                  }
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="border rounded-lg px-3 py-2"
                  value={item.completionPercent ?? 0}
                  onChange={(e) =>
                    updateSchedule(idx, 'completionPercent', Number(e.target.value))
                  }
                  placeholder="% complete"
                />
              </div>
              <textarea
                rows={2}
                className="border rounded-lg px-3 py-2"
                value={item.notes ?? ''}
                onChange={(e) => updateSchedule(idx, 'notes', e.target.value)}
                placeholder="Notes"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => router.push('/form/general/issues')}
          className="px-4 py-2 rounded-lg border"
        >
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
