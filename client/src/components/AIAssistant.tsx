import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  AlignJustify,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIAssistantProps {
  documentId: number;
  onSuggestionSelect?: (text: string) => void;
}

export function AIAssistant({ documentId, onSuggestionSelect }: AIAssistantProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"complete" | "summarize">("complete");

  const suggestion = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const res = await apiRequest(
        "POST",
        `/api/documents/${documentId}/suggestions`,
        { type }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data.type === "completion" && onSuggestionSelect) {
        onSuggestionSelect(data.content);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive"
      });
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "complete" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("complete")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Complete
          </Button>
          <Button
            variant={activeTab === "summarize" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("summarize")}
          >
            <AlignJustify className="w-4 h-4 mr-2" />
            Summarize
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeTab === "complete" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI suggestions to continue your writing
            </p>
            <Button
              className="w-full"
              disabled={suggestion.isPending}
              onClick={() => suggestion.mutate({ type: "completion" })}
            >
              {suggestion.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Completion
            </Button>
          </div>
        )}

        {activeTab === "summarize" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Get a summary of your document
            </p>
            <Button
              className="w-full"
              disabled={suggestion.isPending}
              onClick={() => suggestion.mutate({ type: "summary" })}
            >
              {suggestion.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlignJustify className="w-4 h-4 mr-2" />
              )}
              Generate Summary
            </Button>
          </div>
        )}

        {suggestion.data && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{suggestion.data.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
