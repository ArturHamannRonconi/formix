import { useEffect, useRef } from 'react';
import styles from './RemoveMemberModal.module.css';

interface RemoveMemberModalProps {
  memberName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveMemberModal({ memberName, loading, onConfirm, onCancel }: RemoveMemberModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="remove-modal-title"
    >
      <div className={styles.dialog}>
        <h2 id="remove-modal-title" className={styles.title}>Remover membro</h2>
        <p className={styles.description}>
          Tem certeza que deseja remover{' '}
          <span className={styles.memberName}>{memberName}</span> da organização?
          Esta ação não pode ser desfeita.
        </p>
        <div className={styles.actions}>
          <button
            ref={cancelBtnRef}
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={styles.removeBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  );
}
