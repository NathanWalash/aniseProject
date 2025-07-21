// Define the structure of an Anise (DAO/group) object
export interface Anise {
    id: string;           // Unique identifier for the Anise
    name: string;         // Name of the Anise
    members: number;      // Number of members/contributors
    role: string;         // User's role in this Anise (e.g., Admin, Member)
    created: string;      // Creation date
    status?: string;      // Status (optional, not used)
    description?: string; // Optional: DAO description
}