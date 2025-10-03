import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-600 rounded-full opacity-20 blur-2xl animate-float"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-slate-700 rounded-full opacity-20 blur-2xl animate-float animation-delay-3000"></div>
        <div className="relative z-10 flex flex-col items-center space-y-8 p-8 bg-card/50 backdrop-blur-lg border border-border rounded-2xl shadow-2xl">
          <div className="p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-full">
            <FileQuestion className="w-16 h-16 text-indigo-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tighter">
            404 - Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm">
            The paste you are looking for does not exist, has expired, or was never created.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-transform duration-200 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/50">
            <Link to="/">Create a New Paste</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}