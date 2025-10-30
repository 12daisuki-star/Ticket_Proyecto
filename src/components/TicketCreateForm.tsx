// src/components/TicketCreateForm.tsx
import { FormEvent, useMemo, useRef, useState } from 'react';
import type { Priority, ModuleCode } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createTicket } from '@/services/tickets';

const MODULES: { code: ModuleCode; label: string }[] = [
  { code: 'SCP', label: 'SCP' },
  { code: 'CENTURA', label: 'CENTURA' },
  { code: 'WEB', label: 'WEB' },
];

// Ajusta a tu política real:
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB por archivo
const ALLOWED_EXTS = ['.png', '.jpg', '.jpeg', '.pdf', '.xlsx', '.xls', '.docx', '.txt', '.zip', '.mp4'];

function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

export default function TicketCreateForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<Priority>('media');
  const [modulo, setModulo] = useState<ModuleCode>('SCP');

  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);

  function validateAndAdd(selected: FileList | null) {
    if (!selected) return;
    const next: File[] = [];
    for (const f of Array.from(selected)) {
      const ext = getExt(f.name);
      if (MAX_FILE_SIZE_BYTES && f.size > MAX_FILE_SIZE_BYTES) {
        setMsg(`El archivo "${f.name}" supera el límite de ${(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB.`);
        continue;
      }
      if (ALLOWED_EXTS.length && !ALLOWED_EXTS.includes(ext)) {
        setMsg(`Extensión no permitida: ${ext} en "${f.name}".`);
        continue;
      }
      next.push(f);
    }
    if (next.length) {
      setFiles(prev => [...prev, ...next]);
      setMsg(null);
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeAt(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!asunto.trim()) return setMsg('El asunto es obligatorio.');
    if (!modulo) return setMsg('Debes seleccionar un módulo.');

    setLoading(true);
    setProgress(0);
    try {
      await createTicket(
        {
          asunto,
          descripcion,
          prioridad,
          moduleCode: modulo,
          creadorId: user?.id,
          files,
        },
        (p) => setProgress(p)
      );

      // Reset
      setAsunto('');
      setDescripcion('');
      setPrioridad('media');
      setModulo('SCP');
      setFiles([]);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';

      setMsg('Ticket creado correctamente');
      onCreated?.();
    } catch (err: any) {
      setMsg(err?.message || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h3 style={{ marginTop: 0 }}>Generar ticket</h3>
      <div className="grid" style={{ gap: '.5rem' }}>
        <input
          placeholder="Asunto"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          required
        />

        <select value={modulo} onChange={(e) => setModulo(e.target.value as ModuleCode)}>
          {MODULES.map(m => <option key={m.code} value={m.code}>{m.label}</option>)}
        </select>

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={5}
        />

        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as Priority)}>
          {(['baja', 'media', 'alta', 'critica'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Adjuntos */}
        <div className="file-uploader">
          <label className="muted" htmlFor="file-input">
            Adjuntar archivos (permitidos: {ALLOWED_EXTS.join(', ')})
          </label>
          <input
            id="file-input"
            ref={inputRef}
            type="file"
            multiple
            onChange={(e) => validateAndAdd(e.target.files)}
            accept={ALLOWED_EXTS.join(',')}
          />

          {files.length > 0 && (
            <div className="attachments">
              <ul className="muted" style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {files.map((f, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span>{f.name} — {(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => removeAt(idx)}
                      aria-label={`Quitar ${f.name}`}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <div className="muted">Total: {(totalSize / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          )}
        </div>

        {/* Progreso */}
        {loading && (
          <div aria-live="polite">
            <div className="muted" style={{ marginBottom: '.25rem' }}>Subiendo… {progress}%</div>
            <div style={{ background: '#eee', height: 6, borderRadius: 4 }}>
              <div style={{
                width: `${progress}%`,
                height: 6,
                borderRadius: 4
              }} className="bg-primary" />
            </div>
          </div>
        )}

        <button className="btn primary" disabled={loading}>
          {loading ? 'Creando...' : 'Crear ticket'}
        </button>

        {msg && <div className="muted" role="status">{msg}</div>}
      </div>
    </form>
  );
}
