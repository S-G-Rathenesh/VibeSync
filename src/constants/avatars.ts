export interface AvatarOption {
  id: string;
  name: string;
  image: any;
}

export const AVATARS: AvatarOption[] = [
  {
    id: 'avatar_01',
    name: 'Vibe Neon',
    image: require('../../assets/avatars/vibesync_avatar_01.png'),
  },
  {
    id: 'avatar_02',
    name: 'Cyber Beats',
    image: require('../../assets/avatars/vibesync_avatar_02.png'),
  },
  {
    id: 'avatar_03',
    name: 'Electro Glow',
    image: require('../../assets/avatars/vibesync_avatar_03.png'),
  },
  {
    id: 'avatar_04',
    name: 'Synthwave',
    image: require('../../assets/avatars/vibesync_avatar_04.png'),
  },
  {
    id: 'avatar_05',
    name: 'Bass Drop',
    image: require('../../assets/avatars/vibesync_avatar_05.png'),
  },
  {
    id: 'avatar_06',
    name: 'Retrowave',
    image: require('../../assets/avatars/vibesync_avatar_06.png'),
  },
  {
    id: 'avatar_07',
    name: 'Pulse Wave',
    image: require('../../assets/avatars/vibesync_avatar_07.png'),
  },
  {
    id: 'avatar_08',
    name: 'Acoustic Soul',
    image: require('../../assets/avatars/vibesync_avatar_08.png'),
  },
  {
    id: 'avatar_09',
    name: 'Groove Master',
    image: require('../../assets/avatars/vibesync_avatar_09.png'),
  },
  {
    id: 'avatar_10',
    name: 'Chill Streamer',
    image: require('../../assets/avatars/vibesync_avatar_10.png'),
  },
];

export const getAvatarSource = (photoUrl?: string | null) => {
  if (!photoUrl) return AVATARS[0].image;
  const match = AVATARS.find((a) => a.id === photoUrl);
  if (match) return match.image;
  if (photoUrl.startsWith('http')) return { uri: photoUrl };
  return AVATARS[0].image;
};
