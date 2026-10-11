import { StatePanel } from "@/components/state-panel"

export default function NotFound() {
  return <StatePanel action={{ href: "/", label: "กลับหน้าแรก" }} kind="not-found" />
}
