export const getEcologyAvatar = (userName) => {
  const avatars = [
    '/images/ecology-leaf.jpg',
    '/images/ecology-sprout.jpg',
    '/images/ecology-earth.jpg',
    '/images/ecology-recycle.jpg'
  ];
  if (!userName) return avatars[0];
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatars.length;
  return avatars[index];
};
