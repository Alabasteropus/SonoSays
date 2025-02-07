import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/Editor";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function NewDocument() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/documents", {
        title,
        content: JSON.parse(content || "{}")
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Document created successfully"
      });
      setLocation(`/document/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive"
      });
    }
  });

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
          onClick={() => create.mutate()}
          disabled={create.isPending}
        >
          {create.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Create
        </Button>
      </div>

      <Editor
        initialContent={content}
        onChange={setContent}
      />
    </div>
  );
}
