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
