import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RoutePoint } from "@/types/shuttle";
import { useShuttle } from "@/contexts/ShuttleContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nama lokasi minimal 2 karakter"),
  code: z.string().min(1, "Kode harus diisi"),
  order: z.number().min(1, "Urutan minimal 1"),
  address: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  lat: z.number(),
  lng: z.number(),
  notes: z.string().optional(),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  status: z.enum(['active', 'inactive']),
  rayonId: z.string().min(1, "Rayon harus dipilih"),
});

interface PointEditDialogProps {
  point: RoutePoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PointEditDialog = ({
  point,
  open,
  onOpenChange,
}: PointEditDialogProps) => {
  const { routePoints, setRoutePoints, rayons } = useShuttle();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      order: 1,
      address: "",
      lat: 0,
      lng: 0,
      notes: "",
      price: 0,
      status: 'active',
      rayonId: '',
    },
  });

  useEffect(() => {
    if (point) {
      form.reset({
        name: point.name,
        code: point.code,
        order: point.order,
        address: point.address || "",
        lat: point.lat,
        lng: point.lng,
        notes: point.notes || "",
        price: point.price || 0,
        status: point.status || 'active',
        rayonId: point.rayonId || '',
      });
    }
  }, [point, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!point) return;

    const normalizedCode = values.code.trim().toLowerCase();
    const normalizedName = values.name.trim().toLowerCase();
    const duplicate = routePoints.some(
      (p) =>
        p.id !== point.id &&
        p.routeId === point.routeId &&
        (
          p.code.trim().toLowerCase() === normalizedCode ||
          p.name.trim().toLowerCase() === normalizedName ||
          (p.lat === values.lat && p.lng === values.lng)
        )
    );

    if (duplicate) {
      toast.error('Duplikasi titik jemput ditemukan pada rute yang sama. Periksa kode, nama, atau koordinat.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRoutePoints((prev) =>
        prev.map((p) => (p.id === point.id ? { ...p, ...values } : p))
      );
      toast.success("Informasi titik jemput berhasil diperbarui");
      onOpenChange(false);
    } catch (error) {
      toast.error("Gagal memperbarui informasi titik jemput");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Titik Jemput</DialogTitle>
          <DialogDescription>
            Ubah informasi lengkap untuk titik jemput {point?.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urutan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rayonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rayon</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rayon" />
                        </SelectTrigger>
                        <SelectContent>
                          {rayons.map((rayon) => (
                            <SelectItem key={rayon.id} value={rayon.id}>{rayon.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Non-aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lokasi</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Masukkan alamat lengkap lokasi..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Contoh: Dekat halte bus, depan Indomaret..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">Harga Tiket (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="border-primary/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
