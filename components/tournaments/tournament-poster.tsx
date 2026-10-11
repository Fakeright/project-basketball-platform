import Image from "next/image"

export function TournamentPoster({
  posterUrl,
  tournamentTitle,
}: {
  posterUrl?: string
  tournamentTitle: string
}) {
  if (!posterUrl) return null

  return (
    <figure className="relative aspect-[4/5] overflow-hidden border border-border bg-muted">
      <Image
        alt={`โปสเตอร์การแข่งขัน ${tournamentTitle}`}
        className="object-cover"
        fill
        priority
        sizes="(min-width: 1024px) 18rem, 100vw"
        src={posterUrl}
      />
    </figure>
  )
}
