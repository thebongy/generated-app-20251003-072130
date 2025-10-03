import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import type { Paste, PasteType } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import { Loader2, Code, Eye, EyeOff, FileText, Image as ImageIcon, Upload } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const expirationOptions = [
  { label: 'Never', value: '0' },
  { label: '10 Minutes', value: '600' },
  { label: '1 Hour', value: '3600' },
  { label: '1 Day', value: '86400' },
  { label: '1 Week', value: '604800' },
];
const pasteSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty.'),
  password: z.string().optional(),
  expiresIn: z.string().optional(),
  type: z.enum(['text', 'image']),
  fileName: z.string().optional(),
});
type PasteFormValues = z.infer<typeof pasteSchema>;
export function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const navigate = useNavigate();
  const form = useForm<PasteFormValues>({
    resolver: zodResolver(pasteSchema),
    defaultValues: {
      content: '',
      password: '',
      expiresIn: '0',
      type: 'text',
      fileName: '',
    },
  });
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`Image size cannot exceed ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setFileName(file.name);
      form.setValue('content', dataUrl);
      form.setValue('fileName', file.name);
      form.setValue('type', 'image');
      form.clearErrors('content');
    };
    reader.readAsDataURL(file);
  };
  const handleCreatePaste = async (data: PasteFormValues) => {
    setIsLoading(true);
    try {
      const expiresInNum = data.expiresIn ? parseInt(data.expiresIn, 10) : 0;
      const payload: { content: string; type: PasteType; password?: string; expiresIn?: number; fileName?: string } = {
        content: data.content,
        type: data.type,
      };
      if (data.password) payload.password = data.password;
      if (expiresInNum > 0) payload.expiresIn = expiresInNum;
      if (data.type === 'image' && data.fileName) payload.fileName = data.fileName;
      const newPaste = await api<Paste>('/api/pastes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('Paste created successfully! Redirecting...');
      setTimeout(() => navigate(`/v/${newPaste.id}`), 1000);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create paste. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-background dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]"></div>
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#7970e533,transparent)] -z-10"></div>
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 border border-indigo-600/20 rounded-lg">
              <Code className="h-8 w-8 text-indigo-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-50 dark:to-slate-400">
              ChromaBin
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Effortlessly share text snippets and images with syntax highlighting, password protection, and expiration.
          </p>
        </header>
        <Card className="w-full shadow-2xl animate-slide-up bg-card/80 backdrop-blur-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreatePaste)}>
              <Tabs defaultValue="text" className="w-full" onValueChange={(value) => form.setValue('type', value as PasteType)}>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">Create a New Paste</CardTitle>
                  <div className="flex justify-between items-end">
                    <CardDescription>Choose your content type and configure options below.</CardDescription>
                    <TabsList>
                      <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" />Text</TabsTrigger>
                      <TabsTrigger value="image"><ImageIcon className="h-4 w-4 mr-2" />Image</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <TabsContent value="text">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Paste your content here..."
                              className="min-h-[300px] text-base font-mono bg-muted/50 focus:bg-background transition-colors"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="image">
                    <FormField
                      control={form.control}
                      name="content"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <div className="w-full min-h-[300px] border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center p-6 text-center bg-muted/50 transition-colors hover:bg-muted/80">
                              {imagePreview ? (
                                <div className="space-y-4">
                                  <img src={imagePreview} alt="Preview" className="max-h-60 rounded-md object-contain" />
                                  <p className="text-sm text-muted-foreground">{fileName}</p>
                                  <Button type="button" variant="outline" size="sm" onClick={() => {
                                    setImagePreview(null);
                                    setFileName(null);
                                    form.setValue('content', '');
                                  }}>
                                    Remove Image
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                  <label htmlFor="image-upload" className="font-semibold text-indigo-500 cursor-pointer hover:underline">
                                    Choose an image
                                    <Input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleImageUpload} disabled={isLoading} />
                                  </label>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WEBP up to {MAX_IMAGE_SIZE_MB}MB</p>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password (Optional)</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input type={showPassword ? 'text' : 'password'} placeholder="Protect your paste" {...field} disabled={isLoading} className="pr-10" />
                            </FormControl>
                            <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiresIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires In</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select expiration time" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expirationOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Tabs>
              <CardFooter className="flex justify-end">
                <Button type="submit" size="lg" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-transform duration-200 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/50">
                  {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating...</>) : ('Create Paste')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <footer className="absolute bottom-8 text-center text-muted-foreground/80">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
      <Toaster richColors closeButton />
    </main>
  );
}