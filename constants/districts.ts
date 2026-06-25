// Sierra Leone Districts
export const districts = [
  'Western Area Urban',
  'Western Area Rural',
  'Bombali',
  'Kambia',
  'Kono',
  'Koinadugu',
  'Port Loko',
  'Tonkolili',
  'Bo',
  'Bonthe',
  'Moyamba',
  'Pujehun',
  'Kenema',
  'Kailahun',
] as const;

export type District = typeof districts[number];
