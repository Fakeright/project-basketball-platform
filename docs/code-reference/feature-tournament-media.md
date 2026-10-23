# ระบบ tournament-media

[กลับคู่มือเตรียมสอบ](../EXAM-CODE-GUIDE.md)

อ้างอิง source หลังรอบเพิ่มคอมเมนต์วันที่ 23 ตุลาคม 2026 ลิงก์ใช้ตำแหน่ง worktree ในเครื่องนี้ เลขบรรทัดเป็นจุดเริ่ม declaration และอาจเลื่อนหลังแก้ไข

## features/tournament-media/application/authorize-tournament-media.ts

ตรวจผู้ใช้ เจ้าของรายการ และคำสั่งเกี่ยวกับสื่อก่อนอัปโหลดหรือลบ

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/authorize-tournament-media.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>), [features/tournament-media/application/delete-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [authorizeTournamentMediaMutation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/authorize-tournament-media.ts:13>) | 13 |  |

## features/tournament-media/application/delete-tournament-media.ts

ตรวจสิทธิ์ก่อนนำสื่อออกจากรายการและจัดการไฟล์ใน storage ตามเงื่อนไข

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/media/\[assetId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-media.test.ts:1>), [tests/features/tournament-media/delete-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/delete-tournament-media.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [deleteTournamentMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:30>) | 30 | ตรวจสิทธิ์และความสัมพันธ์ของ asset กับรายการก่อนนำสื่อออก |
| [buildStagedObjectPath](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:114>) | 114 |  |

## features/tournament-media/application/get-admin-review-media.ts

ตรวจสิทธิ์แอดมินก่อนอ่านสื่อที่ผู้จัดแนบ และเปิดเอกสารผ่าน endpoint ที่ตรวจสิทธิ์ทุกครั้ง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/open/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:1>), [components/admin/tournament-review-media.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-review-media.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/get-admin-review-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-admin-review-media.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getAdminReviewMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:23>) | 23 |  |
| [getAdminReviewDocumentUrl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:44>) | 44 |  |
| [assertPlatformAdmin](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:69>) | 69 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [AdminReviewMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:18>)

## features/tournament-media/application/get-public-tournament-media.ts

เลือกสื่อของรายการที่ผู้ชมมีสิทธิ์เห็น แล้วเตรียม URL สำหรับโปสเตอร์และเอกสาร

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:1>)

ผู้เรียกในโครงการ: [components/tournaments/tournament-document-list.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/tournaments/tournament-document-list.tsx:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/get-public-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-public-tournament-media.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getPublicTournamentMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:33>) | 33 | อ่านเฉพาะสื่อที่เปิดเผยได้และเตรียมลิงก์ที่ component ใช้แสดง |

ชนิดข้อมูล/สัญญาที่ส่งออก: [PublicDocumentLink](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:11>), [PublicTournamentMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:19>)

## features/tournament-media/application/media-cleanup.ts

จัดการล้างไฟล์ที่บันทึกไม่สำเร็จและรายงานความผิดพลาดโดยไม่ทำให้ข้อมูลต้นเหตุหาย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/media-cleanup.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-media/application/delete-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [reportMediaCleanupFailure](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/media-cleanup.ts:21>) | 21 |  |
| [error](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/media-cleanup.ts:38>) | 38 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [MediaCleanupOperation](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/media-cleanup.ts:7>), [MediaCleanupLogger](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/media-cleanup.ts:13>)

## features/tournament-media/application/ports/object-storage.ts

กำหนดสัญญาเก็บ ลบ และเปิดไฟล์ เพื่อให้ use case เปลี่ยนผู้ให้บริการ storage ได้โดยไม่เปลี่ยนกฎงาน

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/object-storage.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/tournament-media-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:1>), [features/competition/application/get-external-bracket-view.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-external-bracket-view.ts:1>), [features/competition/application/get-organizer-external-bracket-workspace.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/get-organizer-external-bracket-workspace.ts:1>), [features/competition/application/upload-external-bracket.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/upload-external-bracket.ts:1>), [features/competition/presentation/external-bracket-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/presentation/external-bracket-handler.ts:1>), [features/tournament-media/application/delete-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>), [features/tournament-media/application/get-admin-review-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:1>), [features/tournament-media/application/get-public-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>), [features/tournament-media/infrastructure/supabase-object-storage.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:1>), [features/tournaments/infrastructure/prisma-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/prisma-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/tournament-media.test.ts:1>), [tests/api/competition/external-bracket-routes.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/competition/external-bracket-routes.test.ts:1>), [tests/api/shared/route-boundary.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/shared/route-boundary.test.ts:1>), [tests/features/competition/external-bracket-use-cases.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/external-bracket-use-cases.test.ts:1>), [tests/features/competition/get-external-bracket-view.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-external-bracket-view.test.ts:1>), [tests/features/competition/get-organizer-external-bracket.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/competition/get-organizer-external-bracket.test.ts:1>), [tests/features/tournament-media/delete-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/delete-tournament-media.test.ts:1>), [tests/features/tournament-media/get-public-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-public-tournament-media.test.ts:1>), [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>), [tests/features/tournaments/prisma-tournament-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournaments/prisma-tournament-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [ObjectStorageError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/object-storage.ts:9>) | 9 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [ObjectStorageFailureCode](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/object-storage.ts:7>), [ObjectStorage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/object-storage.ts:19>)

## features/tournament-media/application/ports/tournament-media-repository.ts

กำหนดสัญญาอ่านและบันทึก metadata ของโปสเตอร์ เอกสาร และไฟล์สาย

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/tournament-media-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-media/application/delete-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/delete-tournament-media.ts:1>), [features/tournament-media/application/get-admin-review-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-admin-review-media.ts:1>), [features/tournament-media/application/get-public-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/get-public-tournament-media.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>), [features/tournament-media/infrastructure/development-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:1>), [features/tournament-media/infrastructure/get-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:1>), [features/tournament-media/infrastructure/prisma-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/get-admin-review-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-admin-review-media.test.ts:1>), [tests/features/tournament-media/get-public-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/get-public-tournament-media.test.ts:1>), [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [TournamentMediaRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/tournament-media-repository.ts:12>)

## features/tournament-media/application/upload-tournament-media.ts

ตรวจสิทธิ์และไฟล์โปสเตอร์/เอกสาร แล้วเก็บไฟล์ใน object storage และ metadata ใน repository

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>)

ผู้เรียกในโครงการ: [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>), [features/admin/presentation/tournament-media-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [uploadTournamentMedia](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:47>) | 47 | ตรวจไฟล์และเจ้าของรายการก่อนอัปโหลด แล้วเก็บ metadata ให้ผูกกับรายการถูกต้อง |
| [isMissingObject](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:130>) | 130 |  |
| [buildObjectPath](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:137>) | 137 |  |

ชนิดข้อมูล/สัญญาที่ส่งออก: [UploadTournamentMediaInput](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:27>)

## features/tournament-media/domain/media-asset.ts

กำหนดข้อมูล metadata ของสื่อ รวมชนิด bucket object path และขนาดไฟล์

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-asset.ts:1>)

ผู้เรียกในโครงการ: [features/admin/presentation/tournament-media-handler.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/admin/presentation/tournament-media-handler.ts:1>), [features/competition/application/ports/external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/application/ports/external-bracket-repository.ts:1>), [features/competition/infrastructure/development-external-bracket-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/competition/infrastructure/development-external-bracket-repository.ts:1>), [features/tournament-media/application/ports/tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/ports/tournament-media-repository.ts:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>), [features/tournament-media/domain/media-policy.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:1>), [features/tournament-media/infrastructure/development-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:1>), [features/tournament-media/infrastructure/prisma-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/api/admin/review-document.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/api/admin/review-document.test.ts:1>), [tests/features/tournament-media/delete-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/delete-tournament-media.test.ts:1>), [tests/features/tournament-media/upload-tournament-media.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/upload-tournament-media.test.ts:1>)

ชนิดข้อมูล/สัญญาที่ส่งออก: [MediaAssetKind](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-asset.ts:13>), [MediaFileDescriptor](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-asset.ts:15>), [TournamentMediaAsset](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-asset.ts:21>)

## features/tournament-media/domain/media-policy.ts

จำกัดชนิดและขนาดไฟล์ พร้อมตรวจลายเซ็นเนื้อไฟล์ให้ตรงชนิดที่แจ้ง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:1>)

ผู้เรียกในโครงการ: [components/admin/tournament-media-manager.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/components/admin/tournament-media-manager.tsx:1>), [features/tournament-media/application/upload-tournament-media.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/application/upload-tournament-media.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/media-policy.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/media-policy.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [validateMediaFile](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:29>) | 29 | ตรวจ MIME type และขนาดตามชนิด asset ก่อนอ่านเนื้อไฟล์หรืออัปโหลด |
| [getMediaMaximumBytes](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:44>) | 44 |  |
| [validateMediaFileContent](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:49>) | 49 | เทียบลายเซ็น byte ของเนื้อไฟล์กับชนิดที่แจ้ง เพื่อไม่เชื่อเพียงนามสกุลหรือ MIME จากผู้ส่ง |
| [startsWith](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:83>) | 83 |  |
| [isWebP](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:90>) | 90 |  |
| [isDocx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/domain/media-policy.ts:102>) | 102 | ตรวจว่าเป็นไฟล์ ZIP ที่มีโครงสร้าง Word ที่ต้องพบใน DOCX |

## features/tournament-media/infrastructure/development-tournament-media-repository.ts

เก็บ metadata สื่อสำหรับโหมดพัฒนาโดยไม่ต้องใช้ฐานข้อมูลจริง

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-media/infrastructure/get-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [DevelopmentTournamentMediaRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:30>) | 30 |  |
| [commitUpload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:33>) | 33 |  |
| [findActivePoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:75>) | 75 |  |
| [findActiveAsset](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:89>) | 89 |  |
| [listActiveAssets](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:101>) | 101 |  |
| [retireWithAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:108>) | 108 |  |
| [hasActiveAssetOfKind](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:143>) | 143 |  |
| [readState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:150>) | 150 |  |
| [writeState](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/development-tournament-media-repository.ts:169>) | 169 |  |

## features/tournament-media/infrastructure/get-tournament-media-repository.ts

เลือก repository ของสื่อให้ตรงกับฐานข้อมูลหรือโหมดพัฒนา

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/open/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [getTournamentMediaRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:16>) | 16 |  |

## features/tournament-media/infrastructure/prisma-tournament-media-repository.ts

อ่านและบันทึก metadata ของสื่อใน PostgreSQL ผ่าน Prisma

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:1>)

ผู้เรียกในโครงการ: [features/tournament-media/infrastructure/get-tournament-media-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/get-tournament-media-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/prisma-tournament-media-repository.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/prisma-tournament-media-repository.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [PrismaTournamentMediaRepository](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:20>) | 20 |  |
| [commitUpload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:25>) | 25 |  |
| [retireWithAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:84>) | 84 |  |
| [findActivePoster](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:123>) | 123 |  |
| [findActiveAsset](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:131>) | 131 |  |
| [listActiveAssets](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:138>) | 138 |  |
| [hasActiveAssetOfKind](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:146>) | 146 |  |
| [appendMediaAudit](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:157>) | 157 |  |
| [mapMediaAsset](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:187>) | 187 |  |
| [isPrismaUniqueError](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:203>) | 203 |  |
| [toJsonValue](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/prisma-tournament-media-repository.ts:213>) | 213 | แปลงข้อมูลให้เก็บในช่อง JSON ของ Prisma ได้ เช่น snapshot ใน audit |

## features/tournament-media/infrastructure/supabase-object-storage.ts

นำสัญญา object storage ไปใช้กับ Supabase Storage เพื่ออัปโหลด ลบ อ่าน และสร้าง URL

[เปิดไฟล์และอ่านคำอธิบายหัวไฟล์](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:1>)

ผู้เรียกในโครงการ: [app/(admin)/admin/reviews/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/admin/reviews/[id]/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/bracket/page.tsx:1>), [app/(admin)/organizer/tournaments/\[id\]/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(admin)/organizer/tournaments/[id]/page.tsx:1>), [app/(public)/bracket/page.tsx](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/(public)/bracket/page.tsx:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/open/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/open/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/\[assetId\]/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/[assetId]/route.ts:1>), [app/api/admin/tournaments/\[id\]/media/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/admin/tournaments/[id]/media/route.ts:1>), [app/api/organizer/tournaments/\[id\]/bracket/external/revisions/route.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/app/api/organizer/tournaments/[id]/bracket/external/revisions/route.ts:1>), [features/tournaments/infrastructure/get-tournament-repository.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournaments/infrastructure/get-tournament-repository.ts:1>)

เทสต์ที่ import ไฟล์นี้: [tests/features/tournament-media/supabase-object-storage.test.ts](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/tests/features/tournament-media/supabase-object-storage.test.ts:1>)

| ฟังก์ชัน/คลาส | บรรทัด | คำอธิบายเพิ่มเติม |
| --- | --- | --- |
| [SupabaseObjectStorage](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:17>) | 17 |  |
| [upload](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:22>) | 22 |  |
| [remove](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:41>) | 41 |  |
| [move](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:52>) | 52 |  |
| [getPublicUrl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:67>) | 67 |  |
| [createSignedUrl](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:71>) | 71 |  |
| [normalizeStorageFailure](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:89>) | 89 |  |
| [storageFailure](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:95>) | 95 |  |
| [createSupabaseStorageClient](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:110>) | 110 |  |
| [requiredEnvironment](<D:/PROJECT/project-basketball-platform/.worktrees/courtside-public-platform/features/tournament-media/infrastructure/supabase-object-storage.ts:124>) | 124 |  |
