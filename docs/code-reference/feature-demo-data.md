# ระบบ demo-data

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/demo-data/infrastructure/demo-seed-orchestration.ts

ประสานขั้นตอนสร้างข้อมูลตัวอย่างผ่าน port โดยตรวจขอบเขตข้อมูลก่อนเปลี่ยนชุด fixture

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:1>)

ผู้เรียกในโครงการ: [features/demo-data/infrastructure/prisma-demo-seed-port.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:1>), [prisma/seed.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/prisma/seed.ts:1>), [scripts/seed-competition-demos.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/seed-competition-demos.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/demo-data/demo-seed-orchestration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-orchestration.test.ts:1>), [tests/features/demo-data/prisma-demo-seed-port.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/prisma-demo-seed-port.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [runBaseDemoSeed](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:72>) | 72 | ตรวจขอบเขต fixture ก่อนสร้างชุดข้อมูลหลัก เพื่อไม่ทับข้อมูลอื่นโดยไม่ตั้งใจ |
| [runCompetitionDemoSeed](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:80>) | 80 | ตรวจข้อมูลตั้งต้นก่อนเปลี่ยนชุดสาย/คู่/ผลของรายการสาธิต |
| [createBaseDemoFixtureData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:128>) | 128 |  |
| [assertOnlyDemoRows](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:139>) | 139 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [DemoCompetitionFixtureState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:27>), [BaseDemoFixtureData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:38>), [CompetitionFixtureReplacement](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:47>), [DemoSeedTransactionPort](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:54>), [DemoSeedPort](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:65>)

## features/demo-data/infrastructure/demo-seed-safety.ts

ตรวจสภาพแวดล้อมและข้อมูลเดิมก่อน seed เพื่อไม่ให้ชุดตัวอย่างทับข้อมูลที่ไม่ใช่ fixture

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:1>)

ผู้เรียกในโครงการ: [features/demo-data/infrastructure/demo-seed-orchestration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:1>), [prisma/seed.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/prisma/seed.ts:1>), [scripts/seed-competition-demos.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/seed-competition-demos.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/demo-data/demo-seed-orchestration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-orchestration.test.ts:1>), [tests/features/demo-data/demo-seed-safety.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-safety.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createDemoSeedClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:79>) | 79 |  |
| [assertBaseDemoSeedPreflight](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:87>) | 87 |  |
| [assertCompetitionDemoSeedPreflight](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:131>) | 131 |  |
| [fixtureBracketDeleteWhere](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:217>) | 217 |  |
| [assertCompatible](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:223>) | 223 |  |
| [assertSingleCompatible](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:239>) | 239 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [BaseDemoSeedSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:45>), [CompetitionDemoSeedSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:53>)

## features/demo-data/infrastructure/demo-workflow-fixtures.ts

กำหนดบัญชี ทีม ผู้เล่น รายการ และใบสมัครตัวอย่างสำหรับสาธิตเส้นทางหลัก

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:1>)

ผู้เรียกในโครงการ: [features/demo-data/infrastructure/demo-seed-orchestration.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-orchestration.ts:1>), [features/demo-data/infrastructure/demo-seed-safety.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-seed-safety.ts:1>), [features/demo-data/infrastructure/prisma-demo-seed-port.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/demo-data/demo-seed-orchestration.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-orchestration.test.ts:1>), [tests/features/demo-data/demo-seed-safety.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-seed-safety.test.ts:1>), [tests/features/demo-data/demo-workflow-fixtures.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/demo-workflow-fixtures.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createPlayers](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:167>) | 167 |  |
| [createFiveVFiveTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:176>) | 176 |  |
| [getDemoBaseTeams](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:244>) | 244 |  |
| [assertDemoEnvironment](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:249>) | 249 | ป้องกันสคริปต์สาธิตทำงานนอกสภาพแวดล้อมที่อนุญาต |

ชนิดข้อมูล/สัญญาที่ส่งออก: [DemoTeamFixture](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:25>), [DemoWorkflowTournament](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:35>), [DemoRegistrationScenario](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:60>), [DemoSeedUser](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/demo-workflow-fixtures.ts:70>)

## features/demo-data/infrastructure/prisma-demo-seed-port.ts

นำสัญญา seed ไปใช้กับ Prisma เพื่อเขียนข้อมูลตัวอย่างหลายตารางใน transaction

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:1>)

ผู้เรียกในโครงการ: [prisma/seed.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/prisma/seed.ts:1>), [scripts/seed-competition-demos.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/scripts/seed-competition-demos.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/demo-data/prisma-demo-seed-port.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/demo-data/prisma-demo-seed-port.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [createPrismaDemoSeedPort](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:29>) | 29 |  |
| [PrismaDemoSeedTransactionPort](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:39>) | 39 |  |
| [readBaseSnapshot](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:42>) | 42 |  |
| [applyBaseFixture](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:80>) | 80 |  |
| [readCompetitionFixtureState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:158>) | 158 |  |
| [replaceCompetitionFixture](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:219>) | 219 |  |
| [seedTeam](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:285>) | 285 |  |
| [createBracket](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:337>) | 337 |  |
| [tournamentData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:424>) | 424 |  |
| [auditData](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:449>) | 449 |  |
| [fixedTimestamp](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/demo-data/infrastructure/prisma-demo-seed-port.ts:467>) | 467 |  |
