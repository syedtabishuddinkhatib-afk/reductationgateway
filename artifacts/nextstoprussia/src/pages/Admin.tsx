import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  isLoggedIn, logout, fetchAdminData, saveAdminData,
  fetchSiteContent, saveSiteContent, uploadImage, fetchLeads, clearLeads, changePassword
} from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import {
  LogOut, Settings, Building2, GraduationCap, DollarSign,
  Star, Image as ImageIcon, Users, Plus, Trash2, Edit3,
  Save, X, Upload, LayoutDashboard, FileText, Eye, EyeOff, Lock
} from "lucide-react";

type Tab = "content" | "services" | "universities" | "fees" | "testimonials" | "gallery" | "leads" | "security";

interface SiteContent {
  hero: { announcement: string; title: string; tagline: string; subtitle: string; whatsappNumber: string; telegramLink: string };
  about: { founderName: string; founderTitle: string; bio: string; experience: string; studentsPlaced: string; partnerUniversities: string; countriesServed: string; successRate: string };
  contact: { email: string; phone: string; address: string; whatsappNumber: string; telegramUsername: string; mapEmbedUrl: string };
  notifications: { whatsappNumber: string; telegramBotToken: string; telegramChatId: string };
}

function useAdminData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loader()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function save(saver: (d: T) => Promise<void>) {
    if (!data) return;
    setSaving(true);
    try {
      await saver(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return { data, setData, loading, error, saving, saved, save };
}

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 mt-6">
      <Button onClick={onSave} disabled={saving} className="gap-2">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </Button>
      {saved && <span className="text-green-600 text-sm font-medium">✓ Changes saved successfully</span>}
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      )}
    </div>
  );
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch {
      setErr("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or upload file"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="shrink-0">
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "..." : "Upload"}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
      {value && (
        <img src={value} alt="" className="mt-2 h-16 w-auto rounded object-cover border border-slate-100" onError={(e) => (e.currentTarget.style.display = "none")} />
      )}
    </div>
  );
}

function SiteContentTab() {
  const { data, setData, loading, saving, saved, save } = useAdminData<SiteContent>(fetchSiteContent as () => Promise<SiteContent>);

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;
  if (!data) return null;

  const update = (section: keyof SiteContent, key: string, val: string) => {
    setData({ ...data, [section]: { ...data[section], [key]: val } });
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b">Hero Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Announcement Banner" value={data.hero.announcement} onChange={(v) => update("hero", "announcement", v)} />
          <Field label="Site Title" value={data.hero.title} onChange={(v) => update("hero", "title", v)} />
          <Field label="Tagline" value={data.hero.tagline} onChange={(v) => update("hero", "tagline", v)} />
          <Field label="WhatsApp Number (with country code)" value={data.hero.whatsappNumber} onChange={(v) => update("hero", "whatsappNumber", v)} />
          <Field label="Telegram Link" value={data.hero.telegramLink} onChange={(v) => update("hero", "telegramLink", v)} />
          <div className="md:col-span-2">
            <Field label="Hero Subtitle" value={data.hero.subtitle} onChange={(v) => update("hero", "subtitle", v)} multiline />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b">About Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Founder Name" value={data.about.founderName} onChange={(v) => update("about", "founderName", v)} />
          <Field label="Founder Title" value={data.about.founderTitle} onChange={(v) => update("about", "founderTitle", v)} />
          <Field label="Years of Experience" value={data.about.experience} onChange={(v) => update("about", "experience", v)} />
          <Field label="Students Placed" value={data.about.studentsPlaced} onChange={(v) => update("about", "studentsPlaced", v)} />
          <Field label="Partner Universities" value={data.about.partnerUniversities} onChange={(v) => update("about", "partnerUniversities", v)} />
          <Field label="Countries Served" value={data.about.countriesServed} onChange={(v) => update("about", "countriesServed", v)} />
          <Field label="Success Rate" value={data.about.successRate} onChange={(v) => update("about", "successRate", v)} />
          <div className="md:col-span-2">
            <Field label="Founder Bio" value={data.about.bio} onChange={(v) => update("about", "bio", v)} multiline />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-4 pb-2 border-b">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email" value={data.contact.email} onChange={(v) => update("contact", "email", v)} type="email" />
          <Field label="Phone" value={data.contact.phone} onChange={(v) => update("contact", "phone", v)} />
          <Field label="WhatsApp Number" value={data.contact.whatsappNumber} onChange={(v) => update("contact", "whatsappNumber", v)} />
          <Field label="Telegram Username" value={data.contact.telegramUsername} onChange={(v) => update("contact", "telegramUsername", v)} />
          <div className="md:col-span-2">
            <Field label="Office Address" value={data.contact.address} onChange={(v) => update("contact", "address", v)} />
          </div>
          <div className="md:col-span-2">
            <Field label="Google Maps Embed URL" value={data.contact.mapEmbedUrl} onChange={(v) => update("contact", "mapEmbedUrl", v)} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-slate-900 mb-1 pb-2 border-b">Lead Notifications</h3>
        <p className="text-sm text-slate-500 mb-4">
          Enter your WhatsApp number and Telegram bot details so that every new student inquiry is forwarded to you instantly.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number (with country code)</label>
            <input
              type="tel"
              value={data.notifications?.whatsappNumber ?? ""}
              onChange={(e) => update("notifications", "whatsappNumber", e.target.value)}
              placeholder="e.g. +971501234567"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-xs text-slate-400 mt-1">Students will be redirected to this number after submitting the form.</p>
          </div>
          <div />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Bot Token</label>
            <input
              type="text"
              value={data.notifications?.telegramBotToken ?? ""}
              onChange={(e) => update("notifications", "telegramBotToken", e.target.value)}
              placeholder="e.g. 123456789:AABBccDDeeFF..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Create a bot via @BotFather on Telegram and paste the token here.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Chat ID</label>
            <input
              type="text"
              value={data.notifications?.telegramChatId ?? ""}
              onChange={(e) => update("notifications", "telegramChatId", e.target.value)}
              placeholder="e.g. -1001234567890"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Your personal chat ID or a group/channel ID where the bot has been added.</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 space-y-1">
          <p><strong>How to set up Telegram notifications:</strong></p>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>Message @BotFather on Telegram → /newbot → copy the token above</li>
            <li>Start a chat with your bot, or add it to a group</li>
            <li>Get your Chat ID by messaging @userinfobot (personal) or @getidsbot (group)</li>
            <li>Paste both values above and save</li>
          </ol>
        </div>
      </section>

      <SaveBar saving={saving} saved={saved} onSave={() => save((d) => saveSiteContent(d))} />
    </div>
  );
}

function ServicesTab() {
  interface Service { id: string; title: string; description: string; icon: string }
  const { data, setData, loading, saving, saved, save } = useAdminData<Service[]>(() => fetchAdminData("services") as Promise<Service[]>);
  const [editing, setEditing] = useState<number | null>(null);

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;
  if (!data) return null;

  const iconOptions = ["Stethoscope","Cog","Plane","Briefcase","FileCheck","Home","Car","Users","Star","Globe"];

  function addNew() {
    const newItem: Service = { id: Date.now().toString(), title: "New Service", description: "Description here", icon: "Star" };
    setData([...data, newItem]);
    setEditing(data.length);
  }

  function remove(i: number) {
    setData(data.filter((_, idx) => idx !== i));
  }

  function update(i: number, key: keyof Service, val: string) {
    setData(data.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{data.length} services</p>
        <Button size="sm" onClick={addNew} className="gap-2"><Plus className="w-4 h-4" /> Add Service</Button>
      </div>
      {data.map((s, i) => (
        <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{s.icon}</span>
              <span className="font-medium text-slate-900">{s.title}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing(editing === i ? null : i); }} className="text-slate-400 hover:text-primary p-1"><Edit3 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {editing === i && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200">
              <Field label="Title" value={s.title} onChange={(v) => update(i, "title", v)} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                <select value={s.icon} onChange={(e) => update(i, "icon", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Field label="Description" value={s.description} onChange={(v) => update(i, "description", v)} multiline />
              </div>
            </div>
          )}
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save((d) => saveAdminData("services", d))} />
    </div>
  );
}

function UniversitiesTab() {
  interface University { id: string; name: string; city: string; logo: string; courses: string[]; tuitionRange: string; description: string; ranking: string }
  const { data, setData, loading, saving, saved, save } = useAdminData<University[]>(() => fetchAdminData("universities") as Promise<University[]>);
  const [editing, setEditing] = useState<number | null>(null);

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;
  if (!data) return null;

  function addNew() {
    const u: University = { id: Date.now().toString(), name: "New University", city: "", logo: "", courses: ["MBBS"], tuitionRange: "$0 - $0/yr", description: "", ranking: "" };
    setData([...data, u]);
    setEditing(data.length);
  }

  function remove(i: number) { setData(data.filter((_, idx) => idx !== i)); }

  function update(i: number, key: keyof University, val: string | string[]) {
    setData(data.map((u, idx) => idx === i ? { ...u, [key]: val } : u));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{data.length} universities</p>
        <Button size="sm" onClick={addNew} className="gap-2"><Plus className="w-4 h-4" /> Add University</Button>
      </div>
      {data.map((u, i) => (
        <div key={u.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div>
              <span className="font-medium text-slate-900">{u.name}</span>
              <span className="text-slate-400 text-sm ml-2">— {u.city}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing(editing === i ? null : i); }} className="text-slate-400 hover:text-primary p-1"><Edit3 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {editing === i && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200">
              <Field label="University Name" value={u.name} onChange={(v) => update(i, "name", v)} />
              <Field label="City" value={u.city} onChange={(v) => update(i, "city", v)} />
              <Field label="Tuition Range (e.g. $4,500 - $6,000/yr)" value={u.tuitionRange} onChange={(v) => update(i, "tuitionRange", v)} />
              <Field label="Ranking" value={u.ranking} onChange={(v) => update(i, "ranking", v)} />
              <div className="md:col-span-2">
                <ImageUploadField label="Logo / Image URL" value={u.logo} onChange={(v) => update(i, "logo", v)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Courses (comma separated)</label>
                <input type="text" value={u.courses.join(", ")} onChange={(e) => update(i, "courses", e.target.value.split(",").map((c) => c.trim()).filter(Boolean))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="md:col-span-2">
                <Field label="Description" value={u.description} onChange={(v) => update(i, "description", v)} multiline />
              </div>
            </div>
          )}
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save((d) => saveAdminData("universities", d))} />
    </div>
  );
}

function FeesTab() {
  interface UnivFee { university: string; city: string; course: string; tuitionPerYear: number; hostelFee: number; totalEstimated: number }
  interface ConsFee { id: string; service: string; price: number; description: string; currency: string }
  const univFees = useAdminData<UnivFee[]>(() => fetchAdminData("universityFees") as Promise<UnivFee[]>);
  const consFees = useAdminData<ConsFee[]>(() => fetchAdminData("consultancyFees") as Promise<ConsFee[]>);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">University Fees</h3>
          <Button size="sm" onClick={() => univFees.setData([...(univFees.data || []), { university: "", city: "", course: "", tuitionPerYear: 0, hostelFee: 0, totalEstimated: 0 }])} className="gap-2"><Plus className="w-4 h-4" /> Add Row</Button>
        </div>
        {univFees.loading ? <div className="text-slate-500 text-sm">Loading...</div> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["University", "City", "Course", "Tuition/yr ($)", "Hostel ($)", "Total ($)", ""].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(univFees.data || []).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {(["university", "city", "course"] as const).map((key) => (
                      <td key={key} className="px-2 py-1.5">
                        <input type="text" value={row[key]} onChange={(e) => univFees.setData(univFees.data!.map((r, ri) => ri === i ? { ...r, [key]: e.target.value } : r))} className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                      </td>
                    ))}
                    {(["tuitionPerYear", "hostelFee", "totalEstimated"] as const).map((key) => (
                      <td key={key} className="px-2 py-1.5">
                        <input type="number" value={row[key]} onChange={(e) => univFees.setData(univFees.data!.map((r, ri) => ri === i ? { ...r, [key]: Number(e.target.value) } : r))} className="w-24 px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button onClick={() => univFees.setData(univFees.data!.filter((_, ri) => ri !== i))} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SaveBar saving={univFees.saving} saved={univFees.saved} onSave={() => univFees.save((d) => saveAdminData("universityFees", d))} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-900">Consultancy Fees</h3>
          <Button size="sm" onClick={() => consFees.setData([...(consFees.data || []), { id: Date.now().toString(), service: "New Service", price: 0, description: "", currency: "USD" }])} className="gap-2"><Plus className="w-4 h-4" /> Add Service</Button>
        </div>
        {consFees.loading ? <div className="text-slate-500 text-sm">Loading...</div> : (
          <div className="space-y-3">
            {(consFees.data || []).map((f, i) => (
              <div key={f.id} className="border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <Field label="Service Name" value={f.service} onChange={(v) => consFees.setData(consFees.data!.map((x, xi) => xi === i ? { ...x, service: v } : x))} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                  <input type="number" value={f.price} onChange={(e) => consFees.setData(consFees.data!.map((x, xi) => xi === i ? { ...x, price: Number(e.target.value) } : x))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Field label="Description" value={f.description} onChange={(v) => consFees.setData(consFees.data!.map((x, xi) => xi === i ? { ...x, description: v } : x))} />
                  </div>
                  <button onClick={() => consFees.setData(consFees.data!.filter((_, xi) => xi !== i))} className="text-red-400 hover:text-red-600 p-2 mb-0.5 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <SaveBar saving={consFees.saving} saved={consFees.saved} onSave={() => consFees.save((d) => saveAdminData("consultancyFees", d))} />
      </div>
    </div>
  );
}

function TestimonialsTab() {
  interface Testimonial { id: string; name: string; university: string; country: string; feedback: string; course: string; year: string }
  const { data, setData, loading, saving, saved, save } = useAdminData<Testimonial[]>(() => fetchAdminData("testimonials") as Promise<Testimonial[]>);
  const [editing, setEditing] = useState<number | null>(null);

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;
  if (!data) return null;

  function addNew() {
    const t: Testimonial = { id: Date.now().toString(), name: "", university: "", country: "", feedback: "", course: "", year: new Date().getFullYear().toString() };
    setData([...data, t]);
    setEditing(data.length);
  }

  function update(i: number, key: keyof Testimonial, v: string) {
    setData(data.map((t, idx) => idx === i ? { ...t, [key]: v } : t));
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{data.length} testimonials</p>
        <Button size="sm" onClick={addNew} className="gap-2"><Plus className="w-4 h-4" /> Add Testimonial</Button>
      </div>
      {data.map((t, i) => (
        <div key={t.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div>
              <span className="font-medium text-slate-900">{t.name || "Unnamed"}</span>
              <span className="text-slate-400 text-sm ml-2">{t.university} — {t.country}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing(editing === i ? null : i); }} className="text-slate-400 hover:text-primary p-1"><Edit3 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setData(data.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {editing === i && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200">
              <Field label="Student Name" value={t.name} onChange={(v) => update(i, "name", v)} />
              <Field label="Country" value={t.country} onChange={(v) => update(i, "country", v)} />
              <Field label="University" value={t.university} onChange={(v) => update(i, "university", v)} />
              <Field label="Course" value={t.course} onChange={(v) => update(i, "course", v)} />
              <Field label="Year" value={t.year} onChange={(v) => update(i, "year", v)} />
              <div className="md:col-span-2">
                <Field label="Feedback" value={t.feedback} onChange={(v) => update(i, "feedback", v)} multiline />
              </div>
            </div>
          )}
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save((d) => saveAdminData("testimonials", d))} />
    </div>
  );
}

function GalleryTab() {
  interface GalleryItem { id: string; type: string; src: string; thumbnail: string; caption: string; category: string }
  const { data, setData, loading, saving, saved, save } = useAdminData<GalleryItem[]>(() => fetchAdminData("gallery") as Promise<GalleryItem[]>);
  const [editing, setEditing] = useState<number | null>(null);

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;
  if (!data) return null;

  function addNew() {
    const g: GalleryItem = { id: Date.now().toString(), type: "image", src: "", thumbnail: "", caption: "", category: "campus" };
    setData([...data, g]);
    setEditing(data.length);
  }

  function update(i: number, key: keyof GalleryItem, v: string) {
    setData(data.map((g, idx) => idx === i ? { ...g, [key]: v } : g));
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{data.length} gallery items</p>
        <Button size="sm" onClick={addNew} className="gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>
      {data.map((g, i) => (
        <div key={g.id} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer" onClick={() => setEditing(editing === i ? null : i)}>
            <div className="flex items-center gap-3">
              {g.thumbnail && <img src={g.thumbnail} alt="" className="w-10 h-10 rounded object-cover border border-slate-100" onError={(e) => (e.currentTarget.style.display = "none")} />}
              <div>
                <span className="font-medium text-slate-900">{g.caption || "Untitled"}</span>
                <span className="text-slate-400 text-xs ml-2 bg-slate-100 px-2 py-0.5 rounded">{g.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing(editing === i ? null : i); }} className="text-slate-400 hover:text-primary p-1"><Edit3 className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); setData(data.filter((_, idx) => idx !== i)); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          {editing === i && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={g.type} onChange={(e) => update(i, "type", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="image">Image</option>
                  <option value="youtube">YouTube</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={g.category} onChange={(e) => update(i, "category", e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="campus">Campus</option>
                  <option value="student-life">Student Life</option>
                  <option value="videos">Videos</option>
                </select>
              </div>
              <Field label="Caption" value={g.caption} onChange={(v) => update(i, "caption", v)} />
              <div className="md:col-span-2">
                <ImageUploadField label="Image / Video URL" value={g.src} onChange={(v) => { update(i, "src", v); update(i, "thumbnail", v); }} />
              </div>
              <div className="md:col-span-2">
                <ImageUploadField label="Thumbnail URL (for videos)" value={g.thumbnail} onChange={(v) => update(i, "thumbnail", v)} />
              </div>
            </div>
          )}
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save((d) => saveAdminData("gallery", d))} />
    </div>
  );
}

function LeadsTab() {
  const [leads, setLeads] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLeads().then(setLeads).finally(() => setLoading(false));
  }, []);

  async function handleClear() {
    if (!confirm("Are you sure you want to delete all leads? This cannot be undone.")) return;
    setClearing(true);
    await clearLeads();
    setLeads([]);
    setClearing(false);
  }

  function downloadCsv() {
    if (!leads.length) return;
    const headers = Object.keys(leads[0]);
    const rows = leads.map((l) => headers.map((h) => `"${(l[h] || "").replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-slate-500 py-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-500">{leads.length} leads captured</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={downloadCsv} disabled={!leads.length} className="gap-2"><FileText className="w-4 h-4" /> Download CSV</Button>
          <Button size="sm" variant="outline" onClick={handleClear} disabled={clearing || !leads.length} className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"><Trash2 className="w-4 h-4" /> Clear All</Button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No leads yet. Form submissions will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {Object.keys(leads[0]).map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {Object.values(lead).map((v, j) => (
                    <td key={j} className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-xs truncate">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SecurityTab({ onLogout }: { onLogout: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    if (newPassword !== confirmPassword) {
      setResult({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setResult({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword(currentPassword, newPassword, newUsername || undefined);
      if (res.success) {
        setResult({ type: "success", message: "Credentials updated! You will be logged out now." });
        setTimeout(() => { onLogout(); }, 2000);
      } else {
        setResult({ type: "error", message: res.error || "Failed to update credentials." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Change Login Credentials</h3>
        <p className="text-sm text-slate-500">Update your admin username and password. You will be logged out after saving.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Username (optional)</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Leave blank to keep current username"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Password <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            required
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {result && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${result.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {result.message}
          </div>
        )}

        <Button type="submit" disabled={saving} className="gap-2 w-full">
          <Lock className="w-4 h-4" />
          {saving ? "Saving..." : "Update Credentials"}
        </Button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("content");

  useEffect(() => {
    if (!isLoggedIn()) navigate("/admin");
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate("/admin");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "content", label: "Site Content", icon: <Settings className="w-4 h-4" /> },
    { id: "services", label: "Services", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "universities", label: "Universities", icon: <Building2 className="w-4 h-4" /> },
    { id: "fees", label: "Fees", icon: <DollarSign className="w-4 h-4" /> },
    { id: "testimonials", label: "Testimonials", icon: <Star className="w-4 h-4" /> },
    { id: "gallery", label: "Gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "leads", label: "Leads", icon: <Users className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900">NextStopRussia</span>
              <span className="ml-2 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-2"><Eye className="w-4 h-4" /> View Site</Button>
            </a>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-red-600 border-red-200 hover:border-red-300 hover:text-red-700">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-sm shadow-primary/30" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              {activeTab === "content" && <SiteContentTab />}
              {activeTab === "services" && <ServicesTab />}
              {activeTab === "universities" && <UniversitiesTab />}
              {activeTab === "fees" && <FeesTab />}
              {activeTab === "testimonials" && <TestimonialsTab />}
              {activeTab === "gallery" && <GalleryTab />}
              {activeTab === "leads" && <LeadsTab />}
              {activeTab === "security" && <SecurityTab onLogout={handleLogout} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
