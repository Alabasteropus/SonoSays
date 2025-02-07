import { DocumentList } from "@/components/DocumentList";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pencil, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome to WriteWithAI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          An AI-enhanced writing platform that helps you write better content
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Rich Text Editor
            </CardTitle>
            <CardDescription>
              Write and format your content with our powerful editor
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Writing Assistance
            </CardTitle>
            <CardDescription>
              Get intelligent suggestions and summaries powered by AI
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Document List */}
      <div className="mt-12">
        <DocumentList />
      </div>
    </div>
  );
}