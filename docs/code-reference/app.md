# หน้าเว็บและ API

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## app/(admin)/admin/error.tsx

รับข้อผิดพลาดจากการแสดงหน้าในขอบเขต /admin และให้ลองโหลดใหม่ผ่าน reset

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/error.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminDashboardError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/error.tsx:10>) | 10 |  |

## app/(admin)/admin/loading.tsx

แสดงสถานะกำลังโหลดในขอบเขต /admin ระหว่าง Next.js รอข้อมูลหน้า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/loading.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminDashboardLoading](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/loading.tsx:6>) | 6 |  |

## app/(admin)/admin/page.tsx

หน้า /admin: ตรวจบทบาทแอดมินก่อนอ่านและแสดง dashboard

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/page.tsx:17>) | 17 |  |

## app/(admin)/admin/reviews/[id]/page.tsx

หน้า /admin/reviews/[id]: อ่านรายละเอียด โปสเตอร์ และเอกสารของรายการที่ส่งตรวจ พร้อมฟอร์มตัดสิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/review-detail-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/review-detail-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminReviewDetailPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:18>) | 18 |  |
| [ReviewFact](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:103>) | 103 |  |
| [formatTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:112>) | 112 |  |

## app/(admin)/admin/reviews/page.tsx

หน้า /admin/reviews: อ่านคิวรายการที่ส่งตรวจให้แอดมินเลือกพิจารณา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminReviewsPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/page.tsx:13>) | 13 |  |

## app/(admin)/admin/teams/[id]/page.tsx

หน้า /admin/teams/[id]: แสดงข้อมูลทีมและสมาชิกปัจจุบันให้แอดมินดูแบบอ่านอย่างเดียว

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-team-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-team-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminTeamDetailPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/[id]/page.tsx:14>) | 14 |  |

## app/(admin)/admin/teams/page.tsx

หน้า /admin/teams: ตรวจสิทธิ์แอดมินแล้วแสดงทีมทั้งหมดพร้อมชื่อผู้สร้าง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-team-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-team-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminTeamListPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/teams/page.tsx:14>) | 14 |  |

## app/(admin)/admin/tournaments/[id]/page.tsx

หน้า /admin/tournaments/[id]: แสดงข้อมูลรายการ สถานะกำกับ และคำสั่งที่แอดมินทำได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/tournament-governance-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/tournament-governance-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminTournamentGovernancePage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:102>) | 102 |  |
| [governanceIssueLabel](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/page.tsx:171>) | 171 |  |

## app/(admin)/admin/tournaments/[id]/results/page.tsx

หน้า /admin/tournaments/[id]/results: ให้แอดมินอ่านผลและเปิดกระบวนการแก้ไขผลที่ยืนยันแล้ว

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/results/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminTournamentResultsPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/[id]/results/page.tsx:18>) | 18 |  |

## app/(admin)/admin/tournaments/page.tsx

หน้า /admin/tournaments: อ่านรายการทั้งหมดตามเงื่อนไขสำหรับการกำกับของแอดมิน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/admin-tournament-list-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/admin-tournament-list-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminTournamentListPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/page.tsx:32>) | 32 |  |
| [OperationLink](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/tournaments/page.tsx:137>) | 137 |  |

## app/(admin)/layout.tsx

วางกรอบหลังบ้านและเมนูตามบัญชีให้หน้าแอดมิน ผู้จัด และทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/layout.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/admin/review-detail-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/admin/review-detail-page.test.tsx:1>), [tests/ui/organizer/tournament-registrations-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-registrations-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [AdminLayout](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/layout.tsx:15>) | 15 |  |

## app/(admin)/organizer/page.tsx

หน้า /organizer: อ่านรายการของผู้จัดและแสดงความพร้อมกับขั้นตอนถัดไป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/organizer-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/organizer-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [OrganizerPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/page.tsx:16>) | 16 |  |

## app/(admin)/organizer/tournaments/[id]/bracket/page.tsx

หน้า /organizer/tournaments/[id]/bracket: อ่านพื้นที่ทำงานสายเพื่อจัดทีม สร้างสาย หรือจัดการเอกสารภายนอก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-governance-state-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-governance-state-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [OrganizerBracketPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:21>) | 21 |  |

## app/(admin)/organizer/tournaments/[id]/page.tsx

หน้า /organizer/tournaments/[id]: ตรวจเจ้าของรายการก่อนเปิดรายละเอียดและคำสั่งตามสถานะ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-governance-state-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-governance-state-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [EditTournamentPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:22>) | 22 |  |

## app/(admin)/organizer/tournaments/[id]/registrations/page.tsx

หน้า /organizer/tournaments/[id]/registrations: อ่านใบสมัครและรายชื่อสมาชิกให้ผู้จัดเจ้าของรายการพิจารณา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-governance-state-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-governance-state-pages.test.tsx:1>), [tests/ui/organizer/tournament-registrations-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-registrations-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentRegistrationsPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/registrations/page.tsx:25>) | 25 |  |

## app/(admin)/organizer/tournaments/[id]/results/page.tsx

หน้า /organizer/tournaments/[id]/results: อ่านคู่ คะแนน และสถานะก่อนแสดงฟอร์มบันทึก/ยืนยันผล

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/organizer-results-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/organizer-results-page.test.tsx:1>), [tests/ui/organizer/tournament-governance-state-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-governance-state-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [OrganizerResultsPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/results/page.tsx:21>) | 21 |  |

## app/(admin)/organizer/tournaments/[id]/schedule/page.tsx

หน้า /organizer/tournaments/[id]/schedule: อ่านคู่แข่งขันและสิทธิ์ก่อนแสดงฟอร์มจัดวันเวลา/สนาม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/organizer/tournament-governance-state-pages.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/organizer/tournament-governance-state-pages.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [OrganizerSchedulePage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/schedule/page.tsx:22>) | 22 |  |

## app/(admin)/organizer/tournaments/new/page.tsx

หน้า /organizer/tournaments/new: เปิดฟอร์มสร้างฉบับร่างรายการแข่งขัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/new/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [NewTournamentPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/new/page.tsx:9>) | 9 |  |

## app/(admin)/team/[id]/page.tsx

หน้า /team/[id]: ตรวจสิทธิ์แล้วอ่านข้อมูลทีม ผู้เล่น และใบสมัครสำหรับพื้นที่จัดการทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamDetailPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:19>) | 19 |  |
| [loadTeamDetail](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/[id]/page.tsx:59>) | 59 |  |

## app/(admin)/team/new/page.tsx

หน้า /team/new: เปิดฟอร์มสร้างทีมพร้อมประวัติผู้เล่นของบัญชีที่เลือกกลับมาใช้ได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/new/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/team/team-editor.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/team/team-editor.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [NewTeamPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/new/page.tsx:12>) | 12 |  |

## app/(admin)/team/page.tsx

หน้า /team: อ่านทีมของบัญชีปัจจุบันและแสดงทางไปสร้าง/จัดการทีม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TeamPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/team/page.tsx:17>) | 17 |  |

## app/(public)/bracket/page.tsx

หน้า /bracket: อ่านสายที่เผยแพร่ของรายการที่เลือก แล้วแสดงสายระบบหรือไฟล์ภายนอก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-competition-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-competition-prefetch.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [BracketPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:21>) | 21 |  |

## app/(public)/forgot-password/page.tsx

หน้า /forgot-password: เปิดฟอร์มขอลิงก์กู้รหัสผ่าน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/forgot-password/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ForgotPasswordPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/forgot-password/page.tsx:12>) | 12 |  |

## app/(public)/layout.tsx

วางกรอบหน้าสาธารณะและส่วนหัวร่วมกัน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/layout.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-platform-accessibility.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-platform-accessibility.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PublicLayout](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/layout.tsx:10>) | 10 |  |

## app/(public)/login/page.tsx

หน้า /login: เปิดฟอร์มเข้าสู่ระบบและกำหนดหน้าปลายทางเมื่อมีค่า next

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/login/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/auth/login-development-session.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/auth/login-development-session.test.tsx:1>), [tests/ui/public-platform-accessibility.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-platform-accessibility.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [LoginPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/login/page.tsx:20>) | 20 |  |

## app/(public)/page.tsx

หน้า /: หน้าแรก แสดงรายการเปิดรับสมัครและตัวกรองค้นหา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-navigation-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-navigation-prefetch.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [HomePage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/page.tsx:17>) | 17 |  |

## app/(public)/register/page.tsx

หน้า /register: เปิดฟอร์มสมัครบัญชีพร้อมบทบาทที่ผู้สมัครเลือกเองได้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/register/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [RegisterPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/register/page.tsx:12>) | 12 |  |

## app/(public)/reset-password/page.tsx

หน้า /reset-password: เปิดฟอร์มตั้งรหัสผ่านใหม่สำหรับกระบวนการ recovery

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/reset-password/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ResetPasswordPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/reset-password/page.tsx:12>) | 12 |  |

## app/(public)/results/error.tsx

รับข้อผิดพลาดจากการแสดงหน้าในขอบเขต /results และให้ลองโหลดใหม่ผ่าน reset

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/error.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-tournament-states.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-tournament-states.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ResultsError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/error.tsx:12>) | 12 |  |

## app/(public)/results/loading.tsx

แสดงสถานะกำลังโหลดในขอบเขต /results ระหว่าง Next.js รอข้อมูลหน้า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/loading.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-tournament-states.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-tournament-states.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ResultsLoading](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/loading.tsx:6>) | 6 |  |

## app/(public)/results/page.tsx

หน้า /results: อ่านผลที่ยืนยันและข้อมูลอันดับของรายการที่เลือก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-competition-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-competition-prefetch.test.tsx:1>), [tests/ui/tournaments/public-results-page.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-results-page.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ResultsPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/results/page.tsx:23>) | 23 |  |

## app/(public)/schedule/page.tsx

หน้า /schedule: อ่านคู่แข่งขันของรายการที่เลือกแล้วแสดงตามวันเวลาและสนาม

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/public-competition-prefetch.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/public-competition-prefetch.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [SchedulePage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/schedule/page.tsx:17>) | 17 |  |

## app/(public)/tournaments/[slug]/not-found.tsx

แสดงสถานะไม่พบหน้า/รายการในขอบเขต /tournaments/[slug] และทางกลับไปใช้งานต่อ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/not-found.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-tournament-states.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-tournament-states.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentNotFound](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/not-found.tsx:9>) | 9 |  |

## app/(public)/tournaments/[slug]/page.tsx

หน้า /tournaments/[slug]: อ่านรายละเอียดรายการที่เลือก พร้อมโปสเตอร์ เอกสาร และตัวเลือกสมัคร

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentDetailPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:37>) | 37 |  |
| [loadRegistrationAvailability](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/[slug]/page.tsx:161>) | 161 |  |

## app/(public)/tournaments/error.tsx

รับข้อผิดพลาดจากการแสดงหน้าในขอบเขต /tournaments และให้ลองโหลดใหม่ผ่าน reset

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/error.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-tournament-states.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-tournament-states.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/error.tsx:12>) | 12 |  |

## app/(public)/tournaments/loading.tsx

แสดงสถานะกำลังโหลดในขอบเขต /tournaments ระหว่าง Next.js รอข้อมูลหน้า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/loading.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/tournaments/public-tournament-states.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/tournaments/public-tournament-states.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentLoading](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/loading.tsx:6>) | 6 |  |

## app/(public)/tournaments/page.tsx

หน้า /tournaments: ค้นหารายการแข่งขันตามตัวกรองใน URL และแสดงผลลัพธ์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [TournamentListPage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/tournaments/page.tsx:15>) | 15 |  |

## app/api/admin/tournaments/[id]/close-registration/route.ts

API POST /api/admin/tournaments/[id]/close-registration: รับคำขอ HTTP แล้วส่งต่อ handleTournamentLifecycleRequest

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/close-registration/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/close-registration/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/[id]/governance/route.ts

API POST /api/admin/tournaments/[id]/governance: รับคำขอ HTTP แล้วส่งต่อ handleTournamentGovernance

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/governance/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/governance/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts

API POST /api/admin/tournaments/[id]/matches/[matchId]/result-correction: รับคำขอ HTTP แล้วส่งต่อ handleCorrectMatchResult

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/matches/[matchId]/result-correction/route.ts:13>) | 13 |  |

## app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts

API GET /api/admin/tournaments/[id]/media/[assetId]/open: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/review-document.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/review-document.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [GET](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:13>) | 13 |  |

## app/api/admin/tournaments/[id]/media/[assetId]/route.ts

API DELETE /api/admin/tournaments/[id]/media/[assetId]: รับคำขอ HTTP แล้วส่งต่อ handleTournamentMediaDelete

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:15>) | 15 |  |

## app/api/admin/tournaments/[id]/media/route.ts

API POST /api/admin/tournaments/[id]/media: รับคำขอ HTTP แล้วส่งต่อ handleTournamentMediaUpload

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-media-storage-config.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-media-storage-config.test.ts:1>), [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:18>) | 18 |  |

## app/api/admin/tournaments/[id]/publish/route.ts

API POST /api/admin/tournaments/[id]/publish: รับคำขอ HTTP แล้วส่งต่อ handleTournamentLifecycleRequest

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/publish/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/publish/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/[id]/review/route.ts

API POST /api/admin/tournaments/[id]/review: รับคำขอ HTTP แล้วส่งต่อ handleReviewRequest

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/review/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/review/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/[id]/route.ts

API PUT /api/admin/tournaments/[id]: รับคำขอ HTTP แล้วส่งต่อ saveTournamentHandler

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PUT](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/[id]/submit/route.ts

API POST /api/admin/tournaments/[id]/submit: รับคำขอ HTTP แล้วส่งต่อ submitTournamentHandler

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/submit/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/submit/route.ts:12>) | 12 |  |

## app/api/admin/tournaments/route.ts

API POST /api/admin/tournaments: รับคำขอ HTTP แล้วส่งต่อ saveTournamentHandler

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/route.ts:13>) | 13 |  |

## app/api/auth/forgot-password/route.ts

API POST /api/auth/forgot-password: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/forgot-password/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/forgot-password/route.ts:10>) | 10 |  |

## app/api/auth/login/route.ts

API POST /api/auth/login: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/login/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/login/route.ts:11>) | 11 |  |

## app/api/auth/logout/route.ts

API POST /api/auth/logout: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/logout/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/logout/route.ts:10>) | 10 |  |

## app/api/auth/register/route.ts

API POST /api/auth/register: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/register/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/register/route.ts:10>) | 10 |  |

## app/api/auth/reset-password/route.ts

API POST /api/auth/reset-password: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/reset-password/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/auth/reset-password/route.ts:10>) | 10 |  |

## app/api/dev/session/route.ts

API POST /api/dev/session: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/dev/session/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/auth/development-session-route.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/auth/development-session-route.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/dev/session/route.ts:15>) | 15 |  |

## app/api/organizer/tournaments/[id]/bracket/entries/route.ts

API POST /api/organizer/tournaments/[id]/bracket/entries: รับคำขอ HTTP แล้วส่งต่อ handleLockBracketEntries

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/entries/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/entries/route.ts:13>) | 13 |  |

## app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts

API POST /api/organizer/tournaments/[id]/bracket/external/publication: รับคำขอ HTTP แล้วส่งต่อ handlePublishExternalBracket

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/publication/route.ts:12>) | 12 |  |

## app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts

API DELETE /api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]: รับคำขอ HTTP แล้วส่งต่อ handleRetireExternalBracket

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/[revisionId]/route.ts:12>) | 12 |  |

## app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts

API POST /api/organizer/tournaments/[id]/bracket/external/revisions: รับคำขอ HTTP แล้วส่งต่อ handleUploadExternalBracket

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:16>) | 16 |  |

## app/api/organizer/tournaments/[id]/bracket/generate/route.ts

API POST /api/organizer/tournaments/[id]/bracket/generate: รับคำขอ HTTP แล้วส่งต่อ handleGenerateBracket

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/generate/route.ts:17>) | 17 |  |

## app/api/organizer/tournaments/[id]/bracket/mode/route.ts

API POST /api/organizer/tournaments/[id]/bracket/mode: รับคำขอ HTTP แล้วส่งต่อ handleSelectBracketMode

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/mode/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/mode/route.ts:12>) | 12 |  |

## app/api/organizer/tournaments/[id]/bracket/publication/route.ts

API POST/DELETE /api/organizer/tournaments/[id]/bracket/publication: รับคำขอ HTTP แล้วส่งต่อ handlePublishBracket, handleUnpublishBracket

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:19>) | 19 |  |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/publication/route.ts:34>) | 34 |  |

## app/api/organizer/tournaments/[id]/complete/route.ts

API POST /api/organizer/tournaments/[id]/complete: รับคำขอ HTTP แล้วส่งต่อ handleTournamentCompetitionLifecycle

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/complete/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/complete/route.ts:12>) | 12 |  |

## app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts

API POST /api/organizer/tournaments/[id]/matches/[matchId]/confirm: รับคำขอ HTTP แล้วส่งต่อ handleConfirmMatchResult

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/confirm/route.ts:14>) | 14 |  |

## app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts

API PATCH /api/organizer/tournaments/[id]/matches/[matchId]/purpose: รับคำขอ HTTP แล้วส่งต่อ handleUpdateExternalMatchPurpose

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PATCH](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/purpose/route.ts:13>) | 13 |  |

## app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts

API PATCH /api/organizer/tournaments/[id]/matches/[matchId]/schedule: รับคำขอ HTTP แล้วส่งต่อ handleScheduleMatch

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PATCH](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/schedule/route.ts:14>) | 14 |  |

## app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts

API PATCH /api/organizer/tournaments/[id]/matches/[matchId]/score: รับคำขอ HTTP แล้วส่งต่อ handleRecordMatchScore

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PATCH](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/[matchId]/score/route.ts:14>) | 14 |  |

## app/api/organizer/tournaments/[id]/matches/route.ts

API POST /api/organizer/tournaments/[id]/matches: รับคำขอ HTTP แล้วส่งต่อ handleCreateExternalMatch

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/matches/route.ts:13>) | 13 |  |

## app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts

API POST /api/organizer/tournaments/[id]/registrations/[registrationId]/decision: รับคำขอ HTTP แล้วส่งต่อ handleDecideRegistration

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/decision/route.ts:13>) | 13 |  |

## app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts

API POST /api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw: รับคำขอ HTTP แล้วส่งต่อ handleWithdrawRegistration

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/registrations/[registrationId]/withdraw/route.ts:12>) | 12 |  |

## app/api/organizer/tournaments/[id]/start/route.ts

API POST /api/organizer/tournaments/[id]/start: รับคำขอ HTTP แล้วส่งต่อ handleTournamentCompetitionLifecycle

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/start/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/start/route.ts:12>) | 12 |  |

## app/api/registrations/[id]/route.ts

API DELETE /api/registrations/[id]: รับคำขอ HTTP แล้วส่งต่อ handleCancelRegistration

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/registrations/[id]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/registrations/[id]/route.ts:12>) | 12 |  |

## app/api/teams/[id]/players/[playerId]/route.ts

API PATCH/DELETE /api/teams/[id]/players/[playerId]: รับคำขอ HTTP แล้วส่งต่อ handleUpdateTeamPlayer, handleDeactivateTeamPlayer

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PATCH](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:17>) | 17 |  |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/[playerId]/route.ts:31>) | 31 |  |

## app/api/teams/[id]/players/batch/route.ts

API POST /api/teams/[id]/players/batch: รับคำขอ HTTP แล้วส่งต่อ handleAddTeamPlayers

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/batch/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/players/batch/route.ts:13>) | 13 |  |

## app/api/teams/[id]/route.ts

API PATCH/DELETE /api/teams/[id]: รับคำขอ HTTP แล้วส่งต่อ handleUpdateTeam, handleRemoveOrDeactivateTeam

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PATCH](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:17>) | 17 |  |
| [DELETE](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/[id]/route.ts:32>) | 32 |  |

## app/api/teams/route.ts

API POST /api/teams: รับคำขอ HTTP แล้วส่งต่อ handleCreateTeam

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/teams/route.ts:15>) | 15 |  |

## app/api/tournaments/[id]/registrations/route.ts

API POST /api/tournaments/[id]/registrations: รับคำขอ HTTP แล้วส่งต่อ handleApplyToTournament

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [POST](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/tournaments/[id]/registrations/route.ts:13>) | 13 |  |

## app/auth/callback/route.ts

API GET /auth/callback: รับคำขอ HTTP และประสานบริการที่ใช้จัดการคำขอนี้

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/auth/callback/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [GET](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/auth/callback/route.ts:10>) | 10 |  |

## app/error.tsx

รับข้อผิดพลาดจากการแสดงหน้าในขอบเขต / และให้ลองโหลดใหม่ผ่าน reset

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/error.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/ui/error-boundary.test.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/ui/error-boundary.test.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [Error](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/error.tsx:12>) | 12 |  |

## app/globals.css

กำหนด token สี ธีม ฟอนต์ และกฎพื้นฐานร่วมกันของทุกหน้า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/globals.css:1>)

## app/layout.tsx

วางโครง HTML ภาษาไทย ฟอนต์ และ ThemeProvider ครอบทั้งแอป

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/layout.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [RootLayout](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/layout.tsx:27>) | 27 |  |

## app/loading.tsx

แสดงสถานะกำลังโหลดในขอบเขต / ระหว่าง Next.js รอข้อมูลหน้า

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/loading.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [Loading](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/loading.tsx:9>) | 9 |  |

## app/not-found.tsx

แสดงสถานะไม่พบหน้า/รายการในขอบเขต / และทางกลับไปใช้งานต่อ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/not-found.tsx:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [NotFound](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/not-found.tsx:9>) | 9 |  |
