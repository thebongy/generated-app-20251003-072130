import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, LockKeyhole } from 'lucide-react';
const passwordSchema = z.object({
  password: z.string().min(1, 'Password cannot be empty.'),
});
type PasswordFormValues = z.infer<typeof passwordSchema>;
interface PasswordPromptProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
}
export function PasswordPrompt({ onSubmit, isLoading }: PasswordPromptProps) {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });
  const handleFormSubmit: SubmitHandler<PasswordFormValues> = (data) => {
    onSubmit(data.password);
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <LockKeyhole className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">Password Protected</CardTitle>
          <CardDescription>Please enter the password to view this paste.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Unlock Paste'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}