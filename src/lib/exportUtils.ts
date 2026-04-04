import { jsPDF } from 'jspdf';
import { Route, RoutePoint, Rayon } from '@/types/shuttle';

const quote = (value: unknown) => {
  return `"${String(value).replace(/"/g, '""')}"`;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPickupPointsToExcel = (
  points: RoutePoint[],
  routes: Route[],
  rayons: Rayon[]
) => {
  const headers = [
    'Kode',
    'Nama Titik',
    'Rute',
    'Rayon',
    'Status',
    'Latitude',
    'Longitude',
    'Alamat',
    'Harga',
  ];

  const rows = points.map((point) => {
    const route = routes.find((route) => route.id === point.routeId);
    const rayon = rayons.find((rayon) => rayon.id === point.rayonId);
    return [
      point.code,
      point.name,
      route?.name ?? 'N/A',
      rayon?.name ?? 'N/A',
      point.status,
      point.lat.toFixed(6),
      point.lng.toFixed(6),
      point.address || '-',
      point.price,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => quote(cell)).join(','))
    .join('\r\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  downloadBlob(blob, 'laporan-titik-jemput.csv');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const exportPickupPointsToPdf = (
  points: RoutePoint[],
  routes: Route[],
  rayons: Rayon[]
) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 16;
  const usableWidth = pageWidth - margin * 2;

  doc.setFontSize(18);
  doc.text('Laporan Titik Jemput', margin, 50);
  doc.setFontSize(11);
  doc.text(
    `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
    margin,
    68
  );

  const headers = [
    'Kode',
    'Nama Titik',
    'Rute',
    'Rayon',
    'Status',
    'Lat',
    'Lng',
    'Harga',
  ];

  const rows = points.map((point) => {
    const route = routes.find((route) => route.id === point.routeId);
    const rayon = rayons.find((rayon) => rayon.id === point.rayonId);
    return [
      point.code,
      point.name,
      route?.name ?? 'N/A',
      rayon?.name ?? 'N/A',
      point.status,
      point.lat.toFixed(5),
      point.lng.toFixed(5),
      formatCurrency(point.price),
    ];
  });

  const rowHeight = 18;
  const maxRowsPerPage = Math.floor((pageHeight - 120) / rowHeight) - 1;
  let y = 90;

  const renderRow = (row: string[], rowIndex: number) => {
    const columnWidths = [60, 130, 130, 100, 70, 60, 60, 100];
    let x = margin;

    row.forEach((cell, index) => {
      doc.text(String(cell), x, y);
      x += columnWidths[index];
    });
    y += rowHeight;
  };

  renderRow(headers, -1);
  y += 8;

  rows.forEach((row, index) => {
    if (index > 0 && index % maxRowsPerPage === 0) {
      doc.addPage();
      y = 60;
      renderRow(headers, -1);
      y += 8;
    }
    renderRow(row, index);
  });

  doc.save('laporan-titik-jemput.pdf');
};
