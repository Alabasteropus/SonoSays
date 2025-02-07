import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import { Editor } from "@/components/Editor";
import { AIAssistant } from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Document, AiSuggestion } from "@shared/schema";

interface DocumentResponse {
  document: Document;
  suggestions: AiSuggestion[];
}

export default function Document() {
  const [, params] = useRoute("/document/:id");
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch document data
  const { data, isLoading } = useQuery<DocumentResponse>({
    queryKey: [`/api/documents/${params?.id}`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (data?.document) {
      setTitle(data.document.title);
      setContent(data.document.content);
    }
  }, [data]);

  // Save document mutation
  const save = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST", 
        `/api/documents/${params?.id}`,
        { title, content }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Document saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    save.mutate();
  };

  const handleAISuggestion = (suggestion: string) => {
    setContent(prev => prev + "\n" + suggestion);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold h-12"
          placeholder="Untitled Document"
        />

        <Button
          onClick={handleSave}
          disabled={save.isPending}
        >
          {save.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        <Editor
          initialContent={content}
          onChange={setContent}
        />

        <div className="space-y-4">
          <AIAssistant
            documentId={parseInt(params?.id || "0")}
            onSuggestionSelect={handleAISuggestion}
          />
        </div>
      </div>
    </div>
  );
}