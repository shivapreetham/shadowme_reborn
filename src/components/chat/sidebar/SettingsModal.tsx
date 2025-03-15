'use client';

import { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/app/hooks/use-toast';
import Image from 'next/image';
import { X, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@supabase/supabase-js';

// Define types for programMap and branchMap
type ProgramMap = {
  cs: string;
  ec: string;
  ee: string;
  ce: string;
  me: string;
  mm: string;
  pi: string;
  csca: string;
  phd: string;
};

type BranchMap = {
  ug: string;
  pg: string;
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

interface SettingsModalProps {
  currentUser: User;
  isOpen?: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen = false,
  onClose,
}) => {
  // At the top of your file, add this

  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(currentUser?.image || '');

  // Move programMap and branchMap outside of useMemo for correct type inference
  const programMap: ProgramMap = {
    cs: 'Computer Science and Engineering',
    ec: 'Electronics and Communication Engineering',
    ee: 'Electrical Engineering',
    ce: 'Civil Engineering',
    me: 'Mechanical Engineering',
    mm: 'Metallurgical and Materials Engineering',
    pi: 'Production and Industrial Engineering',
    csca: 'Master in Computer Applications',
    phd: 'PhD',
  };

  const branchMap: BranchMap = {
    ug: 'Undergraduate',
    pg: 'Postgraduate',
  };

  // Parse user details from email
  const userDetails = useMemo(() => {
    const email = currentUser?.email || '';
    const match = email.match(/^(\d{4})(ug|pg)([a-z]+)/i);
    
    if (!match) return null;
    
    const [ batch, program, branchCode] = match;
    
    return {
      batch,
      program: programMap[program.toLowerCase() as keyof ProgramMap],
      branch: branchMap[branchCode.toLowerCase() as keyof BranchMap] || branchCode.toUpperCase()
    };
  }, [currentUser?.email, programMap, branchMap]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
    try {
      // Create file path
      const fileName = `${currentUser.id}-${Date.now()}.jpg`;
  
      // Upload
      const { error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);
  
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
  
      // Get URL immediately after successful upload
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
  
      // console.log('Upload successful, URL:', publicUrl);
      setImage(publicUrl);
      
      // Call onSubmit automatically after successful upload
      await onSubmit();
  
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    setIsLoading(true);
    console.log('Submitting with image:', image);
    try {
      if (currentUser?.image && currentUser.image.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
        const oldFileName = currentUser.image.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('profile-images').remove([oldFileName]);
        }
      }
      if (!image) {
        throw new Error('No image selected');
      }
      await axios.post('/api/chat/profile', { image });
      // if (!response.data) {
      //   throw new Error('Failed to get response from API');
      // }
      router.refresh();
      toast({
        title: 'Success',
        description: 'Profile picture updated!',
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile picture',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 p-6 bg-white dark:bg-gray-900 shadow-xl rounded-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 group">
              <Image
                src={image || '/image.jpg'}
                alt="Profile"
                fill
                className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
              />
              <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                  <Upload className="h-5 w-5 text-white" />
                </div>
              </label>
              {/* <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    alert('File selected'); // This will confirm if input is triggered
    handleFileSelect(e);
  }}
  className="absolute inset-0 opacity-0 cursor-pointer"
/>
<div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
  <Upload className="h-5 w-5 text-white" />
</div> */}
            </div>
          </div>

          {/* User Details */}
          {userDetails && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Batch</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.batch}</div>
              </div>
              <div className="space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Program</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.program}</div>
              </div>
              <div className="col-span-2 space-y-1 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Branch</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{userDetails.branch}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsModal;
