import { ensureDb } from "@/lib/db";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { removeAdmin } from "../../actions";
import { AdminHeader, btn, Card } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { SettingsForm } from "./SettingsForm";
import { AccountForm } from "./AccountForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await ensureDb({ fresh: true });
  const me = await requireAdmin();
  const db = readDb();
  return (
    <>
      <AdminHeader title="Settings" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-2">
        <div className="space-y-6">
        <Card title="Your account" description="Change your name, login email or password.">
          <AccountForm name={me.name} email={me.email} />
        </Card>
        <Card title="Site settings">
          <SettingsForm funeralUrl={db.settings.funeralCompanionUrl} keepQuestions={db.settings.keepAnonymisedQuestions} contactEmail={db.settings.contactEmail} />
        </Card>
        </div>
        <div className="space-y-6">
          <Card title="Admin accounts" description="The owner can remove the developer support account at any time." aside={<ShieldCheck className="size-5 text-brand" aria-hidden />}>
            <ul className="divide-y divide-line">
              {db.admins.map((a) => (
                <li key={a.email} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-bold">
                      {a.name} {a.email === me.email && <span className="text-sm font-normal text-ink-2">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-ink-2">
                      {a.email} · {a.role === "owner" ? "Owner" : "Developer support"} · since {formatDate(a.createdAt)}
                    </p>
                  </div>
                  {me.role === "owner" && a.role !== "owner" && (
                    <form action={removeAdmin}>
                      <input type="hidden" name="email" value={a.email} />
                      <ConfirmButton className={btn.ghost} message={`Remove ${a.email}? They will lose access immediately.`}>
                        <Trash2 className="size-4" aria-hidden /> Remove
                      </ConfirmButton>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Export content" description="A full copy of the website: every page, listing, post, event and setting, plus all uploaded files. Keep it as a backup or use it to move hosts.">
            <div className="flex flex-wrap gap-2">
              <a href="/admin/export?format=zip" className={btn.secondary}>
                <Download className="size-4" aria-hidden /> Download everything (.zip)
              </a>
              <a href="/admin/export" className={btn.ghost}>
                Content only (.json)
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
