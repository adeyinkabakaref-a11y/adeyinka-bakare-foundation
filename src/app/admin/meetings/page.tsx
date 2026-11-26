"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Eye, Pencil, Trash2, Clock, MapPin, Users, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { GuideModal } from "@/components/admin/guide-modal";
import { toast } from "@/hooks/use-toast";
import { serverGetAllMeetings, serverDeleteMeeting } from "@/lib/services/meetings.actions";

type Meeting = {
  id: string;
  title: string;
  description: string | null;
  meeting_date: string;
  meeting_time: string | null;
  location: string | null;
  meeting_type: "general" | "executive" | "committee" | "special" | null;
  status: "scheduled" | "held" | "cancelled" | "postponed";
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
    // Show guide on first visit
    const dismissedGuides = JSON.parse(localStorage.getItem("dismissedGuides") || "{}");
    if (!dismissedGuides.meetings) {
      setShowGuide(true);
    }
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await serverGetAllMeetings();
      setMeetings(data);
    } catch (error) {
      console.error("Error loading meetings:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load meetings" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await serverDeleteMeeting(id, "current-user");
      setMeetings((current) => current.filter((m) => m.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Success", description: "Meeting deleted successfully" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete meeting" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "held": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "postponed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "executive": return "bg-purple-100 text-purple-800";
      case "committee": return "bg-orange-100 text-orange-800";
      case "special": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground">Manage meeting records and minutes</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowGuide(true)} className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => router.push("/admin/meetings/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading meetings...</div>
      ) : filteredMeetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No meetings found. Create your first meeting to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{meeting.title}</h3>
                      <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                      {meeting.meeting_type && (
                        <Badge className={getTypeColor(meeting.meeting_type)}>{meeting.meeting_type}</Badge>
                      )}
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-muted-foreground mb-3">{meeting.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.meeting_date).toLocaleDateString()}
                      </div>
                      {meeting.meeting_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {meeting.meeting_time}
                        </div>
                      )}
                      {meeting.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {meeting.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/meetings/${meeting.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/meetings/${meeting.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(meeting.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Meeting?"
        description="This will permanently delete the meeting and all associated minutes and action items. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        loading={deleting}
      />

      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} type="meetings" />
    </div>
  );
}
