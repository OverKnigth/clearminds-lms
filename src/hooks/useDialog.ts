import { useState, useCallback } from 'react';

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  type: 'confirm' | 'alert';
  onConfirm: () => void;
}

const DEFAULT: DialogState = {
  isOpen: false, title: '', message: '',
  confirmLabel: 'Aceptar', danger: false,
  type: 'alert', onConfirm: () => {},
};

export function useDialog() {
  const [dialog, setDialog] = useState<DialogState>(DEFAULT);

  const close = useCallback(() => setDialog(d => ({ ...d, isOpen: false })), []);

  const showAlert = useCallback((message: string, title = 'Aviso') => {
    setDialog({ isOpen: true, title, message, confirmLabel: 'Aceptar', danger: false, type: 'alert', onConfirm: () => setDialog(d => ({ ...d, isOpen: false })) });
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, options?: { title?: string; confirmLabel?: string; danger?: boolean }) => {
    setDialog({
      isOpen: true,
      title: options?.title || 'Confirmar',
      message,
      confirmLabel: options?.confirmLabel || 'Confirmar',
      danger: options?.danger ?? false,
      type: 'confirm',
      onConfirm: () => { setDialog(d => ({ ...d, isOpen: false })); onConfirm(); },
    });
  }, []);

  return { dialog, close, showAlert, showConfirm };
}
