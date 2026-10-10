DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "MediaAsset"
    WHERE "kind" = 'POSTER' AND "deletedAt" IS NULL
    GROUP BY "tournamentId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Active poster duplicates must be resolved before applying this migration';
  END IF;
END
$$;

CREATE UNIQUE INDEX "MediaAsset_active_poster_tournamentId_key"
ON "MediaAsset" ("tournamentId")
WHERE "kind" = 'POSTER' AND "deletedAt" IS NULL;
