import { useState } from 'react';
import { PickupPoint } from '@/types/shuttle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validatePickupPoint, ValidationError, isDuplicatePickupPoint } from '@/lib/validation';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';

interface PickupPointFormProps {
  pickupPoint?: PickupPoint;
  allPickupPoints?: PickupPoint[];
  onSubmit: (data: Omit<PickupPoint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PickupPointForm = ({ pickupPoint, allPickupPoints = [], onSubmit, onCancel, isLoading = false }: PickupPointFormProps) => {
  const [formData, setFormData] = useState<Partial<PickupPoint>>(
    pickupPoint || {
      code: '',
      name: '',
      rayon: 'A',
      address: '',
      city: '',
      district: '',
      lat: 3.5952,
      lng: 98.6722,
      phone: '',
      contactPerson: '',
      isActive: true,
      description: '',
      estimatedWaitTime: 10,
      maxCapacity: 30,
      facilities: [],
      operatingHours: { open: '05:00', close: '21:00' },
      createdBy: 'admin1',
      updatedBy: 'admin1',
    }
  );

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    setValidationErrors(prev => prev.filter(e => e.field !== field));
    setSuccessMessage(null);

    // Check for duplicates on code change
    if (field === 'code' && value && allPickupPoints.length > 0) {
      const duplicateCheck = isDuplicatePickupPoint(allPickupPoints, { ...formData, [field]: value as string }, pickupPoint?.id);
      if (duplicateCheck.isDuplicate) {
        setDuplicateWarning(`${duplicateCheck.duplicateFields.join(', ')} sudah ada dalam sistem`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleNestedChange = (parent: string, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleFacilitiesChange = (facility: string) => {
    const facilities = (formData.facilities || []) as string[];
    const newFacilities = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    setFormData(prev => ({ ...prev, facilities: newFacilities }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const errors = validatePickupPoint(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check duplicates
    if (allPickupPoints.length > 0) {
      const dupeCheck = isDuplicatePickupPoint(allPickupPoints, formData, pickupPoint?.id);
      if (dupeCheck.isDuplicate) {
        setDuplicateWarning(`Sudah ada titik jemput dengan: ${dupeCheck.duplicateFields.join(', ')}`);
        return;
      }
    }

    setValidationErrors([]);
    setDuplicateWarning(null);
    setSuccessMessage(`Titik jemput "${formData.name}" ${pickupPoint ? 'diperbarui' : 'ditambahkan'} berhasil`);

    setTimeout(() => {
      onSubmit(formData as Omit<PickupPoint, 'id' | 'createdAt' | 'updatedAt'>);
    }, 500);
  };

  const facilities = ['WiFi', 'Toilet', 'Mushola', 'Kantin', 'Lounge', 'Warung', 'Hotel'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {pickupPoint ? 'Edit Titik Jemput' : 'Tambah Titik Jemput Baru'}
          </CardTitle>
          <CardDescription>
            Isi informasi lengkap untuk {pickupPoint ? 'memperbarui' : 'mendaftarkan'} titik jemput
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="mt-2 space-y-1">
                    {validationErrors.map(error => (
                      <li key={error.field} className="text-sm">
                        {error.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{duplicateWarning}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informasi Dasar</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Titik Jemput *</Label>
                  <Input
                    id="code"
                    placeholder="PK-A-001"
                    value={formData.code || ''}
                    onChange={e => handleChange('code', e.target.value)}
                    disabled={isLoading || !!pickupPoint}
                  />
                  <p className="text-xs text-muted-foreground">Format: PK-[A-D]-[001]</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rayon">Rayon *</Label>
                  <Select value={formData.rayon} onValueChange={v => handleChange('rayon', v)}>
                    <SelectTrigger id="rayon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Rayon A (Dalam Kota)</SelectItem>
                      <SelectItem value="B">Rayon B (Antar Kota Dekat)</SelectItem>
                      <SelectItem value="C">Rayon C (Antar Kota Sedang)</SelectItem>
                      <SelectItem value="D">Rayon D (Antar Kota Jauh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Titik Jemput *</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Terminal Hermes"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat tentang lokasi titik jemput"
                  value={formData.description || ''}
                  onChange={e => handleChange('description', e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informasi Lokasi</h3>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap *</Label>
                <Textarea
                  id="address"
                  placeholder="Jl. Gatot Subroto No. 1"
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  disabled={isLoading}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota *</Label>
                  <Input
                    id="city"
                    placeholder="Medan"
                    value={formData.city || ''}
                    onChange={e => handleChange('city', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">Kecamatan *</Label>
                  <Input
                    id="district"
                    placeholder="Medan Helvetia"
                    value={formData.district || ''}
                    onChange={e => handleChange('district', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="061-4516543"
                    value={formData.phone || ''}
                    onChange={e => handleChange('phone', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude *</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    placeholder="3.5952"
                    value={formData.lat || ''}
                    onChange={e => handleChange('lat', parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude *</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    placeholder="98.6722"
                    value={formData.lng || ''}
                    onChange={e => handleChange('lng', parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informasi Kontak</h3>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Nama Kontak *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Pak Hendra"
                  value={formData.contactPerson || ''}
                  onChange={e => handleChange('contactPerson', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Operational Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Informasi Operasional</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Kapasitas Maks</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.maxCapacity || ''}
                    onChange={e => handleChange('maxCapacity', parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedWaitTime">Estimasi Waktu Tunggu (menit)</Label>
                  <Input
                    id="estimatedWaitTime"
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formData.estimatedWaitTime || ''}
                    onChange={e => handleChange('estimatedWaitTime', parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={v => handleChange('isActive', v === 'active')}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operatingHours">Jam Operasional</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Jam Buka</label>
                    <Input
                      type="time"
                      value={formData.operatingHours?.open || '05:00'}
                      onChange={e => handleNestedChange('operatingHours', 'open', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Jam Tutup</label>
                    <Input
                      type="time"
                      value={formData.operatingHours?.close || '21:00'}
                      onChange={e => handleNestedChange('operatingHours', 'close', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Fasilitas Tersedia</h3>

              <div className="grid grid-cols-4 gap-3">
                {facilities.map(facility => (
                  <label key={facility} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.facilities || []).includes(facility)}
                      onChange={() => handleFacilitiesChange(facility)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : pickupPoint ? 'Simpan Perubahan' : 'Tambah Titik Jemput'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PickupPointForm;
