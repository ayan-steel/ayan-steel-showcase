import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Package, Tag, Award, Image as ImageIcon, MessageSquare, LayoutDashboard, Loader2, Hammer, Video, Wrench } from "lucide-react";
import { uploadFile, deleteFile } from "@/lib/storage";
import { SignedImage } from "@/components/signed-image";
import { CustomWorkAdmin, VideosAdmin, RepairServicesAdmin } from "@/components/admin-extras";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Ayan Steel" }, { name: "robots", content: "noindex" }] }),
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/auth" }); return; }
      setEmail(u.user.email || "");
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin");
      const admin = (roles?.length ?? 0) > 0;
      setIsAdmin(admin);
      setReady(true);
    })();
  }, [navigate]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <strong>{email}</strong>. Only the shop owner has admin access.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
            <Link to="/"><Button>Go home</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background -mt-20 pt-20">
      <div className="border-b border-border bg-card">
        <div className="container-luxe flex items-center justify-between py-4">
          <div>
            <h1 className="font-display text-2xl">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/"><Button variant="outline" size="sm">View site</Button></Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="container-luxe py-8">
        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="products"><Package className="h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="h-4 w-4" /> Categories</TabsTrigger>
            <TabsTrigger value="brands"><Award className="h-4 w-4" /> Brands</TabsTrigger>
            <TabsTrigger value="custom_work"><Hammer className="h-4 w-4" /> Custom Work</TabsTrigger>
            <TabsTrigger value="videos"><Video className="h-4 w-4" /> Videos</TabsTrigger>
            <TabsTrigger value="banners"><ImageIcon className="h-4 w-4" /> Banners</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="h-4 w-4" /> Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6"><Overview /></TabsContent>
          <TabsContent value="products" className="mt-6"><ProductsAdmin /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoriesAdmin /></TabsContent>
          <TabsContent value="brands" className="mt-6"><BrandsAdmin /></TabsContent>
          <TabsContent value="custom_work" className="mt-6"><CustomWorkAdmin /></TabsContent>
          <TabsContent value="videos" className="mt-6"><VideosAdmin /></TabsContent>
          <TabsContent value="banners" className="mt-6"><BannersAdmin /></TabsContent>
          <TabsContent value="messages" className="mt-6"><MessagesAdmin /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function useCount(table: string) {
  return useQuery({
    queryKey: ["count", table],
    queryFn: async () => {
      const { count } = await supabase.from(table as any).select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });
}

function Overview() {
  const products = useCount("products");
  const categories = useCount("categories");
  const brands = useCount("brands");
  const banners = useCount("banners");
  const messages = useCount("messages");
  const unread = useQuery({
    queryKey: ["count", "messages", "unread"],
    queryFn: async () => {
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false);
      return count ?? 0;
    },
  });

  const cards = [
    { label: "Products", value: products.data, icon: Package },
    { label: "Categories", value: categories.data, icon: Tag },
    { label: "Brands", value: brands.data, icon: Award },
    { label: "Banners", value: banners.data, icon: ImageIcon },
    { label: "Messages", value: messages.data, icon: MessageSquare },
    { label: "Unread Messages", value: unread.data, icon: MessageSquare },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 font-display text-3xl">{c.value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}

/* ===================== CATEGORIES ===================== */
type Category = { id: string; name: string; slug: string; description: string | null; image_url: string | null; display_order: number; is_active: boolean };

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("display_order");
      if (error) throw error; return data as Category[];
    },
  });
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

  async function save(form: Partial<Category>, file?: File | null) {
    try {
      let image_url = form.image_url || null;
      if (file) image_url = await uploadFile(file, "categories");
      const payload = {
        name: form.name!, slug: form.slug || slugify(form.name!),
        description: form.description || null, image_url,
        display_order: form.display_order ?? 0, is_active: form.is_active ?? true,
      };
      if (form.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(c: Category) {
    if (!confirm(`Delete "${c.name}"?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    if (c.image_url) await deleteFile(c.image_url);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Categories</h2>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New Category</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Slug</TableHead>
              <TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell><SignedImage path={c.image_url} className="h-10 w-10 rounded object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell>{c.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No categories yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <CategoryDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />
      )}
    </section>
  );
}

function CategoryDialog({ initial, onClose, onSave }: { initial: Partial<Category>; onClose: () => void; onSave: (f: Partial<Category>, file?: File | null) => Promise<void> }) {
  const [form, setForm] = useState<Partial<Category>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} /></div>
          <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Image</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
          <div className="flex gap-4">
            <div className="flex-1"><Label>Order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving || !form.name} onClick={async () => { setSaving(true); await onSave(form, file); setSaving(false); }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== BRANDS ===================== */
type Brand = { id: string; name: string; slug: string; description: string | null; logo_url: string | null; display_order: number; is_active: boolean };

function BrandsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["brands", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("display_order");
      if (error) throw error; return data as Brand[];
    },
  });
  const [editing, setEditing] = useState<Partial<Brand> | null>(null);

  async function save(form: Partial<Brand>, file?: File | null) {
    try {
      let logo_url = form.logo_url || null;
      if (file) logo_url = await uploadFile(file, "brands");
      const payload = {
        name: form.name!, slug: form.slug || slugify(form.name!),
        description: form.description || null, logo_url,
        display_order: form.display_order ?? 0, is_active: form.is_active ?? true,
      };
      if (form.id) {
        const { error } = await supabase.from("brands").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brands").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["brands"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(b: Brand) {
    if (!confirm(`Delete "${b.name}"?`)) return;
    const { error } = await supabase.from("brands").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    if (b.logo_url) await deleteFile(b.logo_url);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["brands"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Brands</h2>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New Brand</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Logo</TableHead><TableHead>Name</TableHead><TableHead>Slug</TableHead>
              <TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell><SignedImage path={b.logo_url} className="h-10 w-10 rounded object-contain bg-muted" /></TableCell>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                  <TableCell>{b.display_order}</TableCell>
                  <TableCell>{b.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No brands yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && <BrandDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </section>
  );
}

function BrandDialog({ initial, onClose, onSave }: { initial: Partial<Brand>; onClose: () => void; onSave: (f: Partial<Brand>, file?: File | null) => Promise<void> }) {
  const [form, setForm] = useState<Partial<Brand>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Brand</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} /></div>
          <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Logo</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
          <div className="flex gap-4">
            <div className="flex-1"><Label>Order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving || !form.name} onClick={async () => { setSaving(true); await onSave(form, file); setSaving(false); }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== PRODUCTS ===================== */
type Product = {
  id: string; name: string; slug: string; description: string | null;
  price: number | null; sale_price: number | null;
  category_id: string | null; brand_id: string | null;
  images: string[]; specs: Record<string, any>;
  in_stock: boolean; is_featured: boolean; is_active: boolean; display_order: number;
  length_cm: number | null; breadth_cm: number | null; width_cm: number | null; height_cm: number | null;
  warranty: string | null; rating: number | null; material: string | null;
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("display_order");
      if (error) throw error; return data as Product[];
    },
  });
  const { data: cats } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });
  const { data: brs } = useQuery({
    queryKey: ["brands", "list"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });

  const catMap = useMemo(() => new Map((cats || []).map((c: any) => [c.id, c.name])), [cats]);
  const brMap = useMemo(() => new Map((brs || []).map((b: any) => [b.id, b.name])), [brs]);

  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  async function save(form: Partial<Product>, files: File[]) {
    try {
      const existing = form.images || [];
      const room = Math.max(0, 3 - existing.length);
      const toUpload = files.slice(0, room);
      const uploaded: string[] = [];
      for (const f of toUpload) uploaded.push(await uploadFile(f, "products"));
      const images = [...existing, ...uploaded].slice(0, 3);
      const payload: any = {
        name: form.name, slug: form.slug || slugify(form.name!),
        description: form.description || null,
        price: form.price ?? null, sale_price: form.sale_price ?? null,
        category_id: form.category_id || null, brand_id: form.brand_id || null,
        images, specs: form.specs || {},
        in_stock: form.in_stock ?? true,
        is_featured: form.is_featured ?? false,
        is_active: form.is_active ?? true,
        display_order: form.display_order ?? 0,
        length_cm: form.length_cm ?? null,
        breadth_cm: form.breadth_cm ?? null,
        width_cm: form.width_cm ?? null,
        height_cm: form.height_cm ?? null,
        warranty: form.warranty || null,
        rating: form.rating ?? null,
        material: form.material || null,
      };
      if (form.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["showroom"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    for (const img of p.images || []) await deleteFile(img);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Products</h2>
        <Button onClick={() => setEditing({ images: [], specs: {}, in_stock: true, is_active: true })}><Plus className="h-4 w-4" /> New Product</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Image</TableHead><TableHead>Name</TableHead>
              <TableHead>Category</TableHead><TableHead>Brand</TableHead>
              <TableHead>Price</TableHead><TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(products ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell><SignedImage path={p.images?.[0]} className="h-10 w-10 rounded object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category_id ? catMap.get(p.category_id) : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.brand_id ? brMap.get(p.brand_id) : "—"}</TableCell>
                  <TableCell>{p.sale_price ? <span><s className="text-muted-foreground">₹{p.price}</s> ₹{p.sale_price}</span> : p.price ? `₹${p.price}` : "—"}</TableCell>
                  <TableCell className="space-x-1">
                    {p.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
                    {p.is_featured && <Badge variant="outline">Featured</Badge>}
                    {!p.in_stock && <Badge variant="destructive">Out</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!products?.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <ProductDialog
          initial={editing}
          categories={cats || []}
          brands={brs || []}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </section>
  );
}

function ProductDialog({ initial, categories, brands, onClose, onSave }: {
  initial: Partial<Product>; categories: { id: string; name: string }[]; brands: { id: string; name: string }[];
  onClose: () => void; onSave: (f: Partial<Product>, files: File[]) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Product>>({ images: [], specs: {}, ...initial });
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  function removeExistingImage(idx: number) {
    const imgs = [...(form.images || [])];
    imgs.splice(idx, 1);
    setForm({ ...form, images: imgs });
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })} /></div>
          <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea rows={4} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Price (₹)</Label><Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? null : Number(e.target.value) })} /></div>
            <div><Label>Sale Price (₹)</Label><Input type="number" value={form.sale_price ?? ""} onChange={(e) => setForm({ ...form, sale_price: e.target.value === "" ? null : Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category_id ?? "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Select value={form.brand_id ?? "none"} onValueChange={(v) => setForm({ ...form, brand_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Images</Label>
            {!!(form.images?.length) && (
              <div className="flex gap-2 flex-wrap mb-2">
                {form.images!.map((img, i) => (
                  <div key={i} className="relative">
                    <SignedImage path={img} className="h-16 w-16 rounded object-cover bg-muted" />
                    <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 grid place-items-center text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
            <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
            <p className="text-xs text-muted-foreground mt-1">Up to 3 images. {3 - (form.images?.length ?? 0)} slot{(3 - (form.images?.length ?? 0)) !== 1 ? "s" : ""} remaining.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Length (cm)</Label><Input type="number" value={form.length_cm ?? ""} onChange={(e) => setForm({ ...form, length_cm: e.target.value === "" ? null : Number(e.target.value) })} /></div>
            <div><Label>Breadth (cm)</Label><Input type="number" value={form.breadth_cm ?? ""} onChange={(e) => setForm({ ...form, breadth_cm: e.target.value === "" ? null : Number(e.target.value) })} /></div>
            <div><Label>Width (cm)</Label><Input type="number" value={form.width_cm ?? ""} onChange={(e) => setForm({ ...form, width_cm: e.target.value === "" ? null : Number(e.target.value) })} /></div>
            <div><Label>Height (cm)</Label><Input type="number" value={form.height_cm ?? ""} onChange={(e) => setForm({ ...form, height_cm: e.target.value === "" ? null : Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Warranty</Label><Input value={form.warranty ?? ""} placeholder="5 Years" onChange={(e) => setForm({ ...form, warranty: e.target.value })} /></div>
            <div><Label>Rating (0–5)</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating ?? ""} onChange={(e) => setForm({ ...form, rating: e.target.value === "" ? null : Number(e.target.value) })} /></div>
            <div><Label>Material</Label><Input value={form.material ?? ""} placeholder="Steel, Wood…" onChange={(e) => setForm({ ...form, material: e.target.value })} /></div>
          </div>
          <div>
            <Label>Specifications (JSON, e.g. {`{"Material":"Steel","Warranty":"2 years"}`})</Label>
            <Textarea
              rows={3}
              value={JSON.stringify(form.specs || {}, null, 2)}
              onChange={(e) => {
                try { setForm({ ...form, specs: JSON.parse(e.target.value || "{}") }); } catch { /* keep typing */ }
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Order</Label><Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.in_stock ?? true} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} /><span className="text-sm">In stock</span></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_featured ?? false} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /><span className="text-sm">Featured</span></div>
            <div className="flex items-end gap-2 pb-2"><Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><span className="text-sm">Active</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={saving || !form.name} onClick={async () => { setSaving(true); await onSave(form, files); setSaving(false); }}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===================== BANNERS ===================== */
type Banner = { id: string; title: string; subtitle: string | null; image_url: string; link_url: string | null; display_order: number; is_active: boolean };

function BannersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["banners", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("display_order");
      if (error) throw error; return data as Banner[];
    },
  });
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);

  async function save(form: Partial<Banner>, file?: File | null) {
    try {
      let image_url = form.image_url || "";
      if (file) image_url = await uploadFile(file, "banners");
      if (!image_url) { toast.error("Image required"); return; }
      const payload = {
        title: form.title!, subtitle: form.subtitle || null,
        image_url, link_url: form.link_url || null,
        display_order: form.display_order ?? 0, is_active: form.is_active ?? true,
      };
      if (form.id) {
        const { error } = await supabase.from("banners").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["banners"] });
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(b: Banner) {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const { error } = await supabase.from("banners").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    if (b.image_url) await deleteFile(b.image_url);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["banners"] });
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl">Banners</h2>
        <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> New Banner</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Link</TableHead>
              <TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((b) => (
                <TableRow key={b.id}>
                  <TableCell><SignedImage path={b.image_url} className="h-12 w-20 rounded object-cover bg-muted" /></TableCell>
                  <TableCell className="font-medium">{b.title}<div className="text-xs text-muted-foreground">{b.subtitle}</div></TableCell>
                  <TableCell className="text-muted-foreground text-xs">{b.link_url || "—"}</TableCell>
                  <TableCell>{b.display_order}</TableCell>
                  <TableCell>{b.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No banners yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && <BannerDialog initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </section>
  );
}

function BannerDialog({ initial, onClose, onSave }: { initial: Partial<Banner>; onClose: () => void; onSave: (f: Partial<Banner>, file?: File | null) => Promise<void> }) {
  const [form, setForm] = useState<Partial<Banner>>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{form.id ? "Edit" : "New"} Banner</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Title *</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Subtitle</Label><Input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div><Label>Image {form.id ? "" : "*"}</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {form.image_url && <SignedImage path={form.image_url} className="mt-2 h-20 w-40 rounded object-cover bg-muted" />}
          </div>
          <div><Label>Link URL</Label><Input value={form.link_url || ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/products" /></div>
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

/* ===================== MESSAGES ===================== */
type Message = { id: string; name: string; email: string; phone: string | null; subject: string | null; message: string; is_read: boolean; created_at: string };

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data as Message[];
    },
  });
  const [open, setOpen] = useState<Message | null>(null);

  async function toggleRead(m: Message) {
    await supabase.from("messages").update({ is_read: !m.is_read }).eq("id", m.id);
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["count", "messages"] });
  }
  async function remove(m: Message) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("messages").delete().eq("id", m.id);
    qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <section>
      <h2 className="font-display text-xl mb-4">Messages</h2>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>From</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(data ?? []).map((m) => (
                <TableRow key={m.id} className={m.is_read ? "" : "font-medium"}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                  <TableCell>{m.name}<div className="text-xs text-muted-foreground">{m.email}</div></TableCell>
                  <TableCell>{m.subject || "—"}</TableCell>
                  <TableCell>{m.is_read ? <Badge variant="secondary">Read</Badge> : <Badge>New</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => { setOpen(m); if (!m.is_read) toggleRead(m); }}>View</Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No messages yet.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}

      {open && (
        <Dialog open onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{open.subject || "Message"}</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <div><strong>From:</strong> {open.name} &lt;{open.email}&gt;</div>
              {open.phone && <div><strong>Phone:</strong> <a href={`tel:${open.phone}`} className="underline">{open.phone}</a></div>}
              <div className="text-xs text-muted-foreground">{new Date(open.created_at).toLocaleString()}</div>
              <div className="mt-4 whitespace-pre-wrap rounded border border-border bg-muted/30 p-3">{open.message}</div>
            </div>
            <DialogFooter>
              <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject || "Your inquiry")}`}>
                <Button>Reply via Email</Button>
              </a>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
