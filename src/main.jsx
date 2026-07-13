import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, CalendarDays, Check, ChevronDown, ExternalLink, Gift, Heart, MapPin, Music2, Pause, Play, Users, Volume2, VolumeX } from 'lucide-react';
import { adminLogin, changeAdminPassword, deleteAdminRsvp, exportAdminRsvps, getAdminRsvps, getAdminSession, getPublicEvent, saveAdminEvent, saveAdminSponsors, submitRsvp, uploadAdminFile, validatePasswordChange } from './api.js';
import { normalizeContact, validateRsvp } from './lib/rsvp.js';
import { isValidMapEmbedUrl } from './lib/maps.js';
import { playMusicThenOpen, startInvitationMusic } from './lib/music.js';
import './styles.css';

const FALLBACK_EVENT = {
  couple: { bride: 'Kathreen', groom: 'Lawrence', date: '2026-10-23T13:30:00+08:00', timezone: 'Asia/Manila' },
  rsvpDeadline: '2026-09-30T23:59:59+08:00',
  maxCompanions: 5,
  ceremony: { name: 'Parroquia Del Espiritu Santo', address: 'San Luis, Tarlac City', mapsUrl: 'https://maps.app.goo.gl/NsMSXusnMtRDSasY9', embedUrl: '' },
  reception: { name: 'Sun Garden Hotel', address: 'Brgy. Sto. Cristo, Aquino Subd., Tarlac City', mapsUrl: 'https://maps.app.goo.gl/qTZtBmV5DMJgWH1J9', embedUrl: '' },
  attire: 'Semi-formal attire in shades of brown, beige, khaki, and other earth tones.',
  giftNote: 'Your presence is the only gift we need. Should you wish to give, a monetary gift would be appreciated.',
  galleryUrl: '',
  galleryPublished: false,
  musicUrl: '',
  sponsors: [
    { title: 'Principal Sponsors', names: ['Mr. Danilo S. Hermogenes', 'Mr. Gerardo S. Domingo', 'Mr. Arnel S. Vitug', 'Mr. Celedonio S. Roberto', 'Mr. Lauro A.D. Puno', 'Mr. Gerardo Navarro', 'Mr. Jose V. Bautista', 'Mr. Hilario C. Olveña II', 'Mrs. Edna E. Angeles', 'Mrs. Jocelyn S. Caraang', 'Mrs. Marissa M. David', 'Mrs. Melissa D.C. Abad', 'Mrs. Myrna J.D.C. Puno', 'Mrs. Roselyn V. Navarro', 'Mrs. Sheryl B. Martin', 'Mrs. Annchiche-Lyn M. Olveña'] },
    { title: 'Matron of Honor', names: ['Remy Joy B. Bumanlag'] },
    { title: 'Best Man', names: ['Jan Nikko Montemayor'] },
    { title: 'Secondary Sponsors', names: ['Jasmin B. Monsalve', 'Ma. Angela C. Ocampo', 'Lloyd Arsid S.D. Gayla', 'Jacob Freud N. Salonga', 'Lorenza Genevieve B. Olveña', 'Shara Marie D.R. Baun', 'Mark Daryl B. Bustos', 'Carl Eugene D.C. Bansil', 'Donnita Anne D.C. Roberto', 'Marielle R. Sanqui', 'Nico', 'Eugene Dave B. Singque'] },
    { title: 'Ring Bearer', names: ['Jakiro Rennzel D.L. Dela Cruz'] },
    { title: 'Bible Bearer', names: ['Marion Jared R. Dung'] },
    { title: 'Coin Bearer', names: ['Lecyan Juan B. Florano'] },
    { title: 'Flower Girls', names: ['Samantha Lorraine O. Dasig', 'Mickyla Jade R. Dung', 'Jean Arabella F. Montemayor'] },
  ],
};

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }).format(new Date(value));
}

function Countdown({ target }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(target) - Date.now()));
  useEffect(() => { const timer = setInterval(() => setRemaining(Math.max(0, new Date(target) - Date.now())), 1000); return () => clearInterval(timer); }, [target]);
  const values = useMemo(() => { const total = Math.floor(remaining / 1000); return [Math.floor(total / 86400), Math.floor((total % 86400) / 3600), Math.floor((total % 3600) / 60), total % 60]; }, [remaining]);
  return <div className="countdown" aria-label="Countdown to the wedding">{values.map((value, index) => <div className="countdown-item" key={index}><strong>{String(value).padStart(2, '0')}</strong><span>{['days', 'hours', 'minutes', 'seconds'][index]}</span></div>)}</div>;
}

function Section({ children, className = '', delay = 0, ...sectionProps }) {
  const reduce = useReducedMotion();
  return <motion.section {...sectionProps} className={`section ${className}`} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={reduce ? {} : { opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay }}>{children}</motion.section>;
}

function OpenInvitation({ onOpen, event }) {
  return <motion.div className="welcome-screen" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.6 }}>
    <div className="welcome-photo" />
    <div className="welcome-card">
      <span className="eyebrow">The wedding of</span>
      <h1>{event.couple.bride} <em>&</em> {event.couple.groom}</h1>
      <p className="script welcome-date">{formatDate(event.couple.date)}</p>
      <p className="welcome-note">“For His light, we found each other.”</p>
      <button className="button button-dark" onClick={onOpen}><Heart size={16} /> Open invitation</button>
    </div>
  </motion.div>;
}

function MusicControl({ src, audioRef, playing, onPlayingChange }) {
  const [muted, setMuted] = useState(false);
  const toggle = async () => { if (!audioRef.current || !src) return; if (playing) { audioRef.current.pause(); onPlayingChange(false); } else { onPlayingChange(await startInvitationMusic(audioRef.current)); } };
  return <div className="music-control"><button onClick={toggle} aria-label={src ? (playing ? 'Pause wedding music' : 'Play wedding music') : 'Wedding music is not configured'} disabled={!src}>{playing ? <Pause size={16} /> : <Play size={16} />}</button><button onClick={() => { if (audioRef.current) audioRef.current.muted = !muted; setMuted(!muted); }} aria-label={muted ? 'Unmute wedding music' : 'Mute wedding music'} disabled={!src}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>{src && <span>{playing ? 'Now playing' : 'Music'}</span>}</div>;
}

function VenueCard({ venue, type }) {
  const embed = isValidMapEmbedUrl(venue.embedUrl);
  return <article className="venue-card">
    <div className="venue-map">{embed ? <iframe src={venue.embedUrl} title={`${type} map`} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" /> : <div className="map-placeholder"><MapPin size={24} /><span>Map preview coming soon</span></div>}</div>
    <div className="venue-content"><span className="eyebrow">{type}</span><h3>{venue.name || 'Venue details coming soon'}</h3><p>{venue.address || 'The couple will share the location details here.'}</p>{venue.mapsUrl && <a className="text-link" href={venue.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={14} /></a>}</div>
  </article>;
}

function SponsorList({ groups }) {
  return <div className="sponsor-grid">{groups.map((group) => <div className="sponsor-group" key={group.title}><h3>{group.title}</h3><div className="sponsor-names">{group.names.map((name) => <span key={name}>{name}</span>)}</div></div>)}</div>;
}

function RsvpForm({ event }) {
  const [form, setForm] = useState({ guestName: '', contactNumber: '', attendance: '', companions: [] });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [duplicate, setDuplicate] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const addCompanion = () => update('companions', [...form.companions, '']);
  const submit = async (replace = false) => {
    const result = validateRsvp(form, { maxCompanions: event.maxCompanions, deadline: event.rsvpDeadline });
    if (!result.valid) { setErrors(result.errors); return; }
    setErrors({}); setState('loading');
    try { await submitRsvp(result.data, replace); setState('success'); setDuplicate(false); } catch (error) { if (error.code === 'RSVP_EXISTS' && !replace) { setDuplicate(true); setState('idle'); } else { setErrors({ form: error.message }); setState('idle'); } }
  };
  if (state === 'success') return <div className="form-success"><div className="success-icon"><Check /></div><h3>Thank you, {form.guestName}.</h3><p>Your RSVP has been saved. We can’t wait to celebrate with you.</p><button className="button button-outline" onClick={() => { setForm({ guestName: '', contactNumber: '', attendance: '', companions: [] }); setState('idle'); }}>Submit another response</button></div>;
  return <form className="rsvp-form" onSubmit={(e) => { e.preventDefault(); submit(false); }} noValidate>
    <div className="form-intro"><span className="eyebrow">Kindly RSVP by {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(event.rsvpDeadline))}</span><h2>Will you celebrate with us?</h2></div>
    {errors.form && <p className="form-error">{errors.form}</p>}
    <label>Guest name<input value={form.guestName} onChange={(e) => update('guestName', e.target.value)} placeholder="Your full name" />{errors.guestName && <small>{errors.guestName}</small>}</label>
    <label>Contact number<input value={form.contactNumber} onChange={(e) => update('contactNumber', e.target.value)} placeholder="09XX XXX XXXX" inputMode="tel" />{errors.contactNumber && <small>{errors.contactNumber}</small>}</label>
    <fieldset><legend>Will you be joining us?</legend><div className="choice-row"><label className="choice"><input type="radio" name="attendance" checked={form.attendance === 'attending'} onChange={() => update('attendance', 'attending')} /> <span>Joyfully attending</span></label><label className="choice"><input type="radio" name="attendance" checked={form.attendance === 'declined'} onChange={() => { update('attendance', 'declined'); update('companions', []); }} /> <span>Unable to attend</span></label></div>{errors.attendance && <small>{errors.attendance}</small>}</fieldset>
    {form.attendance === 'attending' && <div className="companions"><div className="field-heading"><label>Companions <span>(optional, up to {event.maxCompanions})</span></label><button type="button" className="icon-button" onClick={addCompanion} disabled={form.companions.length >= event.maxCompanions}><Users size={16} /> Add guest</button></div>{form.companions.map((name, index) => <input key={index} value={name} onChange={(e) => update('companions', form.companions.map((item, i) => i === index ? e.target.value : item))} placeholder={`Companion ${index + 1} name`} />)}{errors.companions && <small>{errors.companions}</small>}</div>}
    {duplicate && <div className="duplicate-notice"><p>We already have an RSVP for this number. Replace it with this response?</p><button type="button" className="button button-dark" onClick={() => submit(true)}>Update my RSVP</button></div>}
    <button className="button button-dark submit-button" type="submit" disabled={state === 'loading'}>{state === 'loading' ? 'Saving…' : 'Send RSVP'} <ArrowDown size={16} className="arrow-up" /></button>
  </form>;
}

function Invitation({ event }) {
  const [liveEvent, setLiveEvent] = useState(event);
  const [opened, setOpened] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = React.useRef(null);
  useEffect(() => { getPublicEvent().then((data) => { if (data) setLiveEvent((current) => ({ ...current, ...data })); }); }, []);
  const openInvitation = () => { playMusicThenOpen(musicRef.current, () => setOpened(true)).then(setMusicPlaying); };
  return <div className="app-shell"><audio ref={musicRef} src={liveEvent.musicUrl || undefined} loop aria-hidden="true" /><AnimatePresence>{!opened && <OpenInvitation key="welcome" event={liveEvent} onOpen={openInvitation} />}</AnimatePresence>{opened && <><header className="site-nav"><a href="#top" className="brand">K<span>&</span>L</a><nav><a href="#details">Details</a><a href="#entourage">Entourage</a><a href="#rsvp">RSVP</a></nav><MusicControl src={liveEvent.musicUrl} audioRef={musicRef} playing={musicPlaying} onPlayingChange={setMusicPlaying} /></header><main id="top">
    <section className="hero section"><div className="hero-image" /><div className="hero-copy"><span className="eyebrow">The wedding of</span><h1>{liveEvent.couple.bride}<em>&</em>{liveEvent.couple.groom}</h1><p className="script">{formatDate(liveEvent.couple.date)}</p><div className="hero-rule" /><p>For His light, we found each other.</p><a href="#details" className="scroll-cue"><ChevronDown size={18} /> Explore the invitation</a></div></section>
    <Section className="intro-section"><span className="eyebrow">A day made beautiful by love</span><h2>We found our way<br /><em>to forever.</em></h2><p className="lede">Two hearts, one promise, and a lifetime of memories waiting to begin. We would be honored to have you with us as we say “I do.”</p><Countdown target={liveEvent.couple.date} /></Section>
    <Section id="details" className="details-section"><div className="section-heading"><span className="eyebrow">Save the date</span><h2>Meet us where<br /><em>forever begins.</em></h2></div><div className="venue-grid"><VenueCard type="Wedding ceremony" venue={liveEvent.ceremony} /><VenueCard type="Wedding reception" venue={liveEvent.reception} /></div></Section>
    <Section className="quote-section"><div className="quote-mark">“</div><blockquote>Love is not just looking at each other, it’s looking in the same direction.</blockquote><span className="eyebrow">— Antoine de Saint-Exupéry</span></Section>
    <Section id="entourage" className="entourage-section"><div className="section-heading centered"><span className="eyebrow">With joyful hearts</span><h2>Our <em>entourage</em></h2><p>We are grateful for the people who have guided, loved, and supported us.</p></div><SponsorList groups={liveEvent.sponsors} /></Section>
    <Section className="attire-section"><div className="attire-copy"><span className="eyebrow">Guests are kindly encouraged</span><h2>Dress in <em>earth tones.</em></h2><p>{liveEvent.attire}</p><div className="swatches"><span style={{ background: '#522000' }} /><span style={{ background: '#463932' }} /><span style={{ background: '#965c41' }} /><span style={{ background: '#c5b59e' }} /><span style={{ background: '#71462f' }} /></div></div><div className="attire-photo" /></Section>
    <Section className="gift-section"><Gift size={26} /><span className="eyebrow">Gift information</span><h2>Your presence<br /><em>is the only gift we need.</em></h2><p>{liveEvent.giftNote}</p></Section>
    <Section className="gallery-section"><div className="gallery-card"><div className="gallery-icon"><Heart size={22} /></div><span className="eyebrow">Wedding memories</span><h2>Let’s relive<br /><em>the happy moments.</em></h2><p>We’ll share the photographs from our special day here.</p>{liveEvent.galleryPublished && liveEvent.galleryUrl ? <a className="button button-dark" href={liveEvent.galleryUrl} target="_blank" rel="noreferrer">View wedding photos <ExternalLink size={16} /></a> : <span className="coming-soon">Photos coming soon</span>}</div></Section>
    <Section id="rsvp" className="rsvp-section"><div className="rsvp-panel"><div className="rsvp-side"><span className="eyebrow">We hope you can join us</span><h2>Say <em>yes</em> to a day of love.</h2><p>Kindly let us know if you’ll be there to celebrate this new chapter with us.</p><div className="rsvp-details"><span><CalendarDays size={18} /> {formatDate(liveEvent.couple.date)}</span><span><MapPin size={18} /> Tarlac City, Philippines</span></div></div><RsvpForm event={liveEvent} /></div></Section>
    <footer><div className="brand">K<span>&</span>L</div><p>With love, Kathreen & Lawrence</p><span className="eyebrow">October 23, 2026</span></footer>
  </main></>}</div>;
}

function AdminLogin({ onAuthenticated }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return <div className="admin-login"><div className="admin-login-card"><div className="brand">K<span>&</span>L</div><span className="eyebrow">Private admin area</span><h1>Welcome back.</h1><p>Sign in to update the invitation and manage guest responses.</p><form onSubmit={async (e) => { e.preventDefault(); setLoading(true); setError(''); try { await adminLogin(credentials); onAuthenticated(); } catch (loginError) { setError(loginError.message); } finally { setLoading(false); } }}><label>Username<input value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} autoComplete="username" /></label><label>Password<input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} autoComplete="current-password" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button></form><a className="back-link login-back" href="/">← View invitation</a></div></div>;
}

function Admin() {
  const [auth, setAuth] = useState('checking');
  const [tab, setTab] = useState('overview');
  const [saved, setSaved] = useState(false);
  const [event, setEvent] = useState(FALLBACK_EVENT);
  const [rsvps, setRsvps] = useState([]);
  useEffect(() => { getAdminSession().then(() => { setAuth('authenticated'); getPublicEvent().then((data) => { if (data) setEvent((current) => ({ ...current, ...data })); }).catch(() => {}); getAdminRsvps().then(setRsvps).catch(() => {}); }).catch(() => setAuth('login')); }, []);
  if (auth === 'checking') return <div className="admin-loading">Loading admin area…</div>;
  if (auth === 'login') return <AdminLogin onAuthenticated={() => { setAuth('authenticated'); getAdminRsvps().then(setRsvps).catch(() => {}); }} />;
  const updateEvent = (key, value) => setEvent((current) => ({ ...current, [key]: value }));
  const downloadCsv = async () => { try { await exportAdminRsvps(); return; } catch {} const rows = [['Guest name', 'Contact', 'Attendance', 'Companions', 'Updated'], ...rsvps.map((item) => [item.guestName, item.contactNumber, item.attendance, item.companions?.join('; '), item.updatedAt])]; const blob = new Blob([rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'kathreen-lawrence-rsvps.csv'; link.click(); URL.revokeObjectURL(url); };
  const downloadExcel = async () => { try { await exportAdminRsvps(); } catch { downloadCsv(); } };
  const removeRsvp = async (id) => { if (!window.confirm('Remove this RSVP?')) return; try { await deleteAdminRsvp(id); setRsvps((current) => current.filter((item) => item.id !== id)); } catch (error) { window.alert(error.message); } };
  const attending = rsvps.filter((item) => item.attendance === 'attending').length;
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="brand">K<span>&</span>L</div><p className="admin-label">Wedding admin</p><nav>{[['overview', 'Overview'], ['event', 'Event settings'], ['sponsors', 'Sponsors'], ['rsvps', 'RSVP list'], ['account', 'Account']].map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav><a href="/" className="back-link">← View invitation</a></aside><main className="admin-main"><div className="admin-topbar"><div><span className="eyebrow">Kathreen & Lawrence</span><h1>{tab === 'overview' ? 'Good morning, admin.' : tab === 'event' ? 'Event settings' : tab === 'sponsors' ? 'Sponsors & entourage' : tab === 'account' ? 'Account security' : 'RSVP list'}</h1></div><div className="admin-status"><span className="status-dot" /> Connected to PHP API</div></div>{tab === 'overview' && <><div className="admin-stats"><div><span>Attending</span><strong>{attending}</strong></div><div><span>Declined</span><strong>{rsvps.filter((item) => item.attendance === 'declined').length}</strong></div><div><span>Companions</span><strong>{rsvps.reduce((total, item) => total + (item.companions?.length || 0), 0)}</strong></div><div><span>Expected guests</span><strong>{attending + rsvps.reduce((total, item) => total + (item.companions?.length || 0), 0)}</strong></div></div><div className="admin-card welcome-admin"><span className="eyebrow">Your next step</span><h2>Make the invitation yours.</h2><p>Add your venue map embeds, music, and Google Drive album link from Event settings. The public invitation will update as soon as you publish.</p><button className="button button-dark" onClick={() => setTab('event')}>Open event settings <ArrowDown size={16} className="arrow-up" /></button></div></>}{tab === 'event' && <EventSettings event={event} updateEvent={updateEvent} saved={saved} onSave={async () => { try { await saveAdminEvent(event); setSaved(true); setTimeout(() => setSaved(false), 2400); } catch (error) { setSaved(false); window.alert(error.message); } }} />}{tab === 'sponsors' && <SponsorsEditor event={event} setEvent={setEvent} />}{tab === 'rsvps' && <RsvpAdmin rsvps={rsvps} downloadCsv={downloadCsv} />}{tab === 'account' && <PasswordSettings />}</main></div>;
}

function PasswordSettings() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validatePasswordChange(form);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setStatus('idle'); return; }
    setErrors({}); setStatus('loading');
    try {
      await changeAdminPassword(form);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatus('saved');
    } catch (error) {
      setErrors({ ...(error.fields || {}), form: error.message });
      setStatus('error');
    }
  };
  return <div className="admin-card settings-card password-card"><div className="card-heading"><div><span className="eyebrow">Account security</span><h2>Change password</h2></div></div><p className="password-intro">Use a unique password of at least 10 characters. You will stay signed in after updating it.</p><form className="password-form" onSubmit={submit} noValidate><label>Current password<input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} autoComplete="current-password" />{errors.currentPassword && <small className="form-error">{errors.currentPassword}</small>}</label><label>New password<input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} autoComplete="new-password" />{errors.newPassword && <small className="form-error">{errors.newPassword}</small>}</label><label>Confirm new password<input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />{errors.confirmPassword && <small className="form-error">{errors.confirmPassword}</small>}</label>{errors.form && <p className="form-error">{errors.form}</p>}{status === 'saved' && <p className="form-success">Password updated successfully.</p>}<button className="button button-dark" disabled={status === 'loading'}>{status === 'loading' ? 'Updating password…' : 'Update password'}</button></form></div>;
}

function EventSettings({ event, updateEvent, saved, onSave }) {
  const updateVenue = (key, field, value) => updateEvent(key, { ...event[key], [field]: value });
  const [musicUpload, setMusicUpload] = useState({ state: 'idle', message: '' });
  const uploadMusic = async (file) => {
    setMusicUpload({ state: 'uploading', message: 'Uploading music…' });
    try {
      const result = await uploadAdminFile('music', file);
      updateEvent('musicUrl', result.url);
      setMusicUpload({ state: 'success', message: 'Music uploaded and saved.' });
    } catch (error) {
      setMusicUpload({ state: 'error', message: error.message || 'Music could not be uploaded.' });
    }
  };
  return <div className="settings-grid">
    <div className="admin-card settings-card"><div className="card-heading"><div><span className="eyebrow">Core details</span><h2>Wedding day</h2></div></div><div className="two-col"><label>Bride<input value={event.couple.bride} onChange={(e) => updateEvent('couple', { ...event.couple, bride: e.target.value })} /></label><label>Groom<input value={event.couple.groom} onChange={(e) => updateEvent('couple', { ...event.couple, groom: e.target.value })} /></label><label>Date & time<input type="datetime-local" value={event.couple.date.slice(0, 16)} onChange={(e) => updateEvent('couple', { ...event.couple, date: `${e.target.value}:00+08:00` })} /></label><label>RSVP deadline<input type="date" value={event.rsvpDeadline.slice(0, 10)} onChange={(e) => updateEvent('rsvpDeadline', `${e.target.value}T23:59:59+08:00`)} /></label><label>Companion limit<input type="number" min="0" max="20" value={event.maxCompanions} onChange={(e) => updateEvent('maxCompanions', Number(e.target.value))} /></label></div></div>
    <div className="admin-card settings-card"><div className="card-heading"><div><span className="eyebrow">Venue 01</span><h2>Ceremony</h2></div></div><VenueFields venue={event.ceremony} onChange={(field, value) => updateVenue('ceremony', field, value)} /></div>
    <div className="admin-card settings-card"><div className="card-heading"><div><span className="eyebrow">Venue 02</span><h2>Reception</h2></div></div><VenueFields venue={event.reception} onChange={(field, value) => updateVenue('reception', field, value)} /></div>
    <div className="admin-card settings-card"><div className="card-heading"><div><span className="eyebrow">After the wedding</span><h2>Music & memories</h2></div></div><label>Google Drive album link<input value={event.galleryUrl} onChange={(e) => updateEvent('galleryUrl', e.target.value)} placeholder="https://drive.google.com/..." /></label><label className="toggle-row"><input type="checkbox" checked={event.galleryPublished} onChange={(e) => updateEvent('galleryPublished', e.target.checked)} /> Publish the wedding memories button</label><label>Music file<input type="file" accept="audio/mpeg,.mp3" disabled={musicUpload.state === 'uploading'} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadMusic(file); }} /></label><p className="helper">MP3 files up to 15 MB are recommended for broad browser support.</p>{musicUpload.state !== 'idle' && <p className={`upload-status ${musicUpload.state}`} role="status" aria-live="polite">{musicUpload.message}</p>}<label>Attire copy<textarea value={event.attire} onChange={(e) => updateEvent('attire', e.target.value)} /></label><label>Gift note<textarea value={event.giftNote} onChange={(e) => updateEvent('giftNote', e.target.value)} /></label></div>
    <div className="save-bar"><span>{saved ? 'Changes saved.' : 'Save your event settings to the PHP API.'}</span><button className="button button-dark" onClick={onSave}>{saved ? <Check size={16} /> : 'Save event settings'}</button></div>
  </div>;
}

function VenueFields({ venue, onChange }) { const validEmbed = isValidMapEmbedUrl(venue.embedUrl); return <><label>Venue name<input value={venue.name} onChange={(e) => onChange('name', e.target.value)} /></label><label>Address<textarea value={venue.address} onChange={(e) => onChange('address', e.target.value)} /></label><label>Google Maps link<input value={venue.mapsUrl} onChange={(e) => onChange('mapsUrl', e.target.value)} placeholder="https://maps.google.com/..." /></label><label>Google Maps embed URL<input value={venue.embedUrl || ''} onChange={(e) => onChange('embedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." /></label>{venue.embedUrl && !validEmbed && <small className="form-error">Paste the HTTPS URL from Google Maps → Share → Embed a map.</small>}{validEmbed && <iframe className="admin-map-preview" src={venue.embedUrl} title={`${venue.name || 'Venue'} map preview`} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />}</>; }

function SponsorsEditor({ event, setEvent }) { const [saved, setSaved] = useState(false); const updateName = (groupIndex, nameIndex, value) => setEvent((current) => ({ ...current, sponsors: current.sponsors.map((group, index) => index === groupIndex ? { ...group, names: group.names.map((name, itemIndex) => itemIndex === nameIndex ? value : name) } : group) })); return <div className="admin-card sponsor-editor"><div className="card-heading"><div><span className="eyebrow">Entourage</span><h2>Edit sponsor groups</h2></div><button className="button button-dark" onClick={() => setEvent((current) => ({ ...current, sponsors: [...current.sponsors, { title: 'New group', names: [''] }] }))}>Add group</button></div>{event.sponsors.map((group, groupIndex) => <div className="sponsor-edit-group" key={`${group.title}-${groupIndex}`}><input className="group-title" value={group.title} onChange={(e) => setEvent((current) => ({ ...current, sponsors: current.sponsors.map((item, index) => index === groupIndex ? { ...item, title: e.target.value } : item) }))} />{group.names.map((name, nameIndex) => <div className="inline-field" key={nameIndex}><input value={name} onChange={(e) => updateName(groupIndex, nameIndex, e.target.value)} /><button type="button" onClick={() => setEvent((current) => ({ ...current, sponsors: current.sponsors.map((item, index) => index === groupIndex ? { ...item, names: item.names.filter((_, i) => i !== nameIndex) } : item) }))}>×</button></div>)}<button className="text-button" onClick={() => setEvent((current) => ({ ...current, sponsors: current.sponsors.map((item, index) => index === groupIndex ? { ...item, names: [...item.names, ''] } : item) }))}>+ Add name</button></div>)}<div className="save-bar"><span>{saved ? 'Sponsor changes saved.' : 'Save your ordered sponsor groups to the invitation.'}</span><button className="button button-dark" onClick={async () => { try { await saveAdminSponsors(event.sponsors); setSaved(true); setTimeout(() => setSaved(false), 2400); } catch (error) { window.alert(error.message); } }}>{saved ? <Check size={16} /> : 'Save sponsors'}</button></div></div>; }

function RsvpAdmin({ rsvps, downloadCsv }) { return <div className="admin-card rsvp-admin"><div className="card-heading"><div><span className="eyebrow">Guest responses</span><h2>{rsvps.length ? `${rsvps.length} responses` : 'No responses yet'}</h2></div><button className="button button-dark" onClick={downloadCsv}>Export Excel <ExternalLink size={16} /></button></div>{rsvps.length ? <div className="table-wrap"><table><thead><tr><th>Guest</th><th>Contact</th><th>Attendance</th><th>Companions</th><th>Updated</th></tr></thead><tbody>{rsvps.map((item) => <tr key={item.contactNumber}><td>{item.guestName}</td><td>{item.contactNumber}</td><td><span className={`pill ${item.attendance}`}>{item.attendance}</span></td><td>{item.companions?.join(', ') || '—'}</td><td>{item.updatedAt}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Users size={28} /><p>Guest responses will appear here after the first RSVP.</p></div>}</div>; }

function App() { const [event] = useState(FALLBACK_EVENT); return window.location.pathname.startsWith('/admin') ? <Admin /> : <Invitation event={event} />; }

createRoot(document.getElementById('root')).render(<App />);
