# Phase 3: Songs & Files - Manual Testing Plan

> **Prerequisites:**
> - Convex dev server running (`npx convex dev`)
> - Next.js dev server running (`npm run dev`)
> - Signed in with a user account
> - At least one band created

---

## 1. Song CRUD Operations

### 1.1 Create a Song
- [ ] Navigate to a band's songs page (`/bands/[bandId]/songs`)
- [ ] Click "Add Song" button
- [ ] Verify the Create Song dialog opens
- [ ] **Test validation:** Try submitting with empty title → should show error
- [ ] Fill in:
  - Title: "Test Song"
  - Key: "A"
  - Mode: "Minor"
  - Tempo: "120"
  - Time Signature: "4/4"
  - Notes: "Testing notes"
- [ ] Click "Add Song"
- [ ] Verify redirect to song detail page
- [ ] Verify all fields display correctly

### 1.2 View Song List
- [ ] Navigate back to songs list
- [ ] Verify the song appears in the list
- [ ] Verify practice status badge shows "New"
- [ ] Verify key/tempo/time signature display in card
- [ ] Create 2-3 more songs with different details

### 1.3 Edit a Song
- [ ] Click on a song to open detail page
- [ ] Click "Edit" button
- [ ] Verify form populates with existing values
- [ ] Change the title to "Updated Test Song"
- [ ] Change tempo to "140"
- [ ] Click "Save"
- [ ] Verify changes are saved and displayed

### 1.4 Delete a Song
- [ ] On a song detail page, click "Delete"
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" → dialog closes, song remains
- [ ] Click "Delete" again, then confirm
- [ ] Verify redirect to songs list
- [ ] Verify song no longer appears in list

---

## 2. Practice Status

### 2.1 Status Filter Tabs
- [ ] On songs list page, verify tab counts are correct
- [ ] Click "New" tab → only new songs shown
- [ ] Click "Learning" tab → shows empty state (or learning songs)
- [ ] Click "All" tab → all songs shown

### 2.2 Update Practice Status
- [ ] Open a song detail page
- [ ] In the sidebar, find "Practice Status" dropdown
- [ ] Change from "New" to "Learning"
- [ ] Verify toast notification appears
- [ ] Verify badge updates immediately
- [ ] Go back to songs list
- [ ] Verify song now appears under "Learning" tab
- [ ] Repeat for "Solid" and "Performance Ready"

---

## 3. File Upload

### 3.1 Basic Upload via Button
- [ ] Open a song detail page
- [ ] Scroll to the "Files" section
- [ ] Click "Add File" button
- [ ] Select an audio file (MP3, WAV, or FLAC < 10MB)
- [ ] Verify progress bar appears during upload
- [ ] Verify file appears in list after upload
- [ ] Verify "Primary" badge on first file
- [ ] Verify file type icon is correct (audio icon)

### 3.1b Upload via Drag-and-Drop
- [ ] Ensure no existing upload dropzone is visible when files exist
- [ ] Drag a file over the files card
- [ ] Verify overlay dropzone appears covering the entire card
- [ ] Drop the file
- [ ] Verify progress bar and file upload work as expected
- [ ] Verify overlay disappears after upload or drag-leave

### 3.2 Upload Different File Types
- [ ] Upload a PDF file → should show as "Chart"
- [ ] Upload an image file → should show as "Chart"
- [ ] Upload a video file → should show as "Video"
- [ ] If you have a Guitar Pro file (.gp, .gpx, .gp5) → should show as "Guitar Pro"

### 3.3 File Size Validation
- [ ] Try uploading a file larger than 100MB
- [ ] Verify error message appears
- [ ] File should not be saved

### 3.4 Download/Open Files
- [ ] For an uploaded audio file, click the download button
- [ ] Verify file downloads correctly
- [ ] For uploaded files, verify they can be opened in new tab

### 3.5 Set Primary File
- [ ] Upload a second audio file to a song
- [ ] Click the "..." menu on the second file
- [ ] Select "Set as Primary"
- [ ] Verify the Primary badge moves to the new file

### 3.6 Edit File Metadata
- [ ] Click the "..." menu on a file
- [ ] Select "Edit"
- [ ] Change display name
- [ ] Add or change variant label (e.g., "Live Version")
- [ ] Click "Save"
- [ ] Verify changes appear in files list

### 3.7 Delete File
- [ ] Click the "..." menu on a file
- [ ] Select "Delete"
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" → dialog closes, file remains
- [ ] Click "Delete" again, then confirm
- [ ] Verify file is removed from the list
- [ ] If deleted file was primary, verify another file becomes primary

---

## 4. External URLs

### 4.1 Add YouTube Link (Regular)
- [ ] Click "Add Link" button in Files section
- [ ] Paste a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- [ ] Verify YouTube is auto-detected (shown in input field)
- [ ] Verify display name auto-populates from video title
- [ ] Verify file type auto-sets to "Video"
- [ ] Edit display name if desired
- [ ] Click "Add Link"
- [ ] Verify link appears in files list
- [ ] Verify "YouTube" label shows
- [ ] Click external link icon → opens YouTube in new tab

### 4.1b Add YouTube Music Link
- [ ] Click "Add Link" button
- [ ] Paste a YouTube Music URL: `https://music.youtube.com/watch?v=...`
- [ ] Verify "YouTube Music" is auto-detected (shown in input field)
- [ ] Verify display name auto-populates from video/song title
- [ ] Verify file type auto-sets to "Audio" (not Video!)
- [ ] Click "Add Link"
- [ ] Verify link appears in files list with "YouTube Music" label

### 4.2 Add Dropbox Link
- [ ] Click "Add Link" button
- [ ] Enter a Dropbox URL
- [ ] Verify Dropbox is auto-detected
- [ ] Add with file type "Audio"
- [ ] Verify link appears with Dropbox label

### 4.3 Add Other External Links
- [ ] Test with Google Drive URL
- [ ] Test with Bandcamp URL
- [ ] Test with generic URL (any other domain)

### 4.4 URL Validation
- [ ] Try adding invalid URL (e.g., "not a url")
- [ ] Verify error message appears
- [ ] Try submitting with empty URL
- [ ] Verify error message appears

---

## 5. Storage Quota

### 5.1 Check Storage Usage in User Dropdown
- [ ] Click your avatar/name in the top navigation bar
- [ ] Verify storage usage displays in dropdown (e.g., "Storage: 45 MB / 2 GB")
- [ ] Verify progress bar shows visual indicator of usage
- [ ] Upload a file
- [ ] Re-open dropdown and verify storage usage increased
- [ ] Delete the file
- [ ] Re-open dropdown and verify storage usage decreased

### 5.2 Quota Enforcement (if testable)
> Note: Testing 2GB limit requires uploading 2GB of files, which may not be practical.
> This test is optional and can be simulated by temporarily lowering the limit in code.

- [ ] Upload files until quota is nearly full
- [ ] Try uploading a file that would exceed quota
- [ ] Verify error message mentions remaining space

---

## 6. Rate Limiting

### 6.1 Rate Limit Behavior
> Note: Testing 50 uploads/hour may not be practical. Can be tested by temporarily lowering limit.

- [ ] Upload files in quick succession
- [ ] After hitting rate limit, verify error message appears
- [ ] Message should indicate time remaining until reset

---

## 7. Navigation & UX

### 7.1 Song Card File Type Badges
- [ ] Navigate to songs list
- [ ] Create a song with an audio file → verify "Audio" badge appears
- [ ] Add a video file or YouTube video link → verify "Video" badge appears
- [ ] Add a chart/sheet music PDF → verify "Chart" badge appears
- [ ] Add a tab file or Guitar Pro file → verify "Tab" badge appears
- [ ] Verify multiple badges can display simultaneously
- [ ] For a song with only "other" file type, verify "1 file" displays instead

### 7.2 Band Card Navigation
- [ ] Go to `/bands` (main bands page)
- [ ] Click on a band card
- [ ] Verify it navigates to songs page (not members)

### 7.3 Member Access
- [ ] From songs page, click "Members" button in header
- [ ] Verify navigation to members page
- [ ] Verify back button returns to songs list

### 7.4 Empty States
- [ ] Create a new band with no songs
- [ ] Verify empty state message displays
- [ ] Verify "Add Your First Song" button works

### 7.5 Loading States
- [ ] Refresh pages and verify loading skeletons appear
- [ ] Verify smooth transition to loaded content

---

## 8. Error Handling

### 8.1 Network Errors
- [ ] Disable network in dev tools
- [ ] Try creating a song
- [ ] Verify error is handled gracefully
- [ ] Re-enable network

### 8.2 Permission Errors
- [ ] Try accessing a song from a band you're not a member of
- [ ] Verify "Song not found" message displays
- [ ] Verify back button works

---

## 9. Mobile Responsiveness

### 9.1 Songs List (Mobile)
- [ ] Open browser dev tools, enable mobile viewport (iPhone 14)
- [ ] Navigate to songs list
- [ ] Verify cards stack vertically
- [ ] Verify status tabs are scrollable if needed
- [ ] Verify "Add Song" button is accessible

### 9.2 Song Detail (Mobile)
- [ ] Open a song detail page
- [ ] Verify sidebar moves below main content
- [ ] Verify edit mode works
- [ ] Verify file upload dropzone is usable

### 9.3 Dialogs (Mobile)
- [ ] Open Create Song dialog on mobile
- [ ] Verify form is scrollable
- [ ] Verify all fields are accessible
- [ ] Verify buttons are tappable

---

## Test Results

| Section | Pass | Fail | Notes |
|---------|------|------|-------|
| 1. Song CRUD | | | |
| 2. Practice Status | | | |
| 3. File Upload (Button + Drag) | | | |
| 3b. File Editing | | | |
| 4. External URLs (YouTube auto-fetch) | | | |
| 5. Storage Quota (User Dropdown) | | | |
| 6. Rate Limiting | | | |
| 7. Navigation & UX (Song Badges) | | | |
| 8. Error Handling | | | |
| 9. Mobile Responsiveness | | | |

---

## Issues Found

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| | | | |

---

**Tester:** _______________
**Date:** _______________
**Environment:** Local Dev / Staging / Production
