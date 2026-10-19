import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { removeAdmin } from "../../actions";
import { AdminHeader, btn, Card } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await requireAdmin();
  const db = readDb();
  return (
    <>
      <AdminHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Site settings">
          <SettingsForm funeralUrl={db.settings.funeralCompanionUrl} keepQuestions={db.settings.keepAnonymisedQuestions} />
        </Card>
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
          <Card title="Export content" description="Download every page, listing, topic and download record as one file, for backup or moving hosts.">
            <a href="/admin/export" className={btn.secondary}>
              <Download className="size-4" aria-hidden /> Download content export
            </a>
          </Card>
        </div>
      </div>
    </>
  );
}
