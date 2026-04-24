export const generateNexusId = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars like I, O, 0, 1
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `NXS-${result}`;
};

export const getStableNexusId = (memberId: string): string => {
  // Use a simple hash-like method to get a deterministic 4-character ID from a UID
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = ((hash << 5) - hash) + memberId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  hash = Math.abs(hash);
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(hash % characters.length);
    hash = Math.floor(hash / characters.length);
  }
  
  return `NXS-${result}`;
};
