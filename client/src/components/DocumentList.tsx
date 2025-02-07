import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Document } from "@shared/schema";

interface GoogleDoc {
  id: string;
  name: string;
  modifiedTime: string;
}

interface DocumentsResponse {
  google: GoogleDoc[];
  local: Document[];
}

export function DocumentList() {
  const { data, isLoading } = useQuery<DocumentsResponse>({
    queryKey: ["/api/documents"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { google = [], local = [] } = data || { google: [], local: [] };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Documents</h2>
        <Button asChild>
          <Link href="/new">
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {local.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {doc.title}
              </CardTitle>
              <CardDescription>
                Last edited {new Date(doc.lastSynced!).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild className="w-full">
                <Link href={`/document/${doc.id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {google.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {doc.name}
              </CardTitle>
              <CardDescription>
                Google Doc • Last edited{" "}
                {new Date(doc.modifiedTime).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" asChild className="w-full">
                <Link href={`/google/${doc.id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}