import Image from "next/image"

export function HomeHeroImage() {
  return (
    <Image
      alt="สนามบาสเกตบอลในร่มพร้อมห่วงและเส้นสนามในประเทศไทย"
      className="object-cover"
      fill
      preload
      sizes="(max-width: 1023px) 100vw, 22rem"
      src="/images/courtside-hero.jpg"
    />
  )
}
