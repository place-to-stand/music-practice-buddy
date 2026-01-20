# BandBrain MVP - Development Progress

> **How to use:** Check off items as they're completed. Update the "Last Updated" date when making changes.
>
> **Last Updated:** January 20, 2026

---

## Overall Progress

| Phase | Status | Items Done | Total |
|-------|--------|------------|-------|
| 1. Foundation & Auth | ✅ Complete | 6 | 6 |
| 2. Bands & Collaboration | ✅ Complete | 4 | 4 |
| 3. Songs & Files | ✅ Complete | 6 | 6 |
| 4. Audio Features | ⚪ Not Started | 0 | 4 |
| 5. Tab Rendering | ⚪ Not Started | 0 | 3 |
| 6. Gear Settings | ⚪ Not Started | 0 | 5 |
| 7. Training Tools | ⚪ Not Started | 0 | 5 |
| 8. Recording Projects | ⚪ Not Started | 0 | 5 |
| 9. Setlists | ⚪ Not Started | 0 | 4 |
| 10. Practice & Export | ⚪ Not Started | 0 | 3 |
| 11. Polish | ⚪ Not Started | 0 | 4 |

**Legend:** ✅ Complete | 🟡 In Progress | ⚪ Not Started

---

## Phase 1: Foundation & Auth
**Dependencies:** None (starting point)
**Spec:** [AUTH.md](./AUTH.md)

- [x] Project setup (Next.js, Convex, Tailwind, shadcn/ui)
- [x] Google OAuth authentication via Convex Auth
- [x] User model with storage tracking
- [x] Basic error boundary
- [x] PostHog integration
- [x] Responsive layout shell (mobile + desktop)

**Notes:**
- Next.js 16 with React 19 and Tailwind CSS 4 (CSS-first config)
- Convex schema fully defined, requires `npx convex dev` to deploy and generate types
- shadcn/ui components installed: button, card, dialog, form, input, label, sonner, avatar, badge, separator, sheet, dropdown-menu, select, textarea, tabs, table, progress, slider, checkbox
- PostHog provider with manual pageview tracking
- Mobile-responsive navigation with Sheet sidebar on mobile

---

## Phase 2: Bands & Collaboration
**Dependencies:** Phase 1 (need auth and users)
**Spec:** [SCHEMA.md](./SCHEMA.md)

- [x] Band CRUD with soft deletes
- [x] Band membership model
- [x] Shareable invite codes for joining bands
- [x] Band member list view

**Notes:**
- Created `convex/bands.ts` with queries (listMyBands, get, getByInviteCode) and mutations (create, update, softDelete, regenerateInviteCode)
- Created `convex/bandMemberships.ts` with queries (listByBand, getMyMembership) and mutations (join, leave, updateInstruments)
- 6-character invite codes using safe characters (no 0/O/1/I/L confusion)
- Users can rejoin bands they previously left (clears `leftAt`, preserves history)
- Last member cannot leave - must delete band instead
- Only band creator can delete the band
- Uses `getAuthUserId` from `@convex-dev/auth/server` for reliable user lookup
- UI components: BandCard, BandList, CreateBandDialog, JoinBandDialog, InviteCodeDisplay, MemberCard, MemberList, InstrumentPicker, LeaveBandDialog

---

## Phase 3: Songs & Files
**Dependencies:** Phase 2 (songs belong to bands)
**Spec:** [SCHEMA.md](./SCHEMA.md), [FILES.md](./FILES.md)

- [x] Song CRUD with 4-level practice status (new → learning → solid → performance_ready)
- [x] File upload with size validation (100MB max)
- [x] Per-user storage quota tracking (2GB limit)
- [x] Upload rate limiting (50/hour)
- [x] External URL support (Dropbox, YouTube, Bandcamp, Google Drive)
- [x] Song sections structure

**Notes:**
- Created `convex/songs.ts` with queries (listByBand, get) and mutations (create, update, updatePracticeStatus, softDelete)
- Created `convex/files.ts` with queries (listBySong, getStorageUsage) and mutations (generateUploadUrl, saveSongFile, saveExternalUrl, setPrimary, softDelete, updateMetadata)
- Created `convex/songSections.ts` with queries (listBySong, listByInstrument, get) and mutations (create, update, reorder, softDelete)
- Rate limiting uses sliding window approach (50 uploads/hour per user)
- Storage quota tracking updates on file upload and reclaims space on delete
- External URL auto-detection for YouTube, YouTube Music, Dropbox, Bandcamp, Google Drive
- YouTube metadata auto-fetch via oEmbed API (title extraction, artist parsing)
- YouTube Music URLs auto-set file type to "audio", regular YouTube to "video"
- File types: audio, video, chart, tab, gp, stem, other
- useFileUpload hook with XHR progress tracking
- UI components: SongCard, SongList, CreateSongDialog, PracticeStatusBadge, FileUploadDropzone, ExternalUrlDialog, SongFilesSection
- SongCard displays badges for all file types: Audio, Video, Chart, Tab (with fallback to "X files" for unmatched types)
- FileUploadDropzone supports drag overlay mode (covers parent card, appears only on drag)
- Storage quota display moved to user dropdown in DashboardNav (global, not per-song)
- External service labels properly formatted for display (e.g., "google_drive" → "Google Drive")
- File editing: inline edit for display name and variant, delete confirmation dialog
- Download button for uploaded files (not external URLs)
- Pages: /bands/[bandId]/songs (song list with status tabs), /bands/[bandId]/songs/[songId] (song detail with files)
- BandCard now links to songs page instead of members page
- shadcn/ui alert-dialog added for delete confirmations

---

## Phase 4: Audio Features
**Dependencies:** Phase 3 (need uploaded files)
**Spec:** [FILES.md](./FILES.md)

- [ ] Waveform pre-computation on audio upload
- [ ] wavesurfer.js integration for audio playback
- [ ] Essentia.js audio analysis (tempo/key detection as defaults)
- [ ] Song duration detection

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 5: Tab Rendering
**Dependencies:** Phase 3 (need file uploads for .gp files)
**Spec:** [UI.md](./UI.md)

- [ ] AlphaTab lazy loading
- [ ] Guitar Pro file rendering (.gp, .gpx, .gp5)
- [ ] MIDI playback from tabs

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 6: Gear Settings
**Dependencies:** Phase 3 (gear settings attach to song sections)
**Spec:** [GEAR.md](./GEAR.md)

- [ ] User-defined gear pieces (pedals, synths, amps)
- [ ] Visual knob dial UI (position-based, 7-5 o'clock style)
- [ ] Editable knob labels
- [ ] Synth patch storage with override tracking
- [ ] Per-section gear configurations

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 7: Training Tools
**Dependencies:** Phase 3 (metronome links to songs)
**Spec:** [TRAINING.md](./TRAINING.md)

- [ ] Metronome with song linking (auto-configure from song tempo/time)
- [ ] Drone player (auto-configure from song key)
- [ ] Chord progression player
- [ ] Preset drum beats under chord progressions (rock, pop, jazz, shuffle, ballad)
- [ ] Drum sample upload support

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 8: Recording Projects
**Dependencies:** Phase 3 (recording projects reference songs)
**Spec:** [RECORDING.md](./RECORDING.md)

- [ ] Recording project CRUD
- [ ] Recording songs within projects
- [ ] Tracking grid (instrument × song status matrix)
- [ ] Bounce uploads with waveform
- [ ] Timestamped comments on bounces

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 9: Setlists
**Dependencies:** Phase 6 (need gear settings for deltas)
**Spec:** [SETLISTS.md](./SETLISTS.md)

- [ ] Setlist CRUD with duration calculation
- [ ] Starting gear settings (pre-show state)
- [ ] Computed gear deltas between songs
- [ ] Transition notes between songs

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 10: Practice & Export
**Dependencies:** Phase 3 (practice logs reference songs)
**Spec:** [SCHEMA.md](./SCHEMA.md)

- [ ] Practice session logging (date, duration, songs, notes)
- [ ] Data export (full JSON dump)
- [ ] Storage usage display

**Notes:**
<!-- Add implementation notes here -->

---

## Phase 11: Polish
**Dependencies:** All features complete

- [ ] Performance optimization
- [ ] Mobile responsiveness refinement
- [ ] Manual testing of all flows
- [ ] Bug fixes

**Notes:**
<!-- Add implementation notes here -->

---

## Manual Testing Checklist

> Complete this checklist before considering MVP ready for launch.

### Authentication
- [ ] Sign in with Google (new user creates account)
- [ ] Sign in with Google (existing user)
- [ ] Sign out
- [ ] Redirect to sign-in when accessing protected routes

### Bands & Collaboration
- [ ] Create a new band
- [ ] Generate and share invite code
- [ ] Join band via invite code (different user)
- [ ] View band member list
- [ ] Leave a band

### Songs & Files
- [ ] Create song with title only (minimal)
- [ ] Create song with all fields (key, mode, tempo, time signature, notes)
- [ ] Update practice status (new → learning → solid → performance_ready)
- [ ] Upload audio file via "Add File" button
- [ ] Upload file via drag-and-drop (verify overlay appears on drag)
- [ ] Verify upload progress bar displays
- [ ] Upload Guitar Pro file
- [ ] Add YouTube link (verify metadata auto-populates display name)
- [ ] Add YouTube Music link (verify file type auto-sets to "audio")
- [ ] Add regular YouTube link (verify file type auto-sets to "video")
- [ ] Add Dropbox/Google Drive link
- [ ] Edit file display name and variant label
- [ ] Download uploaded file (verify download button works)
- [ ] Delete file (verify confirmation dialog)
- [ ] Delete song (soft delete, verify files also deleted)
- [ ] Verify storage quota displays in user dropdown menu
- [ ] Verify song card badges show correct file types (Audio, Video, Chart, Tab)
- [ ] Filter songs by practice status tabs (All, New, Learning, Solid, Ready)

### Audio Features (Phase 4)
- [ ] Upload audio file triggers waveform computation
- [ ] Waveform displays on song detail page
- [ ] Audio playback with wavesurfer.js
- [ ] Tempo/key detection populates song defaults

### Tab Rendering (Phase 5)
- [ ] Guitar Pro file renders with AlphaTab
- [ ] MIDI playback from tab works

### Gear Settings
- [ ] Add gear piece (pedal/synth/amp)
- [ ] Add custom knobs to gear piece
- [ ] Adjust knob positions (visual dial)
- [ ] Edit knob labels
- [ ] Create song sections with different gear

### Training Tools
- [ ] Metronome: Set BPM, time signature, play/stop
- [ ] Metronome: Link to song (auto-configure)
- [ ] Drone player: Set key, play/stop
- [ ] Chord prog player: Enter chords, set bars
- [ ] Chord prog player: Enable drum beat, select style

### Recording Projects
- [ ] Create recording project
- [ ] Add songs to project
- [ ] Update tracking grid status
- [ ] Upload bounce
- [ ] Add timestamped comment on bounce

### Setlists
- [ ] Create setlist
- [ ] Add songs to setlist
- [ ] Reorder songs
- [ ] View computed gear deltas
- [ ] Verify duration calculation

### Mobile Responsiveness
- [ ] Test all above flows on mobile viewport
- [ ] Verify touch interactions work (knob dials, drag-drop)

---

## Blockers & Issues

> Document any blockers or issues encountered during development.

| Date | Issue | Status | Resolution |
|------|-------|--------|------------|
| | | | |

---

## Session Notes

> Add notes at the end of each development session to help resume context.

### Session: January 19, 2026
**What was done:**
- Initialized Next.js 16 project with TypeScript, React 19, Tailwind CSS 4
- Installed and configured Convex with @convex-dev/auth for Google OAuth
- Created full Convex schema from SCHEMA.md spec (13 tables)
- Set up shadcn/ui with essential components
- Created responsive dashboard layout with mobile navigation
- Built sign-in page with Google OAuth button
- Added error boundary component with PostHog error capture
- Configured PostHog analytics provider
- Updated PRD docs to use PostHog instead of Sentry

**Next steps:**
- Run `npx convex dev` to deploy schema and generate types
- Configure Google OAuth credentials in Google Cloud Console
- Add environment variables to .env.local
- Test authentication flow end-to-end
- Begin Phase 2: Bands & Collaboration

**Context to remember:**
- TypeScript errors will resolve after running `npx convex dev`
- The generated `_generated/` folder will be created by Convex
- Google OAuth callback URL: `http://localhost:3000/api/auth/callback/google`

### Session: January 20, 2026
**What was done:**
- Implemented Phase 2: Bands & Collaboration
- Created Convex functions for bands and memberships (queries + mutations)
- Built UI components for band management (dialogs, cards, lists)
- Added 6-character shareable invite codes with safe character set
- Implemented band member list with instrument picker
- Added leave/delete band functionality with proper business rules
- Fixed auth user lookup to use `getAuthUserId` from Convex Auth
- Added `tokenIdentifier` field to users schema (for future use)
- All manual tests passing: create band, copy invite code, join band, view members, update instruments, leave band, delete band

**Next steps:**
- Begin Phase 3: Songs & Files
- Implement song CRUD with practice status
- Add file upload with size validation and storage quotas

**Context to remember:**
- Use `getAuthUserId(ctx)` from `@convex-dev/auth/server` for getting authenticated user ID
- Band membership uses soft delete via `leftAt` timestamp
- Invite codes are 6 chars from safe set: ABCDEFGHJKMNPQRSTUVWXYZ23456789

### Session: January 20, 2026 (Phase 3)
**What was done:**
- Implemented Phase 3: Songs & Files
- Created `convex/songs.ts` with full CRUD operations and practice status management
- Created `convex/files.ts` with file upload, storage quotas, and rate limiting
- Created `convex/songSections.ts` for song section management (gear settings will attach here)
- Built `useFileUpload` hook with XHR progress tracking
- Created song UI components: SongCard, SongList, CreateSongDialog, PracticeStatusBadge
- Created file UI components: FileUploadDropzone, ExternalUrlDialog, SongFilesSection
- Created songs list page with practice status filter tabs
- Created song detail page with inline editing and file management
- Updated BandCard to navigate to songs page instead of members page
- Added shadcn/ui alert-dialog for delete confirmations
- All builds passing (type-check, lint, build)

**Next steps:**
- Begin Phase 4: Audio Features
- Implement waveform pre-computation on audio upload
- Add wavesurfer.js for audio playback
- Consider Essentia.js for tempo/key detection

**Context to remember:**
- Files can be uploaded (storageId) or external URLs (externalUrl + externalService)
- Rate limiting uses uploadRateLimits table with 1-hour sliding window
- Storage quota is tracked in users.storageUsedBytes, reclaimed on file delete
- Song sections are ready for Phase 6 (Gear Settings) to attach gearSettings
- Practice status enum: new → learning → solid → performance_ready

### Session: January 20, 2026 (Phase 3 Polish)
**What was done:**
- Added YouTube metadata scraping to ExternalUrlDialog via oEmbed API
- YouTube URLs auto-detect and populate display name on paste
- YouTube Music vs regular YouTube detection (sets file type to audio vs video)
- Created `src/lib/youtube.ts` with URL extraction and metadata fetching utilities
- Moved storage quota display from song files section to user dropdown menu in DashboardNav
- Added "Add File" button alongside "Add Link" in SongFilesSection
- Implemented drag overlay for file upload (hidden dropzone appears on drag, covers full card)
- Fixed external service label formatting (google_drive → "Google Drive")
- Added file type badges to SongCard: Audio, Video, Chart, Tab (computed server-side)
- Added file download button for uploaded files
- Added inline file editing (display name, variant label) with delete confirmation
- Phase 3 fully complete and tested

**Next steps:**
- Begin Phase 4: Audio Features
- Implement waveform pre-computation on audio upload
- Add wavesurfer.js for audio playback

**Context to remember:**
- YouTube metadata uses oEmbed endpoint (no API key required): `https://www.youtube.com/oembed?url=...`
- `isYouTubeUrl()` and `fetchYouTubeMetadata()` exported from `src/lib/youtube.ts`
- Song card file type flags computed in `convex/songs.ts` listByBand query (hasAudio, hasVideo, hasChart, hasTab)
- FileUploadDropzone has `asOverlay` prop for the drag-to-reveal behavior
- Storage quota query: `api.files.getStorageUsage` (used in DashboardNav)
