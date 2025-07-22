// Define the structure of an Anise (DAO/group) object
export interface Anise {
  id: string;
  name: string;
  description: string;
  members: string | number;
  role: string;
  created: string;
  templateId?: string;
  intendedAudience?: string;
  mandate?: string;
  metadata?: {
    name: string;
    description: string;
    intendedAudience: string;
    mandate: string;
    isPublic: boolean;
    templateId: string;
  };
}