# STE-Lite: Clear Technical Writing Rules

Inspired by ASD-STE100 (Simplified Technical English), adapted for developer documentation rather than aerospace manuals. Apply these rules whenever writing or reviewing README files, setup guides, code comments, or API documentation.

## Step 1: Classify the text first

- **Instructions** ("how to set this up," "run this command"): max 20 words per sentence, imperative mood, one action per sentence.
- **Explanations** ("why this works," "what this does"): max 25 words per sentence, one topic per paragraph, max 6 sentences per paragraph.

Never mix the two styles in the same paragraph.

## Step 2: Core rules

- **Active voice only.** "The trigger updates the count," not "the count is updated by the trigger."
- **No modal verbs in instructions.** Say "Run this command," not "You should run this command." Say "This requires Node 20," not "This might need Node 20."
- **One word, one meaning, throughout the whole document.** If you call it a "place" in one paragraph, don't call it a "location" or "spot" in the next — pick one term per concept and never vary it.
- **Conditions before actions.** "If the token expires, regenerate it," not "Regenerate the token if it expires."
- **Cut sentence-final clauses that just restate the obvious.** Prefer short, direct statements over qualified, hedged ones.
- **Use vertical lists for any sequence of 3+ steps** rather than a comma-separated sentence.

## Step 3: Transform existing text

1. Classify the passage (instruction or explanation).
2. Break any sentence over the word limit into two.
3. Convert passive constructions to active.
4. Remove modal verbs, restate as direct statements.
5. Replace inconsistent terminology with one fixed term per concept.
6. Move conditions to the front of the sentence.

## Example transformation

| Before | After |
|---|---|
| "The service worker should be caching tiles in most cases." | "The service worker caches map tiles." |
| "You may want to run the migration before testing." | "Run the migration before testing." |
| "Reports, once submitted by a user, are then processed by the corroboration trigger." | "The corroboration trigger processes each submitted report." |

## What this style guide does NOT do

- Does not enforce a controlled vocabulary (the official ~900-word list is copyrighted).
- Does not replace judgment — apply these rules to improve clarity, not to make text robotic. Prioritize clarity over rigid rule adherence if a conflict arises.
