"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    } else {
      if (typeof dialog.close === "function") {
        dialog.close();
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto bg-crimson-950 border border-gold-dark/40 rounded-lg p-0 backdrop:bg-black/60 max-w-lg w-[calc(100%-2rem)] max-h-[80vh] overflow-hidden"
      onClose={onClose}
    >
      <div className="flex flex-col max-h-[80vh]">
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-2 sm:py-3 border-b border-gold-dark/20">
            <h2 className="font-heading text-lg text-gold-light tracking-wide">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-parchment-dark hover:text-parchment-light text-xl leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4 sm:p-5 text-parchment-dark">{children}</div>
      </div>
    </dialog>
  );
}
