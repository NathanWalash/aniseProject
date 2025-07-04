// Import the mock data from the JSON file
import myAnises from '../data/myAnises.json';
// Import the Anise type for type safety
import { Anise } from '../screens/myanises/types/myAnise';

// Function to get the list of Anises (mock for now, API call later)
export function getMyAnises(): Anise[] {
  // Cast the imported data to the Anise[] type
  // In the future, replace this with an API call
  return myAnises as Anise[];
}