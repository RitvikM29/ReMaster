import Card from "@/components/Card";
import { useSettings } from "@/services/settingsStore";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold text-white">Control distractions</h1>
        <p className="text-sm text-slate-400">Tune your rules for deep, consistent focus.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Focus Rules</h3>
          <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
            Idle auto-pause
            <input
              type="checkbox"
              checked={settings.idleAutoPause}
              onChange={(event) => updateSettings({ idleAutoPause: event.target.checked })}
              className="h-4 w-4 accent-primary"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-400">
            Idle threshold (sec)
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              type="number"
              min={5}
              value={settings.idleThresholdSeconds}
              onChange={(event) => updateSettings({ idleThresholdSeconds: Number(event.target.value) })}
            />
          </label>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Distraction Settings</h3>
          <label className="mt-4 block text-sm text-slate-400">
            Rule
            <select
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              value={settings.distractionRule}
              onChange={(event) =>
                updateSettings({
                  distractionRule: event.target.value as "leave-remaster" | "any-non-allowlisted"
                })
              }
            >
              <option value="leave-remaster">Count only when leaving ReMaster</option>
              <option value="any-non-allowlisted">Count any non-allowlisted app</option>
            </select>
          </label>
          <label className="mt-4 block text-sm text-slate-400">
            App allowlist
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              value={settings.allowlist.join(", ")}
              onChange={(event) =>
                updateSettings({
                  allowlist: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                })
              }
              placeholder="ReMaster, Visual Studio Code"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-400">
            App blocklist
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
              value={settings.blocklist.join(", ")}
              onChange={(event) =>
                updateSettings({
                  blocklist: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                })
              }
              placeholder="Slack, Discord"
            />
          </label>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold">Idle Settings</h3>
        <div className="mt-3 text-sm text-slate-400">
          Idle time contributes to focus score penalties and optional auto-pause.
        </div>
      </Card>
    </section>
  );
}
