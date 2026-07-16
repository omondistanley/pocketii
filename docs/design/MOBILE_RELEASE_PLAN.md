# Pocketii native release plan: stages 5–9

This plan defines the remaining path from the approved native redesign to a store-distributed Pocketii app. A successful TypeScript build is not the finish line.

## Stage 5 — release hardening

Exit criteria:

- Expo SDK dependencies pass `npx expo install --check`.
- `npm run typecheck` passes.
- Expo public configuration resolves the iOS bundle identifier and Android package.
- The production binary points to `https://pocketii.fly.dev`.
- Overview, Transactions, Plan, Invest, and More match the approved mobile information architecture.
- Investments and Guidance retain the required informational-only and not-financial-advice disclosures.
- Authentication, token refresh, deep links, bank connections, household scope, notifications, and destructive account actions are tested on a physical device.

## Stage 6 — connect Pocketii to EAS

Run from `mobile/` while authenticated to the intended Expo organization:

```bash
npx eas-cli login
npx eas-cli init
```

`eas init` creates or links the Expo project and writes the real `extra.eas.projectId` and update URL into the Expo configuration. Do not invent or copy a project ID from another app.

Confirm:

```bash
npx eas-cli project:info
npx expo config --type public
```

## Stage 7 — preview binaries and device QA

Create internal builds:

```bash
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile preview --platform android
```

Install the preview build on physical devices and run the release checklist:

- cold launch, login, logout, registration, password reset
- Google and Apple OAuth callback through `pocketii://oauth/callback`
- dashboard totals and loading states
- add/edit/delete transaction
- budgets, goals, recurring items, and cash flow
- portfolio data and Guidance disclosures
- household switching and invitations
- settings persistence and session management
- airplane mode, expired token, backend error, and slow-network behavior
- small and large iPhone layouts plus at least one Android handset

No production submission should happen until this checklist passes without a release-blocking defect.

## Stage 8 — TestFlight and Play internal testing

Create store binaries:

```bash
npx eas-cli build --profile production --platform ios
npx eas-cli build --profile production --platform android
```

Submit them:

```bash
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

Required account work:

- Apple Developer account and App Store Connect app for `com.pocketii.app`
- Google Play Console app for `com.pocketii.app`
- privacy policy and support URLs
- app icon, splash assets, screenshots, description, keywords, age rating, data-safety/privacy answers
- internal TestFlight group and Play internal-testing track

TestFlight/internal-track testing must repeat the core flows against production services because store binaries can behave differently from Expo Go and development clients.

## Stage 9 — production release and controlled updates

After beta approval:

- submit the iOS version for App Review
- promote the Android release from internal testing to production
- monitor authentication, API errors, crashes, and store feedback
- keep production API and database migrations backward-compatible with the installed binary
- use the `production` EAS Update channel only for JavaScript/assets changes compatible with the current runtime version
- publish a new store binary for native dependency, permission, plugin, or runtime-version changes

## Final result

The release is complete only when:

1. The redesigned web application is deployed to the production Fly environment.
2. The native iOS build is available through TestFlight and then the App Store.
3. The native Android build is available through internal testing and then Google Play.
4. Both apps use the same production backend and preserve authentication, household scope, finance workflows, and disclosures.
5. Physical-device QA and store-distributed beta QA have passed.
6. Monitoring and a rollback/update process are active.

Until the EAS project is linked, store credentials are configured, assets are finalized, and preview/store builds are installed and tested, the Expo app is release-prepared but not deployed.
