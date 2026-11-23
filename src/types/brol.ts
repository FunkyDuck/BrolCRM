export type ProspectStatus =
  | 'to_contact'
  | 'contacted'
  | 'in_discussion'
  | 'signed'
  | 'archived';

export type InteractionType = 'email' | 'call' | 'meeting' | 'note';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  summary: string;
}

export interface FollowupEntry {
  id: string;
  date: string;
  followupDate: string | null;
}

export interface Prospect {
  id: string;
  companyName: string;
  source: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  addressStreet: string;
  postalCode: string;
  city: string;
  country: string;
  tags: string[];
  website: string;
  status: ProspectStatus;
  nextFollowup: string | null;
  techPainPoint: string;
  notes: string;
  interactions: Interaction[];
  followupHistory: FollowupEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface BrolDatabase {
  version: number;
  lastModified: string;
  prospects: Prospect[];
}
