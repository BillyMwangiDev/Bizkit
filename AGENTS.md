# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Workflow

## Verification
- Run `npm run typecheck` before claiming a change is done. Fix or report errors — don't say "it should work" against an unverified build.
- Confirm UI changes by actually running the app and looking (screenshot), not by reasoning about the code alone.

## Metro caching
- Stale Metro bundles repeatedly hide working edits and cause false failures. After a UI/logic fix, restart with a clean cache (`expo start -c`) and verify on a fresh load before reporting success.

## Simulator / verification input
- Default to the Android emulator unless iOS is explicitly requested.
- Do NOT use synthetic input automation (cliclick) — it triggers the Expo dev menu and crashes Metro. To reach a screen for a screenshot, seed deterministic dev data instead of faking taps.

## Commits
- Checkpoint working milestones with a clear commit message instead of accumulating large uncommitted changes across a long session.
