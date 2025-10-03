import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import type { Paste, GetPasteResponse } from '@shared/types';
import { CustomSyntaxHighlighter } from '@/components/SyntaxHighlighter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from 'sonner';
import { Copy, FileText, Calendar, Home, Clock, Lock, ExternalLink, Link as LinkIcon, QrCode } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PasswordPrompt } from '@/components/PasswordPrompt';
import { formatDistanceToNow } from 'date-fns';
export function ViewPastePage() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  useEffect(() => {
    setPageUrl(window.location.href);
    if (id) {
      api<GetPasteResponse>(`/api/pastes/${id}`)
        .then((data) => {
          if ('passwordRequired' in data) {
            setPasswordRequired(true);
          } else {
            setPaste(data);
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to load paste. It might not exist or has expired.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);
  const handlePasswordSubmit = async (password: string) => {
    setVerifying(true);
    try {
      const unlockedPaste = await api<Paste>(`/api/pastes/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      setPaste(unlockedPaste);
      setPasswordRequired(false);
      toast.success('Paste unlocked successfully!');
    } catch (err) {
      toast.error((err as Error).message || 'An unknown error occurred.');
    } finally {
      setVerifying(false);
    }
  };
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Shareable link copied to clipboard!');
  };
  const copyRawContent = () => {
    if (paste && paste.type === 'text') {
      navigator.clipboard.writeText(paste.content);
      toast.success('Content copied to clipboard!');
    }
  };
  const copyRawLink = () => {
    if (paste) {
      const rawUrl = `${window.location.origin}/api/pastes/${paste.id}/raw`;
      navigator.clipboard.writeText(rawUrl);
      toast.success('Raw link copied to clipboard!');
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  if (passwordRequired) {
    return <PasswordPrompt onSubmit={handlePasswordSubmit} isLoading={verifying} />;
  }
  if (error || !paste) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <Card className="w-full max-w-md p-8 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-destructive">Error</CardTitle>
            <CardDescription>{error || 'Paste not found.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const rawLink = `/api/pastes/${paste.id}/raw`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pageUrl)}`;
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tighter text-indigo-500">ChromaBin</h1>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" aria-label="Go to homepage">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <Card className="bg-card/50 border">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Paste Details</CardTitle>
              <CardDescription>ID: {paste.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(paste.createdAt).toLocaleString()}</span>
                </div>
                {paste.expiresAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Expires: {formatDistanceToNow(new Date(paste.expiresAt), { addSuffix: true })}</span>
                  </div>
                )}
                {paste.passwordHash && (
                  <div className="flex items-center gap-2 text-amber-500">
                    <Lock className="h-4 w-4" />
                    <span>Password Protected</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={copyLink}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Link
                </Button>
                {paste.type === 'text' && (
                  <Button variant="outline" size="sm" onClick={copyRawContent}>
                    <FileText className="h-4 w-4 mr-2" /> Copy Content
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={copyRawLink}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Copy Raw Link
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={rawLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Open Raw
                  </a>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4 mr-2" /> Share via QR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share with QR Code</DialogTitle>
                      <DialogDescription>
                        Scan this code with a mobile device to open this paste.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" width="256" height="256" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </header>
        <div className="w-full">
          {paste.type === 'text' ? (
            <CustomSyntaxHighlighter language="plaintext">
              {paste.content}
            </CustomSyntaxHighlighter>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/50 flex justify-center">
              <img src={paste.content} alt={paste.fileName || 'Pasted Image'} className="max-w-full max-h-[80vh] rounded-md object-contain" />
            </div>
          )}
        </div>
      </div>
      <Toaster richColors closeButton />
    </main>
  );
}