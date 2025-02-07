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
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const { data, isLoading, error } = useQuery<DocumentResponse>({
    queryKey: [`/api/documents/${params?.id}`],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (data?.document) {
      setTitle(data.document.title);
      setContent(JSON.stringify(data.document.content));
    }
  }, [data]);

  // Save document mutation
  const save = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "PUT", 
        `/api/documents/${params?.id}`,
        { title, content: JSON.parse(content) }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved",
        description: "Document saved successfully"
      });
      // Invalidate the document cache to refetch latest data
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${params?.id}`] });
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
    setContent(prev => {
      const content = JSON.parse(prev || "{}");
      return JSON.stringify({
        ...content,
        text: (content.text || "") + "\n" + suggestion
      });
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Document</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Please make sure you're signed in and have access to this document."}
        </p>
      </div>
    );
  }

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