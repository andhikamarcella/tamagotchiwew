export interface PetRequest { text: string; targetAction: string; reward: number; }
export function defaultPetRequest(name: string): PetRequest {
  return { text: `${name} wants favorite care today!`, targetAction: 'feed', reward: 25 };
}
