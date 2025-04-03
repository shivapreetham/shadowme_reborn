"use client";

import React from "react";
import clsx from "clsx";

export interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  handleClick: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonClassName?: string;
  className?: string;
  icon?: React.ReactNode;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  handleClick,
  buttonText,
  buttonIcon,
  buttonClassName,
  className,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={clsx("rounded-xl p-6 shadow-lg bg-white", className)}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        {icon && <div className="mb-4">{icon}</div>}
        <div>{children}</div>
        <button
          onClick={handleClick}
          className={clsx("mt-4 w-full py-2 rounded", buttonClassName)}
        >
          {buttonIcon && <span className="mr-2 inline-block">{buttonIcon}</span>}
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default MeetingModal;
