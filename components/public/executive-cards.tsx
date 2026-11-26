"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SocialIcon } from "@/components/ui/social-icon";

const SESSIONS = [
  "2024/2025",
  "2025/2026",
  "2026/2027",
  "2027/2028",
  "2028/2029",
  "2029/2030",
];

type Executive = {
  id: string;
  full_name: string;
  position: string;
  bio: string | null;
  photo: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  session: string | null;
  is_current: boolean;
  started_at: string | null;
  ended_at: string | null;
};

interface ExecutiveCardsProps {
  executives: Executive[];
}

export function ExecutiveCards({ executives }: ExecutiveCardsProps) {
  const [selectedSession, setSelectedSession] = useState<string>("current");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredExecutives = executives.filter((exec) => {
    if (selectedSession === "current") {
      return exec.is_current;
    }
    return exec.session === selectedSession;
  });

  const sessions = Array.from(new Set(executives.map((e) => e.session).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Session Filter */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Filter by Session</span>
        </div>
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Team</SelectItem>
            {sessions.map((session) => (
              <SelectItem key={session} value={session!}>{session}</SelectItem>
            ))}
            <SelectItem value="all">All Sessions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredExecutives.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No executives found for the selected session.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExecutives.map((executive) => (
            <Card key={executive.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Photo Section */}
                <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
                  {executive.photo ? (
                    <Image
                      src={executive.photo}
                      alt={executive.full_name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <Award className="h-16 w-16 text-primary/40" />
                  )}
                  {executive.is_current && (
                    <Badge className="absolute top-3 right-3 bg-green-600">Current</Badge>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold mb-1">{executive.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{executive.position}</p>
                    {executive.session && (
                      <Badge variant="outline" className="mt-2 text-xs">{executive.session}</Badge>
                    )}
                  </div>

                  {/* Expandable Details */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {executive.linkedin_url && (
                        <a
                          href={executive.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                          title="LinkedIn"
                        >
                          <SocialIcon platform="linkedin" className="h-4 w-4" />
                        </a>
                      )}
                      {executive.twitter_url && (
                        <a
                          href={executive.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                          title="Twitter"
                        >
                          <SocialIcon platform="twitter" className="h-4 w-4" />
                        </a>
                      )}
                      {executive.instagram_url && (
                        <a
                          href={executive.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                          title="Instagram"
                        >
                          <SocialIcon platform="instagram" className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    {executive.bio && (
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === executive.id ? null : executive.id)}
                          className="p-0 h-auto text-xs"
                        >
                          {expandedId === executive.id ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              View Bio
                            </>
                          )}
                        </Button>
                        {expandedId === executive.id && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                            {executive.bio}
                          </p>
                        )}
                      </div>
                    )}

                    {(executive.started_at || executive.ended_at) && (
                      <div className="text-xs text-muted-foreground">
                        {executive.started_at && <span>Started: {new Date(executive.started_at).toLocaleDateString()}</span>}
                        {executive.started_at && executive.ended_at && <span className="mx-2">•</span>}
                        {executive.ended_at && <span>Ended: {new Date(executive.ended_at).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
