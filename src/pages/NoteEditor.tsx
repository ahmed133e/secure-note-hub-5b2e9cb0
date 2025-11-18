import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const NoteEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNewNote = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => api.getNote(Number(id)),
    enabled: !isNewNote,
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.createNote(data.title, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: 'Note created',
        description: 'Your note has been created successfully',
      });
      navigate('/dashboard');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create note',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; title: string; content: string }) =>
      api.updateNote(data.id, data.title, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      toast({
        title: 'Note saved',
        description: 'Your changes have been saved',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your note',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isNewNote) {
        await createMutation.mutateAsync({ title, content });
      } else {
        await updateMutation.mutateAsync({ id: Number(id), title, content });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (isLoading && !isNewNote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 shadow-soft">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Editor */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto py-2 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <Textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[500px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base resize-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;
