export default function LoginPage() {
  const developmentEnabled = process.env.NODE_ENV !== "production"

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-court">COURTSIDE ACCESS</p>
      <h1 className="mt-2 text-3xl font-semibold">เข้าสู่พื้นที่จัดการแข่งขัน</h1>
      <p className="mt-3 text-muted-foreground">
        ระบบยืนยันตัวตนจริงจะเพิ่มใน phase Authentication
      </p>
      {developmentEnabled ? (
        <div className="mt-8 border-y border-border py-6">
          <h2 className="font-semibold">บัญชีสำหรับพัฒนา</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <form action="/api/dev/session" method="post">
              <input name="actorId" type="hidden" value="admin-1" />
              <button
                className="min-h-11 w-full border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background"
                type="submit"
              >
                เข้าใช้งานเป็น Platform Admin
              </button>
            </form>
            <form action="/api/dev/session" method="post">
              <input name="actorId" type="hidden" value="organizer-1" />
              <button
                className="min-h-11 w-full border border-border px-4 text-sm font-medium hover:border-foreground"
                type="submit"
              >
                เข้าใช้งานเป็น Organizer
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="mt-8 border-y border-border py-6 text-muted-foreground">
          ระบบเข้าสู่ระบบยังไม่เปิดใช้งาน
        </p>
      )}
    </main>
  )
}
