"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Lightbulb, Folder, ArrowRightLeft, CheckCircle, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "meetings" | "proposals" | "records" | "handovers";
}

const guideContent = {
  meetings: {
    title: "Meeting Management Guide",
    icon: Calendar,
    description: "Organize and track all your fellowship meetings with minutes and action items.",
    features: [
      {
        title: "Schedule Meetings",
        description: "Create meetings with dates, times, locations, and agendas. Set statuses like 'scheduled', 'held', or 'cancelled'.",
        icon: Clock,
      },
      {
        title: "Document Minutes",
        description: "Write and version meeting minutes. Keep a history of what was discussed and decided.",
        icon: FileText,
      },
      {
        title: "Track Action Items",
        description: "Assign tasks with due dates and track their completion status through the meeting lifecycle.",
        icon: CheckCircle,
      },
    ],
    examples: [
      "Monthly executive team meetings",
      "Committee planning sessions",
      "Special project review meetings",
      "Annual general meetings",
    ],
  },
  proposals: {
    title: "Proposal Management Guide",
    icon: Lightbulb,
    description: "Collect and vote on ideas for the fellowship. Share voting links with executives.",
    features: [
      {
        title: "Submit Ideas",
        description: "Create proposals with titles, descriptions, and categories. Link them to specific meetings for discussion.",
        icon: Lightbulb,
      },
      {
        title: "Public Voting",
        description: "Generate shareable voting links. Executives can vote to approve, reject, or abstain on proposals.",
        icon: Users,
      },
      {
        title: "Track Status",
        description: "Move proposals through the lifecycle: proposed → under review → approved → in progress → completed.",
        icon: CheckCircle,
      },
    ],
    examples: [
      "New programme initiatives",
      "Event planning proposals",
      "Policy changes suggestions",
      "Budget allocation requests",
    ],
  },
  records: {
    title: "Records Management Guide",
    icon: Folder,
    description: "Maintain a central repository of all organizational documents and evidence.",
    features: [
      {
        title: "Organize Documents",
        description: "Categorize records by type: meetings, events, decisions, policies, financial, and communications.",
        icon: Folder,
      },
      {
        title: "Store Files",
        description: "Upload PDFs, images, and other documents. Keep all institutional memory in one place.",
        icon: FileText,
      },
      {
        title: "Search & Share",
        description: "Quickly find records by category or date. Share important documents via email or download.",
        icon: ArrowRightLeft,
      },
    ],
    examples: [
      "Meeting minutes and agendas",
      "Financial reports",
      "Policy documents",
      "Event documentation",
    ],
  },
  handovers: {
    title: "Handover Management Guide",
    icon: ArrowRightLeft,
    description: "Document executive transitions to ensure smooth leadership handovers.",
    features: [
      {
        title: "Document Transitions",
        description: "Record handing over from/to executives with session information and handover dates.",
        icon: ArrowRightLeft,
      },
      {
        title: "Project Summary",
        description: "Document ongoing projects, financial status, and contact lists for the new executive team.",
        icon: FileText,
      },
      {
        title: "Track Status",
        description: "Move handovers through draft → pending → completed → archived as transitions complete.",
        icon: CheckCircle,
      },
    ],
    examples: [
      "Annual executive team handover",
      "Project-specific leadership transitions",
      "Committee chair handovers",
      "Role-specific handovers",
    ],
  },
};

export function GuideModal({ isOpen, onClose, type }: GuideModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const content = guideContent[type];
  const Icon = content.icon;

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check if user has dismissed this guide before
    const dismissedGuides = JSON.parse(localStorage.getItem("dismissedGuides") || "{}");
    if (dismissedGuides[type]) {
      onClose();
    }
  }, [type, onClose]);

  const handleDontShowAgain = () => {
    const dismissedGuides = JSON.parse(localStorage.getItem("dismissedGuides") || "{}");
    dismissedGuides[type] = true;
    localStorage.setItem("dismissedGuides", JSON.stringify(dismissedGuides));
    onClose();
  };

  const contentJSX = (
    <>
      <div className="space-y-6 mt-6">
        {/* Features Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">What you can do</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature, index) => (
              <Card key={index} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Examples Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Example use cases</h3>
          <div className="flex flex-wrap gap-2">
            {content.examples.map((example, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                {example}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-muted-foreground">Don't show this again</span>
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {dontShowAgain && (
              <Button onClick={handleDontShowAgain}>
                Got it
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-2xl">{content.title}</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground mt-1">{content.description}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          {contentJSX}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{content.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        {contentJSX}
      </DialogContent>
    </Dialog>
  );
}
