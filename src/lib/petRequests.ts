export interface PetRequest { text: string; targetAction: string; reward: number; }
const requests = [
  ['I want Pixel Fish!', 'feed', 18],
  ['Can we play Ball Toss?', 'play', 16],
  ['I feel dirty...', 'clean', 14],
  ['I want to walk in the Forest!', 'walk', 20],
] as const;
export function defaultPetRequest(name: string): PetRequest { const [text, targetAction, reward] = requests[Math.abs(name.length) % requests.length]; return { text: `${name}: ${text}`, targetAction, reward }; }
