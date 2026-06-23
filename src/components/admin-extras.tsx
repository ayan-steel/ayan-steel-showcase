import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { uploadFile, deleteFile } from "@/lib/storage";
import { SignedImage } from "@/components/signed-image";

/* ===================== CUSTOM WORK ===================== */
type CustomWorkRow = { id: string; title: string; description: string | null; image_url: string | null; location: string | null; display_order: number; is_active: boolean };

export function CustomWorkAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["custom_work", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_work").select("*").order("display_order");
      if (error) throw error; return data as CustomWorkRow[];
    },
  });
  const [editing, setEditing] = useState<Partial<CustomWorkRow> | null>(null);

  async function save(form: Partial<CustomWorkRow>, file?: File | null) {
    try {
      let image_url = form.image_url || null;
      if (file) image_url = await uploadFile(file, "custom_work");
      const payload = {
        title: form.title!, description: form.description || null,
        image_url, location: form.location || null,
        display_order: form.display_order ?? 0, is_active: form.is_active ?? true,
      };
      if (form.id) {
        const { error } = await supabase.from("custom_work").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("custom_work").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["custom_work"] });
      qc.invalidateQueries({ queryKey: ["showroom"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(c: CustomWorkRow) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    const { error } = await supabase.from("custom_work").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    if (c.image_url) await deleteFile(c.image_url);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["custom_work"] });
    qc.invalidateQueries({ queryKey: ["showroom"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Custom Work</h2>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New Project</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Location</TableHead>
              <TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell><SignedImage path={c.image_url} className="h-12 w-16 rounded object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{c.title}<div className="text-xs text-muted-foreground truncate max-w-xs">{c.description}</div></TableCell>
                  <TableCell className="text-muted-foreground">{c.location || "—"}</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell>{c.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No custom work projects yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && <CustomWorkDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </section>
  );
}

function CustomWorkDialog({ initial, onClose, onSave }: { initial: Partial<CustomWorkRow>; onClose: () => void; onSave: (f: Partial<CustomWorkRow>, file?: File | null) => Promise<void> }) {
  const [form, setForm] = useState<Partial<CustomWorkRow>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Custom Work</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Location (optional)</Label><Input value={form.location || ""} placeholder="Katihar, Bihar" onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><Label>Image</Label>
            {form.image_url && <SignedImage path={form.image_url} className="mb-2 h-20 w-32 rounded object-cover bg-muted" />}
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1"><Label>Order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving || !form.title} onClick={async () => { setSaving(true); await onSave(form, file); setSaving(false); }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== VIDEOS ===================== */
type VideoRow = { id: string; title: string; description: string | null; video_type: string; video_url: string; thumbnail_url: string | null; display_order: number; is_active: boolean };

export function VideosAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["videos", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").order("display_order");
      if (error) throw error; return data as VideoRow[];
    },
  });
  const [editing, setEditing] = useState<Partial<VideoRow> | null>(null);

  async function save(form: Partial<VideoRow>, videoFile?: File | null, thumbFile?: File | null) {
    try {
      let video_url = form.video_url || "";
      let thumbnail_url = form.thumbnail_url || null;
      const video_type = form.video_type || "youtube";
      if (videoFile) video_url = await uploadFile(videoFile, "videos");
      if (thumbFile) thumbnail_url = await uploadFile(thumbFile, "video-thumbnails");
      if (!video_url) { toast.error("Provide a video URL or upload an MP4"); return; }
      const payload = {
        title: form.title!, description: form.description || null,
        video_type, video_url, thumbnail_url,
        display_order: form.display_order ?? 0, is_active: form.is_active ?? true,
      };
      if (form.id) {
        const { error } = await supabase.from("videos").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: ["showroom"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(v: VideoRow) {
    if (!confirm(`Delete "${v.title}"?`)) return;
    const { error } = await supabase.from("videos").delete().eq("id", v.id);
    if (error) return toast.error(error.message);
    if (v.video_type === "mp4" && v.video_url) await deleteFile(v.video_url);
    if (v.thumbnail_url) await deleteFile(v.thumbnail_url);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["videos"] });
    qc.invalidateQueries({ queryKey: ["showroom"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Videos</h2>
        <Button onClick={() => setEditing({ video_type: "youtube" })}><Plus className="h-4 w-4" /> New Video</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Thumb</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead>
              <TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((v) => (
                <TableRow key={v.id}>
                  <TableCell><SignedImage path={v.thumbnail_url} className="h-12 w-20 rounded object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{v.title}<div className="text-xs text-muted-foreground truncate max-w-xs">{v.video_url}</div></TableCell>
                  <TableCell><Badge variant="outline">{v.video_type.toUpperCase()}</Badge></TableCell>
                  <TableCell>{v.display_order}</TableCell>
                  <TableCell>{v.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(v)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No videos yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && <VideoDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </section>
  );
}

function VideoDialog({ initial, onClose, onSave }: { initial: Partial<VideoRow>; onClose: () => void; onSave: (f: Partial<VideoRow>, video?: File | null, thumb?: File | null) => Promise<void> }) {
  const [form, setForm] = useState<Partial<VideoRow>>({ video_type: "youtube", ...initial });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Video</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <Select value={form.video_type || "youtube"} onValueChange={(v) => setForm({ ...form, video_type: v, video_url: "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube Link</SelectItem>
                <SelectItem value="mp4">Upload MP4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.video_type === "youtube" ? (
            <div><Label>YouTube URL *</Label><Input value={form.video_url || ""} placeholder="https://youtube.com/watch?v=..." onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></div>
          ) : (
            <div><Label>MP4 File {form.video_url ? "(uploaded)" : "*"}</Label><Input type="file" accept="video/mp4" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} /></div>
          )}
          <div><Label>Thumbnail (optional)</Label>
            {form.thumbnail_url && <SignedImage path={form.thumbnail_url} className="mb-2 h-16 w-28 rounded object-cover bg-muted" />}
            <Input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1"><Label>Order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving || !form.title} onClick={async () => { setSaving(true); await onSave(form, videoFile, thumbFile); setSaving(false); }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
