"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Download, Share2, Pencil, Calendar, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { serverGetRecordById } from "@/lib/services/records.actions";

type Record = {
  id: string;
  title: string;
  description: string | null;
  category: "meeting" | "event" | "decision" | "policy" | "financial" | "communication" | "handover" | "other";
  record_date: string | null;
  file_url: string | null;
  content: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const data = await serverGetRecordById(params.id);
      setRecord(data);
    } catch (error) {
      console.error("Error loading record:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load record" });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "meeting": return "bg-blue-100 text-blue-800";
      case "event": return "bg-green-100 text-green-800";
      case "decision": return "bg-purple-100 text-purple-800";
      case "policy": return "bg-orange-100 text-orange-800";
      case "financial": return "bg-yellow-100 text-yellow-800";
      case "communication": return "bg-pink-100 text-pink-800";
      case "handover": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDownload = () => {
    if (record?.file_url) {
      window.open(record.file_url, "_blank");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/records/${params.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Success", description: "Link copied to clipboard" });
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading record...</div>;
  }

  if (!record) {
    return <div className="text-center py-12 text-muted-foreground">Record not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{record.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getCategoryColor(record.category)}>{record.category}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/records/${params.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => router.push("/admin/records")}>Back</Button>
        </div>
      </div>

      {/* Record Details */}
      <Card>
        <CardHeader>
          <CardTitle>Record Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {record.description && <p>{record.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t">
            {record.record_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(record.record_date).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              {record.category}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Created:</span> {new Date(record.created_at).toLocaleDateString()}
            </div>
            {record.profiles && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">By:</span> {record.profiles.full_name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Attachment */}
      {record.file_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attachment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <Input value={record.file_url} readOnly className="flex-1" />
              </div>
              <div className="flex gap-2 ml-4">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {record.content && (
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-wrap">{record.content}</div>
          </CardContent>
        </Card>
      )}

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle>Share Record</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Share this link to allow others to view this record:
          </p>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/records/${params.id}`}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleShare}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
