export type Json =
 | string
 | number
 | boolean
 | null
 | { [key: string]: Json | undefined }
 | Json[];

export interface Database {
 public: {
  Tables: {
   profiles: {
    Row: {
     id: string;
     full_name: string;
     role: "super_admin" | "admin" | "editor";
     status: "active" | "inactive" | "suspended";
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     full_name: string;
     role?: "super_admin" | "admin" | "editor";
     status?: "active" | "inactive" | "suspended";
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     full_name?: string;
     role?: "super_admin" | "admin" | "editor";
     status?: "active" | "inactive" | "suspended";
     created_at?: string;
     updated_at?: string;
    };
   };
   members: {
    Row: {
     id: string;
     full_name: string;
     email: string | null;
     phone: string | null;
     department: string | null;
     level: string | null;
     session: string | null;
     photo: string | null;
     status: "active" | "inactive" | "graduated" | "archived";
     joined_at: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     full_name: string;
     email?: string | null;
     phone?: string | null;
     department?: string | null;
     level?: string | null;
     session?: string | null;
     photo?: string | null;
     status?: "active" | "inactive" | "graduated" | "archived";
     joined_at?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     full_name?: string;
     email?: string | null;
     phone?: string | null;
     department?: string | null;
     level?: string | null;
     session?: string | null;
     photo?: string | null;
     status?: "active" | "inactive" | "graduated" | "archived";
     joined_at?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
   volunteers: {
    Row: {
     id: string;
     full_name: string;
     email: string;
     phone: string | null;
     department: string | null;
     level: string | null;
     interest: string | null;
     message: string | null;
     status: "new" | "contacted" | "accepted" | "rejected" | "archived";
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     full_name: string;
     email: string;
     phone?: string | null;
     department?: string | null;
     level?: string | null;
     interest?: string | null;
     message?: string | null;
     status?: "new" | "contacted" | "accepted" | "rejected" | "archived";
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     full_name?: string;
     email?: string;
     phone?: string | null;
     department?: string | null;
     level?: string | null;
     interest?: string | null;
     message?: string | null;
     status?: "new" | "contacted" | "accepted" | "rejected" | "archived";
     created_at?: string;
     updated_at?: string;
    };
   };
   events: {
    Row: {
     id: string;
     title: string;
     slug: string;
     description: string;
     location: string | null;
     start_at: string;
     end_at: string | null;
     image: string | null;
     status: "draft" | "published" | "archived";
     featured: boolean;
     created_at: string;
     updated_at: string;
     meet_link: string | null;
     president_name: string | null;
     president_image: string | null;
     whatsapp_link: string | null;
     email_from_name: string | null;
    };
    Insert: {
     id?: string;
     title: string;
     slug: string;
     description: string;
     location?: string | null;
     start_at: string;
     end_at?: string | null;
     image?: string | null;
     status?: "draft" | "published" | "archived";
     featured?: boolean;
     meet_link?: string | null;
     president_name?: string | null;
     president_image?: string | null;
     whatsapp_link?: string | null;
     email_from_name?: string | null;
    };
    Update: {
     id?: string;
     title?: string;
     slug?: string;
     description?: string;
     location?: string | null;
     start_at?: string;
     end_at?: string | null;
     image?: string | null;
     status?: "draft" | "published" | "archived";
     featured?: boolean;
     meet_link?: string | null;
     president_name?: string | null;
     president_image?: string | null;
     whatsapp_link?: string | null;
     email_from_name?: string | null;
    };
   };
   news: {
    Row: {
     id: string;
     title: string;
     slug: string;
     excerpt: string | null;
     content: string;
     image: string | null;
     author_id: string | null;
     status: "draft" | "published" | "archived";
     published_at: string | null;
     featured: boolean;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     title: string;
     slug: string;
     excerpt?: string | null;
     content: string;
     image?: string | null;
     author_id?: string | null;
     status?: "draft" | "published" | "archived";
     published_at?: string | null;
     featured?: boolean;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     title?: string;
     slug?: string;
     excerpt?: string | null;
     content?: string;
     image?: string | null;
     author_id?: string | null;
     status?: "draft" | "published" | "archived";
     published_at?: string | null;
     featured?: boolean;
     created_at?: string;
     updated_at?: string;
    };
   };
testimonials: {
Row: {
id: string;
beneficiary_id: string | null;
content: string;
media_url: string | null;
media_type: "image" | "audio" | "video" | "document" | "other" | null;
featured: boolean;
status: "draft" | "published" | "archived";
created_at: string;
updated_at: string;
};
Insert: {
id?: string;
beneficiary_id?: string | null;
content: string;
media_url?: string | null;
media_type?: "image" | "audio" | "video" | "document" | "other" | null;
featured?: boolean;
status?: "draft" | "published" | "archived";
created_at?: string;
updated_at?: string;
};
Update: {
id?: string;
beneficiary_id?: string | null;
content?: string;
media_url?: string | null;
media_type?: "image" | "audio" | "video" | "document" | "other" | null;
featured?: boolean;
status?: "draft" | "published" | "archived";
created_at?: string;
updated_at?: string;
};
};
beneficiaries: {
Row: {
id: string;
full_name: string;
photo: string | null;
department: string | null;
level: string | null;
session: string | null;
programme: string | null;
bio: string | null;
status: "draft" | "published" | "archived";
featured: boolean;
created_at: string;
updated_at: string;
};
Insert: {
id?: string;
full_name: string;
photo?: string | null;
department?: string | null;
level?: string | null;
session?: string | null;
programme?: string | null;
bio?: string | null;
status?: "draft" | "published" | "archived";
featured?: boolean;
created_at?: string;
updated_at?: string;
};
Update: {
id?: string;
full_name?: string;
photo?: string | null;
department?: string | null;
level?: string | null;
session?: string | null;
programme?: string | null;
bio?: string | null;
status?: "draft" | "published" | "archived";
featured?: boolean;
created_at?: string;
updated_at?: string;
};
};
executives: {
Row: {
id: string;
full_name: string;
position: string;
bio: string | null;
photo: string | null;
linkedin_url: string | null;
twitter_url: string | null;
instagram_url: string | null;
display_order: number;
featured: boolean;
status: "draft" | "published" | "archived";
session: string | null;
is_current: boolean;
started_at: string | null;
ended_at: string | null;
created_at: string;
updated_at: string;
};
Insert: {
id?: string;
full_name: string;
position: string;
bio?: string | null;
photo?: string | null;
linkedin_url?: string | null;
twitter_url?: string | null;
instagram_url?: string | null;
display_order?: number;
featured?: boolean;
status?: "draft" | "published" | "archived";
session?: string | null;
is_current?: boolean;
started_at?: string | null;
ended_at?: string | null;
created_at?: string;
updated_at?: string;
};
Update: {
id?: string;
full_name?: string;
position?: string;
bio?: string | null;
photo?: string | null;
linkedin_url?: string | null;
twitter_url?: string | null;
instagram_url?: string | null;
display_order?: number;
featured?: boolean;
status?: "draft" | "published" | "archived";
session?: string | null;
is_current?: boolean;
started_at?: string | null;
ended_at?: string | null;
created_at?: string;
updated_at?: string;
};
};
   programmes: {
    Row: {
     id: string;
     title: string;
     slug: string;
     short_description: string | null;
     description: string;
     image: string | null;
     location: string | null;
     status: "draft" | "published" | "archived";
     featured: boolean;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     title: string;
     slug: string;
     short_description?: string | null;
     description: string;
     image?: string | null;
     location?: string | null;
     status?: "draft" | "published" | "archived";
     featured?: boolean;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     title?: string;
     slug?: string;
     short_description?: string | null;
     description?: string;
     image?: string | null;
     location?: string | null;
     status?: "draft" | "published" | "archived";
     featured?: boolean;
     created_at?: string;
     updated_at?: string;
    };
   };
contents: {
Row: {
id: string;
key: string;
title: string | null;
content: string | null;
image: string | null;
status: "draft" | "published" | "archived";
updated_by: string | null;
created_at: string;
updated_at: string;
};
Insert: {
id?: string;
key: string;
title?: string | null;
content?: string | null;
image?: string | null;
status?: "draft" | "published" | "archived";
updated_by?: string | null;
created_at?: string;
updated_at?: string;
};
Update: {
id?: string;
key?: string;
title?: string | null;
content?: string | null;
image?: string | null;
status?: "draft" | "published" | "archived";
updated_by?: string | null;
created_at?: string;
updated_at?: string;
};
};
media: {
Row: {
id: string;
filename: string;
storage_path: string;
type: "image" | "audio" | "video" | "document" | "other";
mime_type: string | null;
size_bytes: number | null;
uploaded_by: string | null;
created_at: string;
};
Insert: {
id?: string;
filename: string;
storage_path: string;
type: "image" | "audio" | "video" | "document" | "other";
mime_type?: string | null;
size_bytes?: number | null;
uploaded_by?: string | null;
created_at?: string;
};
Update: {
id?: string;
filename?: string;
storage_path?: string;
type?: "image" | "audio" | "video" | "document" | "other";
mime_type?: string | null;
size_bytes?: number | null;
uploaded_by?: string | null;
created_at?: string;
};
};
footer_sections: {
Row: {
id: string;
title: string;
sort_order: number;
is_active: boolean;
};
Insert: {
id?: string;
title: string;
sort_order?: number;
is_active?: boolean;
};
Update: {
id?: string;
title?: string;
sort_order?: number;
is_active?: boolean;
};
};
footer_links: {
Row: {
id: string;
section_id: string;
label: string;
url: string;
sort_order: number;
is_active: boolean;
};
Insert: {
id?: string;
section_id: string;
label: string;
url: string;
sort_order?: number;
is_active?: boolean;
};
Update: {
id?: string;
section_id?: string;
label?: string;
url?: string;
sort_order?: number;
is_active?: boolean;
};
};
   social_links: {
    Row: {
     id: string;
     platform: string;
     url: string;
     is_active: boolean;
     sort_order: number;
    };
    Insert: {
     id?: string;
     platform: string;
     url: string;
     is_active?: boolean;
     sort_order?: number;
    };
    Update: {
     id?: string;
     platform?: string;
     url?: string;
     is_active?: boolean;
     sort_order?: number;
    };
   };
   site_settings: {
    Row: {
     id: string;
     logo: string | null;
     site_name: string | null;
     tagline: string | null;
     description: string | null;
     address: string | null;
     phone: string | null;
     email: string | null;
     facebook: string | null;
     instagram: string | null;
     twitter: string | null;
     linkedin: string | null;
     youtube: string | null;
     updated_by: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     logo?: string | null;
     site_name?: string | null;
     tagline?: string | null;
     description?: string | null;
     address?: string | null;
     phone?: string | null;
     email?: string | null;
     facebook?: string | null;
     instagram?: string | null;
     twitter?: string | null;
     linkedin?: string | null;
     youtube?: string | null;
     updated_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     logo?: string | null;
     site_name?: string | null;
     tagline?: string | null;
     description?: string | null;
     address?: string | null;
     phone?: string | null;
     email?: string | null;
     facebook?: string | null;
     instagram?: string | null;
     twitter?: string | null;
     linkedin?: string | null;
     youtube?: string | null;
     updated_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
   notifications: {
    Row: {
     id: string;
     recipient_id: string;
     type: string;
     title: string;
     message: string;
     data: Json | null;
     read: boolean;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     recipient_id: string;
     type?: string;
     title: string;
     message: string;
     data?: Json | null;
     read?: boolean;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     recipient_id?: string;
     type?: string;
     title?: string;
     message?: string;
     data?: Json | null;
     read?: boolean;
     created_at?: string;
     updated_at?: string;
    };
   };
   email_logs: {
    Row: {
     id: string;
     to_email: string;
     to_name: string | null;
     subject: string;
     template: string;
     html_preview: string | null;
     status: string;
     provider: string;
     provider_id: string | null;
     metadata: Json | null;
     created_by: string | null;
     error: string | null;
     created_at: string;
    };
    Insert: {
     id?: string;
     to_email: string;
     to_name?: string | null;
     subject: string;
     template: string;
     html_preview?: string | null;
     status?: string;
     provider?: string;
     provider_id?: string | null;
     metadata?: Json | null;
     created_by?: string | null;
     error?: string | null;
     created_at?: string;
    };
    Update: {
     id?: string;
     to_email?: string;
     to_name?: string | null;
     subject?: string;
     template?: string;
     html_preview?: string | null;
     status?: string;
     provider?: string;
     provider_id?: string | null;
     metadata?: Json | null;
     created_by?: string | null;
     error?: string | null;
     created_at?: string;
    };
   };
   /**
    * Event forms for each event — admins create forms per event
    */
   event_forms: {
    Row: {
     id: string;
     event_id: string;
     title: string;
     description: string | null;
     status: "active" | "inactive" | "closed";
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     event_id: string;
     title: string;
     description?: string | null;
     status?: "active" | "inactive" | "closed";
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     event_id?: string;
     title?: string;
     description?: string | null;
     status?: "active" | "inactive" | "closed";
     created_at?: string;
     updated_at?: string;
    };
   };
   /**
    * Dynamic form fields per form
    */
   form_fields: {
    Row: {
     id: string;
     form_id: string;
     label: string;
     field_type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "date" | "url" | "file";
     required: boolean;
     options: Json | null;
     placeholder: string | null;
     display_order: number;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     form_id: string;
     label: string;
     field_type: "text" | "email" | "phone" | "number" | "textarea" | "select" | "date" | "url" | "file";
     required?: boolean;
     options?: Json | null;
     placeholder?: string | null;
     display_order?: number;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     form_id?: string;
     label?: string;
     field_type?: "text" | "email" | "phone" | "number" | "textarea" | "select" | "date" | "url" | "file";
     required?: boolean;
     options?: Json | null;
     placeholder?: string | null;
     display_order?: number;
     created_at?: string;
     updated_at?: string;
    };
   };
   /**
    * Form responses — submitted applications
    */
   form_responses: {
    Row: {
     id: string;
     form_id: string;
     event_id: string;
     full_name: string;
     email: string;
     phone: string | null;
     responses: Json;
     submitted_at: string;
     ip_address: string | null;
     user_agent: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     form_id: string;
     event_id: string;
     full_name: string;
     email: string;
     phone?: string | null;
     responses?: Json;
     submitted_at?: string;
     ip_address?: string | null;
     user_agent?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     form_id?: string;
     event_id?: string;
     full_name?: string;
     email?: string;
     phone?: string | null;
     responses?: Json;
     submitted_at?: string;
     ip_address?: string | null;
     user_agent?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
admin_mfa: {
Row: {
id: string;
admin_id: string;
totp_enabled: boolean;
encrypted_totp_secret: string | null;
email_otp_enabled: boolean;
passkey_enabled: boolean;
mfa_required: boolean;
created_at: string;
updated_at: string;
};
Insert: {
id?: string;
admin_id: string;
totp_enabled?: boolean;
encrypted_totp_secret?: string | null;
email_otp_enabled?: boolean;
passkey_enabled?: boolean;
mfa_required?: boolean;
created_at?: string;
updated_at?: string;
};
Update: {
id?: string;
admin_id?: string;
totp_enabled?: boolean;
encrypted_totp_secret?: string | null;
email_otp_enabled?: boolean;
passkey_enabled?: boolean;
mfa_required?: boolean;
created_at?: string;
updated_at?: string;
};
};
   admin_passkeys: {
    Row: {
     id: string;
     admin_id: string;
     credential_id: string;
     public_key: string;
     counter: number;
     device_name: string | null;
     last_used_at: string | null;
     created_at: string;
    };
    Insert: {
     id?: string;
     admin_id: string;
     credential_id: string;
     public_key: string;
     counter?: number;
     device_name?: string | null;
     last_used_at?: string | null;
     created_at?: string;
    };
    Update: {
     id?: string;
     admin_id?: string;
     credential_id?: string;
     public_key?: string;
     counter?: number;
     device_name?: string | null;
     last_used_at?: string | null;
     created_at?: string;
    };
   };
   mfa_recovery_codes: {
    Row: {
     id: string;
     admin_id: string;
     code_hash: string;
     used_at: string | null;
     created_at: string;
    };
    Insert: {
     id?: string;
     admin_id: string;
     code_hash: string;
     used_at?: string | null;
     created_at?: string;
    };
    Update: {
     id?: string;
     admin_id?: string;
     code_hash?: string;
     used_at?: string | null;
     created_at?: string;
    };
   };
   meetings: {
    Row: {
     id: string;
     title: string;
     description: string | null;
     meeting_date: string;
     meeting_time: string | null;
     location: string | null;
     meeting_type: "general" | "executive" | "committee" | "special" | null;
     status: "scheduled" | "held" | "cancelled" | "postponed";
     created_by: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     title: string;
     description?: string | null;
     meeting_date: string;
     meeting_time?: string | null;
     location?: string | null;
     meeting_type?: "general" | "executive" | "committee" | "special" | null;
     status?: "scheduled" | "held" | "cancelled" | "postponed";
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     title?: string;
     description?: string | null;
     meeting_date?: string;
     meeting_time?: string | null;
     location?: string | null;
     meeting_type?: "general" | "executive" | "committee" | "special" | null;
     status?: "scheduled" | "held" | "cancelled" | "postponed";
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
   meeting_minutes: {
    Row: {
     id: string;
     meeting_id: string;
     content: string;
     version: number;
     created_by: string | null;
     created_at: string;
    };
    Insert: {
     id?: string;
     meeting_id: string;
     content: string;
     version?: number;
     created_by?: string | null;
     created_at?: string;
    };
    Update: {
     id?: string;
     meeting_id?: string;
     content?: string;
     version?: number;
     created_by?: string | null;
     created_at?: string;
    };
   };
   meeting_action_items: {
    Row: {
     id: string;
     meeting_id: string;
     description: string;
     assignee: string | null;
     due_date: string | null;
     status: "pending" | "in_progress" | "completed" | "cancelled";
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     meeting_id: string;
     description: string;
     assignee?: string | null;
     due_date?: string | null;
     status?: "pending" | "in_progress" | "completed" | "cancelled";
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     meeting_id?: string;
     description?: string;
     assignee?: string | null;
     due_date?: string | null;
     status?: "pending" | "in_progress" | "completed" | "cancelled";
     created_at?: string;
     updated_at?: string;
    };
   };
   proposals: {
    Row: {
     id: string;
     title: string;
     description: string;
     category: "event" | "policy" | "programme" | "initiative" | "other" | null;
     proposer_name: string | null;
     proposer_email: string | null;
     status: "proposed" | "under_review" | "approved" | "rejected" | "in_progress" | "completed" | "archived";
     meeting_id: string | null;
     created_by: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     title: string;
     description: string;
     category?: "event" | "policy" | "programme" | "initiative" | "other" | null;
     proposer_name?: string | null;
     proposer_email?: string | null;
     status?: "proposed" | "under_review" | "approved" | "rejected" | "in_progress" | "completed" | "archived";
     meeting_id?: string | null;
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     title?: string;
     description?: string;
     category?: "event" | "policy" | "programme" | "initiative" | "other" | null;
     proposer_name?: string | null;
     proposer_email?: string | null;
     status?: "proposed" | "under_review" | "approved" | "rejected" | "in_progress" | "completed" | "archived";
     meeting_id?: string | null;
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
   proposal_votes: {
    Row: {
     id: string;
     proposal_id: string;
     voter_id: string;
     voter_name: string | null;
     vote: "approve" | "reject" | "abstain";
     comment: string | null;
     created_at: string;
    };
    Insert: {
     id?: string;
     proposal_id: string;
     voter_id: string;
     voter_name?: string | null;
     vote: "approve" | "reject" | "abstain";
     comment?: string | null;
     created_at?: string;
    };
    Update: {
     id?: string;
     proposal_id?: string;
     voter_id?: string;
     voter_name?: string | null;
     vote?: "approve" | "reject" | "abstain";
     comment?: string | null;
     created_at?: string;
    };
   };
   records: {
    Row: {
     id: string;
     title: string;
     description: string | null;
     category: "meeting" | "event" | "decision" | "policy" | "financial" | "communication" | "handover" | "other";
     record_date: string | null;
     file_url: string | null;
     content: string | null;
     created_by: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     title: string;
     description?: string | null;
     category: "meeting" | "event" | "decision" | "policy" | "financial" | "communication" | "handover" | "other";
     record_date?: string | null;
     file_url?: string | null;
     content?: string | null;
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     title?: string;
     description?: string | null;
     category?: "meeting" | "event" | "decision" | "policy" | "financial" | "communication" | "handover" | "other";
     record_date?: string | null;
     file_url?: string | null;
     content?: string | null;
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
   handovers: {
    Row: {
     id: string;
     session: string;
     handing_over_from: string | null;
     handing_over_to: string | null;
     handover_date: string | null;
     projects_summary: string | null;
     financial_status: string | null;
     contact_list: Json | null;
     notes: string | null;
     status: "draft" | "pending" | "completed" | "archived";
     created_by: string | null;
     created_at: string;
     updated_at: string;
    };
    Insert: {
     id?: string;
     session: string;
     handing_over_from?: string | null;
     handing_over_to?: string | null;
     handover_date?: string | null;
     projects_summary?: string | null;
     financial_status?: string | null;
     contact_list?: Json | null;
     notes?: string | null;
     status?: "draft" | "pending" | "completed" | "archived";
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
    Update: {
     id?: string;
     session?: string;
     handing_over_from?: string | null;
     handing_over_to?: string | null;
     handover_date?: string | null;
     projects_summary?: string | null;
     financial_status?: string | null;
     contact_list?: Json | null;
     notes?: string | null;
     status?: "draft" | "pending" | "completed" | "archived";
     created_by?: string | null;
     created_at?: string;
     updated_at?: string;
    };
   };
  };
  Views: {
   [key: string]: never;
  };
  Functions: {
   [key: string]: never;
  };
  Enums: {
   [key: string]: never;
  };
  CompositeTypes: {
   [key: string]: never;
  };
 };
}

// Export commonly used types for convenience
export type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
export type MemberUpdate = Database["public"]["Tables"]["members"]["Update"];
export type VolunteerInsert = Database["public"]["Tables"]["volunteers"]["Insert"];
export type VolunteerUpdate = Database["public"]["Tables"]["volunteers"]["Update"];
export type ProgrammeInsert = Database["public"]["Tables"]["programmes"]["Insert"];
export type ProgrammeUpdate = Database["public"]["Tables"]["programmes"]["Update"];
export type BeneficiaryInsert = Database["public"]["Tables"]["beneficiaries"]["Insert"];
export type BeneficiaryUpdate = Database["public"]["Tables"]["beneficiaries"]["Update"];
export type ExecutiveInsert = Database["public"]["Tables"]["executives"]["Insert"];
export type ExecutiveUpdate = Database["public"]["Tables"]["executives"]["Update"];
export type TestimonialInsert = Database["public"]["Tables"]["testimonials"]["Insert"];
export type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];
export type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];
export type NewsUpdate = Database["public"]["Tables"]["news"]["Update"];
export type MediaInsert = Database["public"]["Tables"]["media"]["Insert"];
export type MediaUpdate = Database["public"]["Tables"]["media"]["Update"];
export type ContentInsert = Database["public"]["Tables"]["contents"]["Insert"];
export type ContentUpdate = Database["public"]["Tables"]["contents"]["Update"];
export type AdminMfaInsert = Database["public"]["Tables"]["admin_mfa"]["Insert"];
export type AdminMfaUpdate = Database["public"]["Tables"]["admin_mfa"]["Update"];
export type AdminPasskeyInsert = Database["public"]["Tables"]["admin_passkeys"]["Insert"];
export type MfaRecoveryCodesInsert = Database["public"]["Tables"]["mfa_recovery_codes"]["Insert"];
export type FooterSectionInsert = Database["public"]["Tables"]["footer_sections"]["Insert"];
export type FooterSectionUpdate = Database["public"]["Tables"]["footer_sections"]["Update"];
export type FooterLinkInsert = Database["public"]["Tables"]["footer_links"]["Insert"];
export type FooterLinkUpdate = Database["public"]["Tables"]["footer_links"]["Update"];
export type SocialLinkInsert = Database["public"]["Tables"]["social_links"]["Insert"];
export type SocialLinkUpdate = Database["public"]["Tables"]["social_links"]["Update"];
export type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type EventFormInsert = Database["public"]["Tables"]["event_forms"]["Insert"];
export type EventFormUpdate = Database["public"]["Tables"]["event_forms"]["Update"];
export type FormFieldInsert = Database["public"]["Tables"]["form_fields"]["Insert"];
export type FormFieldUpdate = Database["public"]["Tables"]["form_fields"]["Update"];
export type FormResponseInsert = Database["public"]["Tables"]["form_responses"]["Insert"];
export type FormResponseUpdate = Database["public"]["Tables"]["form_responses"]["Update"];
export type MeetingMinuteInsert = Database['public']['Tables']['meeting_minutes']['Insert'];
export type MeetingMinuteUpdate = Database['public']['Tables']['meeting_minutes']['Update'];
export type MeetingActionItemInsert = Database['public']['Tables']['meeting_action_items']['Insert'];
export type MeetingActionItemUpdate = Database['public']['Tables']['meeting_action_items']['Update'];
export type ProposalVoteInsert = Database['public']['Tables']['proposal_votes']['Insert'];
export type ProposalVoteUpdate = Database['public']['Tables']['proposal_votes']['Update'];
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert'];
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update'];
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert'];
export type ProposalUpdate = Database['public']['Tables']['proposals']['Update'];
export type RecordInsert = Database['public']['Tables']['records']['Insert'];
export type RecordUpdate = Database['public']['Tables']['records']['Update'];
export type HandoverInsert = Database['public']['Tables']['handovers']['Insert'];
export type HandoverUpdate = Database['public']['Tables']['handovers']['Update'];
