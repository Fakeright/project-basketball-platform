# Auth Account Compensation

Registration creates a Supabase Auth user before the Prisma profile because
the profile requires the Auth user id. If profile creation fails, COURTSIDE
signs out the new session and attempts to delete the Auth user. A transient
deletion failure is retried once.

This compensation is not an atomic transaction across Supabase Auth and
PostgreSQL. If both deletion attempts fail, the route records a safe
`auth.register.compensate.delete` diagnostic with a correlation id. The public
route deliberately keeps the same generic `201` registration response used
for successful and existing-email requests, so cleanup state cannot become an
account-enumeration signal.

Operators must use that correlation id to investigate the Auth provider and
remove an orphaned Auth user manually. Never auto-link an orphaned user to a
Prisma profile by matching email alone.
