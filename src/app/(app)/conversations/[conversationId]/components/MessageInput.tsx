'use client';

import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
interface MessageInputProps {
  id: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  id,
  placeholder,
  type = 'text',
  required,
  register,
  errors,
  disabled
}) => {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        autoComplete={id}
        disabled={disabled}
        {...register(id, { required })}
        placeholder={placeholder}
        className={`
          w-full py-2.5 px-4 rounded-full
          bg-secondary/50 backdrop-blur-sm
          text-foreground placeholder:text-muted-foreground
          font-light text-base
          border border-border
          shadow-card
          theme-transition
          focus:shadow-card-hover
          focus:border-primary/20
          focus:outline-none
          focus:ring-2
          focus:ring-primary/10
          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
      />
      {errors[id] && (
        <span className="text-destructive text-sm ml-4 mt-1 absolute -bottom-6 left-0">
          {errors[id]?.message?.toString() || 'This field is required'}
        </span>
      )}
    </div>
  );
};

export default MessageInput;