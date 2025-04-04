'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/app/hooks/use-toast';
import axios, { AxiosError } from 'axios';

// Schema for the reset password form
const resetPasswordSchema = z.object({
  verifyCode: z.string().length(6, 'Verification code must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function ResetPasswordForm({ params }: { params: { email: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const email = decodeURIComponent(params.email);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      verifyCode: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      const response = await axios.post('/api/reset-password', {
        email,
        verifyCode: data.verifyCode,
        password: data.password,
      });
      
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully.',
      });

      router.replace('/sign-in');
    } catch (error) {
      console.error('Error resetting password:', error);
      const axiosError = error as AxiosError<any>;

      toast({
        title: 'Failed to Reset Password',
        description: axiosError.response?.data.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/50 backdrop-blur-sm rounded-xl shadow-xl border border-primary/20 hover:border-primary/30 transition-all duration-300">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/80">
              New Password
            </h1>
            <Sparkles className="absolute -right-8 -top-4 text-primary animate-bounce" />
          </div>
          <p className="text-lg text-foreground/80">Enter verification code sent to {email}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verifyCode"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="verifyCode" className="text-foreground/90">
                    Verification Code
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="verifyCode" 
                    name="verifyCode" 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl" 
                    placeholder="Enter 6-digit code" 
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="password" className="text-foreground/90">
                    New Password
                  </FormLabel>
                  <Input 
                    {...field} 
                    id="password" 
                    type="password" 
                    name="password" 
                    className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-300 rounded-xl" 
                    placeholder="Create a new password" 
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Didn't receive a code?{' '}
            <Link 
              href="/forgot-password" 
              className="text-primary/90 hover:text-primary transition-colors duration-300"
            >
              Resend Code
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}