# Fix MoM Draft Visibility & Editing

## Problem
In **Progress → MOM**, clicking *Generate* shows a "Draft MOM generated" toast, but:
1. The populated draft sits in the **Edit minutes** card below the fold — easy to miss.
2. The list fields (Attendees, Agenda, Decisions, Action items) use a `listField` helper that **strips empty lines on every keystroke**. This makes the textareas effectively un-editable: pressing Enter to add a new item, or clearing a line to retype it, immediately removes the line and jumps the cursor.
3. Selecting a transcript from the dropdown does nothing for generation — only the pasted text is used, so users who pick from the dropdown hit the "Paste transcript text first" error.

## Changes (UI/presentation only, single file: `src/components/progress/MomEditor.tsx`)

1. **Fix list editing**
   - Replace the destructive `listField` with a small `ListTextarea` component that keeps its own raw string state (initialised from the array, synced when the parent record changes via key/effect) and only splits to an array on blur. This lets users freely add blank lines, edit, and reorder without the cursor fighting them.

2. **Make the generated draft obvious**
   - After successful generate:
     - Show a **"Draft ready"** summary banner above the Edit card with counts (attendees / decisions / actions / agenda) and a clear "Review & edit below" call-to-action.
     - Smoothly scroll the **Edit minutes** card into view (`ref.scrollIntoView({ behavior: "smooth", block: "start" })`).
     - Add a highlight ring on the Edit card for ~2s so it's visually distinct.
   - Replace the plain toast with a richer success toast pointing users to edit.

3. **Dropdown-aware generation**
   - If a transcript is selected from the dropdown but the textarea is empty, show a clearer hint ("Paste the transcript text for *<fileName>* below, then click Generate") instead of a generic error. (No backend text is stored for team uploads today — keeping paste as the source of truth.)
   - Auto-fill the MoM title from the selected file name when the user picks one and the title is still "Untitled meeting".

4. **Minor polish**
   - Disable the Generate button while transcript text is empty (instead of erroring on click).
   - Keep `current` and the Edit form in sync on Generate (already done) and after Save (re-load list).

## Out of scope
- No changes to the MoM data model, generator heuristic, or storage.
- No backend changes.
- No other Progress tabs touched.

## File touched
- `src/components/progress/MomEditor.tsx` (edit only)
