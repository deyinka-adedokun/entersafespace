# Safespace P0 Authentication Hardening

## Objective
Replace the prototype's process-wide `activeUserId` identity with per-client authenticated sessions while preserving the existing `/api/v1/auth/*` API contract.

## Current blocker
The server currently stores a single process-wide `activeUserId`. A login therefore changes the identity used by every request handled by that server process. This is not safe for concurrent users.

## Increment 1 scope
- Introduce an opaque, cryptographically random session identifier.
- Store session records server-side and associate each session with exactly one user.
- Send the session identifier in an HttpOnly, SameSite cookie.
- Resolve the current user from the request cookie, never from global mutable identity.
- Logout invalidates only the caller's session.
- OTP verification and login establish a session for the caller.
- Keep session storage in memory temporarily; durable persistence is a subsequent increment.

## Deliberately deferred
- Persistent database/session store.
- Password hashing migration.
- Email/SMS OTP provider integration.
- CSRF strategy beyond SameSite cookie protection.
- Privileged endpoint RBAC sweep.
- Payment and audio production infrastructure.

## Acceptance criteria
1. Two simultaneous browser clients can authenticate as different users without affecting one another.
2. `/api/v1/auth/me` returns the identity represented by the request cookie.
3. Logout invalidates only that session.
4. No request uses a process-wide `activeUserId`.
5. Session identifiers are generated using Node's cryptographic random generator.
