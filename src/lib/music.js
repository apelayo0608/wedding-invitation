export async function startInvitationMusic(audio) {
  if (!audio?.src) return false;
  try {
    audio.muted = false;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export function playMusicThenOpen(audio, openInvitation) {
  const playback = startInvitationMusic(audio);
  openInvitation();
  return playback;
}
