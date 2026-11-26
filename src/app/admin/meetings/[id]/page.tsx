"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Plus, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { serverGetMeetingById, serverUpdateMeeting } from "@/lib/services/meetings.actions";
import { serverGetMinutesByMeetingId, serverCreateMinute } from "@/lib/services/meeting-minutes.actions";
import { serverGetActionItemsByMeetingId, serverCreateActionItem } from "@/lib/services/meeting-action-items.actions";

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

type Minute = {
  id: string;
  content: string;
  version: number;
  created_at: string;
};

type ActionItem = {
  id: string;
  description: string;
  assignee: string | null;
  due_date: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
};

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newMinute, setNewMinute] = useState("");
  const [newAction, setNewAction] = useState({ description: "", assignee: "", due_date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadMeeting();
  }, []);

  const loadMeeting = async () => {
    try {
      setLoading(true);
      const data = await serverGetMeetingById(params.id);
      setMeeting(data);
      // Load minutes and action items
      if (data) {
        const [minutesData, actionItemsData] = await Promise.all([
          serverGetMinutesByMeetingId(params.id),
          serverGetActionItemsByMeetingId(params.id),
        ]);
        setMinutes(minutesData);
        setActionItems(actionItemsData);
      }
    } catch (error) {
      console.error("Error loading meeting:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load meeting" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMinute = async () => {
    if (!newMinute.trim()) return;
    setSaving(true);
    try {
      const latestVersion = minutes.length > 0 ? Math.max(...minutes.map(m => m.version)) : 0;
      const newMinuteObj = await serverCreateMinute({
        meeting_id: params.id,
        content: newMinute,
        version: latestVersion + 1,
      }, "current-user");
      if (newMinuteObj) {
        setMinutes([...minutes, newMinuteObj]);
        setNewMinute("");
        toast({ title: "Success", description: "Minutes saved" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save minutes" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddActionItem = async () => {
    if (!newAction.description.trim()) return;
    setSaving(true);
    try {
      const newActionObj = await serverCreateActionItem({
        meeting_id: params.id,
        description: newAction.description,
        assignee: newAction.assignee || null,
        due_date: newAction.due_date || null,
        status: "pending",
      }, "current-user");
      if (newActionObj) {
        setActionItems([...actionItems, newActionObj]);
        setNewAction({ description: "", assignee: "", due_date: "" });
        toast({ title: "Success", description: "Action item added" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to add action item" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "held": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "postponed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading meeting...</div>;
  }

  if (!meeting) {
    return <div className="text-center py-12 text-muted-foreground">Meeting not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
            {meeting.meeting_type && <Badge variant="outline">{meeting.meeting_type}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/meetings/${params.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => router.push("/admin/meetings")}>Back</Button>
        </div>
      </div>

      {/* Meeting Details */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {meeting.description && <p>{meeting.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {new Date(meeting.meeting_date).toLocaleDateString()}
            </div>
            {meeting.meeting_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {meeting.meeting_time}
              </div>
            )}
            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {meeting.location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Minutes */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Minutes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {minutes.length === 0 ? (
            <p className="text-muted-foreground">No minutes recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {minutes.map((minute) => (
                <div key={minute.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Version {minute.version}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(minute.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{minute.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-minute">Add New Minutes</Label>
            <Textarea
              id="new-minute"
              value={newMinute}
              onChange={(e) => setNewMinute(e.target.value)}
              placeholder="Enter meeting minutes..."
              rows={4}
            />
            <Button onClick={handleSaveMinute} disabled={saving} loading={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Minutes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionItems.length === 0 ? (
            <p className="text-muted-foreground">No action items yet.</p>
          ) : (
            <div className="space-y-3">
              {actionItems.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {item.assignee && <span>Assignee: {item.assignee}</span>}
                        {item.due_date && <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Badge className={getActionStatusColor(item.status)}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="action-desc">Description</Label>
                <Input
                  id="action-desc"
                  value={newAction.description}
                  onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  placeholder="Action item description"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-assignee">Assignee</Label>
                <Input
                  id="action-assignee"
                  value={newAction.assignee}
                  onChange={(e) => setNewAction({ ...newAction, assignee: e.target.value })}
                  placeholder="Who is responsible"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="action-due">Due Date</Label>
                <Input
                  id="action-due"
                  type="date"
                  value={newAction.due_date}
                  onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddActionItem} disabled={saving} loading={saving}>
              <Plus className="mr-2 h-4 w-4" />
              Add Action Item
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
