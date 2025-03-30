'use client'

import React, { useState, useRef } from 'react';
import useConversation from '@/app/hooks/useConversation';
import axios from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HiPhoto, HiPaperAirplane } from 'react-icons/hi2';
import MessageInput from './MessageInput';
import { createClient } from '@supabase/supabase-js';
import { messageSchema } from '@/schemas/messageSchema';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB



const Form = () => {
  const { conversationId } = useConversation();
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isSubmitting = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset
  } = useForm<FieldValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  const message = watch('message');

  const processAICommand = async (prompt: string) => {
    setIsProcessingAI(true);
    try {
      const response = await axios.post('/api/chat/ai-autofill', {
        topic: prompt.substring(1)
      });
      setValue('message', response.data.message);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      console.error('Invalid file type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large');
      return;
    }

    setIsUploadingFile(true);
    try {
      const fileName = `${conversationId}-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      // Automatically submit the message with image
      await onSubmit({ message: message || '', imageUrl: publicUrl });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageUrl(null);

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // Prevent multiple submissions
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsSendingMessage(true);

    try {
      if (data.message.startsWith('@')) {
        await processAICommand(data.message);
        return;
      }

      await axios.post('/api/chat/messages', {
        message: data.message,
        image: data.imageUrl || imageUrl,
        conversationId
      });

      reset();
      setImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="theme-transition relative">
      <div className="py-4 px-4 bg-card dark:bg-card/95 backdrop-blur-sm border-t border-border dark:border-border/50 flex items-center gap-2 lg:gap-4 w-full shadow-card">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            id="file-upload"
            disabled={isUploadingFile || isSendingMessage}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer p-2 rounded-full hover:bg-muted transition-colors duration-200 block ${
              (isUploadingFile || isSendingMessage) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploadingFile ? (
              <div className="w-[30px] h-[30px] rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <HiPhoto 
                size={30} 
                className="text-primary hover:text-primary/80 transition-colors" 
              />
            )}
          </label>
        </div>
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            id="message"
            register={register}
            errors={errors}
            required
            placeholder={message?.startsWith('@') ? "Enter AI prompt (max 20 words)" : "Type a message..."}
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
          />
          
          <button
            type="submit"
            disabled={isProcessingAI || isUploadingFile || isSendingMessage}
            className="rounded-full p-3 bg-primary hover:bg-primary/90 transition-colors duration-200 shadow-card hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingMessage ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            ) : (
              <HiPaperAirplane 
                size={20} 
                className="text-primary-foreground" 
              />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Form;