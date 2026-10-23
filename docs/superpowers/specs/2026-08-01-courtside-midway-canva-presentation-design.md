# COURTSIDE Midway Canva Presentation Design

## Purpose

Refine the existing 38-page Canva presentation for a solo 20-minute university midway examination followed by 10 minutes of questions. Preserve every page and the existing blue-orange basketball visual direction while making the content accurate, concise, and easy to explain.

## Communication Job

By the end of the presentation, the examination committee should understand the problem COURTSIDE addresses, the current 40-percent implementation scope, the system's architecture and technologies, and the demonstrated workflow from tournament creation through team registration.

## Constraints

- Keep all 38 pages in their current order unless a local wording correction requires a clearer transition.
- Do not delete or move pages into an appendix.
- Preserve the current blue, orange, and white basketball theme.
- Keep pages that already communicate clearly; avoid cosmetic rewrites without a presentation benefit.
- Use concise Thai audience-facing copy. English technology names may remain where standard.
- Do not claim unimplemented functionality as complete.
- Use screenshots already placed by the user. Improve headings and explanatory captions around them.

## Narrative Structure

### Pages 1-9: Project Context

Introduce COURTSIDE, the current problems in Thai basketball tournament operations, objectives, scope, target users, and expected benefits. Each page should answer one question and avoid long report-style paragraphs.

### Pages 10-20: Theory, Technology, and Related Work

Explain only concepts that support the implemented system: client-server web applications, authentication and authorization, role-based access control, relational databases, Clean Architecture, Next.js, React, TypeScript, Supabase, Prisma, Zod, and testing. Related systems should be compared by the lesson COURTSIDE adopts or improves, not presented as a list of websites.

### Pages 21-38: Implemented Workflow

Present the screenshots as a continuous operational story. Every page should make three facts obvious:

1. Which role is acting.
2. What action is being performed.
3. What outcome the system produces.

The primary demonstration flow is:

1. Tournament organizer signs in.
2. Organizer creates and submits a tournament.
3. Platform admin reviews and approves it.
4. Organizer publishes it to the public listing.
5. Team manager creates a team and applies.
6. Organizer reviews and approves the registration.
7. The final status is visible to the relevant users.

## Copy Rules

- Use a takeaway title instead of a generic topic label when the layout permits.
- Limit body text to the essential explanation visible during presentation.
- Replace long paragraphs with up to three concise points.
- Use consistent Thai terms for roles and statuses.
- Format screenshot captions as `actor -> action -> outcome` where appropriate.
- Correct spelling, including the English cover title.
- Avoid exposing rehearsal notes or timing instructions on the visible slide.

## Timing Model

- Opening and project context: about 4 minutes.
- Theory, architecture, and technology: about 4 minutes.
- Current implementation and screenshot workflow: about 10 minutes.
- Progress summary and close: about 2 minutes.

The screenshot pages are a guided walkthrough rather than 18 independent explanations; closely related pages should be spoken through as one continuous step.

## Quality Checks

- All 38 pages remain present.
- Titles, actor names, actions, and outcomes match the actual COURTSIDE implementation.
- Screenshot sequence matches the live demonstration flow.
- Text remains legible and does not overlap screenshots or decorative elements.
- The deck does not claim Supabase Realtime, Edge Functions, notifications, analytics, or a complete bracket/results subsystem as implemented.
- The final page closes on current progress, demonstrated value, and the next development phase rather than ending on an unexplained status screenshot.
