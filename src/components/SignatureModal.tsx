'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Upload, PenLine } from 'lucide-react';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '~/app/api/uploadthing/core';

export type SignatureMethod = 'draw' | 'upload';

export type SignatureData = {
  name: string;
  method: SignatureMethod;
  imageUrl?: string;      // for upload
  imageDataUrl?: string;  // for canvas draw
};

type SignatureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: SignatureData) => void;
};

export function SignatureModal({
  isOpen,
  onClose,
  onSave,
}: SignatureModalProps) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState<SignatureMethod>('draw');
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Reset on open & initialize canvas
  useEffect(() => {
    if (!isOpen) return;

    setName('');
    setMethod('draw');
    setUploadUrl(null);
    setError('');
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
  }, [isOpen]);

  if (!isOpen) return null;

  // Mouse handlers
  const startDrawing = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (method !== 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (method !== 'draw') return;
    const rect = e.currentTarget.getBoundingClientRect();
    draw(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseUp = () => {
    if (method !== 'draw') return;
    endDrawing();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (method !== 'draw') return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (method !== 'draw') return;
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (method !== 'draw') return;
    e.preventDefault();
    endDrawing();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (method === 'upload') {
      if (!uploadUrl) {
        setError('Please upload a signature image.');
        return;
      }
      onSave({
        name: name.trim(),
        method: 'upload',
        imageUrl: uploadUrl,
      });
      return;
    }

    if (method === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) {
        setError('Canvas not available.');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      // basic heuristic to avoid blank images
      if (!dataUrl || dataUrl.length < 5000) {
        setError('Please draw your signature before saving.');
        return;
      }

      onSave({
        name: name.trim(),
        method: 'draw',
        imageDataUrl: dataUrl,
      });
      return;
    }

    setError('Unknown signature method.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          Approve Snapshot with Signature
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Confirm this snapshot and attach your digital signature for audit and
          compliance.
        </p>

        {/* Name */}
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="e.g. Jane Doe"
        />

        {/* Mode switch */}
        <div className="flex gap-2 mb-3 text-xs">
          <button
            type="button"
            onClick={() => setMethod('draw')}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border ${
              method === 'draw'
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <PenLine className="w-3 h-3" />
            Draw
          </button>
          <button
            type="button"
            onClick={() => setMethod('upload')}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border ${
              method === 'upload'
                ? 'border-teal-500 bg-teal-50 text-teal-800'
                : 'border-gray-200 text-gray-600'
            }`}
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
        </div>

        {/* Draw mode */}
        {method === 'draw' && (
          <div className="mb-3">
            <div className="border rounded-lg bg-gray-50">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="bg-white rounded-lg cursor-crosshair w-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              <div className="flex justify-between items-center px-2 py-1">
                <span className="text-[10px] text-gray-500">
                  Sign inside the box with your mouse or finger.
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[10px] text-teal-600 hover:text-teal-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload mode */}
        {method === 'upload' && (
          <div className="mb-3">
            <p className="text-[10px] text-gray-500 mb-1">
              Upload a clear PNG/JPEG of your handwritten signature.
            </p>
            <UploadButton<OurFileRouter, 'signature'>
              endpoint="signature"
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.url;
                if (url) {
                  console.log('✅ Signature uploaded:', url);
                  setUploadUrl(url);
                  setError('');
                }
              }}
              onUploadError={(err) => {
                console.error(err);
                setError('Upload failed. Please try again.');
              }}
              appearance={{
                button:
                  'bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-teal-700',
                container: 'mt-1',
              }}
            />
            {uploadUrl && (
              <p className="text-[10px] text-emerald-700 mt-1">
                ✓ Signature uploaded
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[10px] text-red-600 mb-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Confirm &amp; Attach
          </button>
        </div>
      </div>
    </div>
  );
}
