import { PickupPoint, Rayon, RouteSequence, ActivityLog } from '@/types/shuttle';

// ========== Excel Export ==========

export const exportToCSV = (
  filename: string,
  columns: string[],
  data: Record<string, unknown>[]
): void => {
  const csv = [
    columns.map(col => `"${col}"`).join(','),
    ...data.map(row =>
      columns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return value;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportPickupPointsToCSV = (pickupPoints: PickupPoint[]): void => {
  const columns = ['Code', 'Name', 'Rayon', 'Address', 'City', 'District', 'Phone', 'Contact Person', 'Status', 'Latitude', 'Longitude'];
  const data = pickupPoints.map(pp => ({
    Code: pp.code,
    Name: pp.name,
    Rayon: pp.rayon,
    Address: pp.address,
    City: pp.city,
    District: pp.district,
    Phone: pp.phone,
    'Contact Person': pp.contactPerson,
    Status: pp.isActive ? 'Active' : 'Inactive',
    Latitude: pp.lat,
    Longitude: pp.lng,
  }));

  exportToCSV('pickup_points', columns, data);
};

export const exportRayonsToCSV = (rayons: Rayon[]): void => {
  const columns = ['Code', 'Name', 'Label', 'Description', 'Price Per Meter', 'Coverage', 'Pickup Points Count', 'Status'];
  const data = rayons.map(rayon => ({
    Code: rayon.code,
    Name: rayon.name,
    Label: rayon.label,
    Description: rayon.description,
    'Price Per Meter': rayon.pricePerMeter,
    Coverage: rayon.coverage,
    'Pickup Points Count': rayon.pickupPointCount,
    Status: rayon.isActive ? 'Active' : 'Inactive',
  }));

  exportToCSV('rayons', columns, data);
};

export const exportActivityLogsToCSV = (logs: ActivityLog[]): void => {
  const columns = ['Timestamp', 'Entity Type', 'Entity Name', 'Action', 'User', 'Changes', 'Details'];
  const data = logs.map(log => ({
    Timestamp: new Date(log.timestamp).toLocaleString('id-ID'),
    'Entity Type': log.entityType,
    'Entity Name': log.entityName,
    Action: log.action,
    User: log.userName,
    Changes: JSON.stringify(log.changes),
    Details: log.details || '',
  }));

  exportToCSV('activity_logs', columns, data);
};

// ========== PDF Export (Simple table format) ==========

export const generatePDFContent = (
  title: string,
  columns: string[],
  data: Record<string, unknown>[]
): string => {
  const rows = data.map(row => [
    ...columns.map(col => {
      const value = row[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }),
  ]);

  // Create simple HTML table that can be printed
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        .info { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { 
          background-color: #007bff; 
          color: white; 
          padding: 12px; 
          text-align: left;
          font-weight: bold;
          border: 1px solid #ddd;
        }
        td { 
          padding: 10px; 
          border: 1px solid #ddd;
          font-size: 12px;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f5f5f5; }
        @media print {
          body { margin: 0; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="info">
        Generated on: ${new Date().toLocaleString('id-ID')}
      </div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
};

export const exportPickupPointsToPDF = (pickupPoints: PickupPoint[]): void => {
  const columns = ['Code', 'Name', 'Rayon', 'Address', 'City', 'Phone', 'Status'];
  const data = pickupPoints.map(pp => ({
    Code: pp.code,
    Name: pp.name,
    Rayon: pp.rayon,
    Address: pp.address,
    City: pp.city,
    Phone: pp.phone,
    Status: pp.isActive ? 'Active' : 'Inactive',
  }));

  const html = generatePDFContent('Pickup Points Report', columns, data);
  const printWindow = window.open('', '', 'height=600,width=900');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

export const exportRayonsToPDF = (rayons: Rayon[]): void => {
  const columns = ['Code', 'Name', 'Label', 'Price Per Meter', 'Coverage', 'Pickup Points Count', 'Status'];
  const data = rayons.map(rayon => ({
    Code: rayon.code,
    Name: rayon.name,
    Label: rayon.label,
    'Price Per Meter': `Rp${rayon.pricePerMeter}`,
    Coverage: rayon.coverage,
    'Pickup Points Count': rayon.pickupPointCount,
    Status: rayon.isActive ? 'Active' : 'Inactive',
  }));

  const html = generatePDFContent('Rayons Report', columns, data);
  const printWindow = window.open('', '', 'height=600,width=900');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};

export const exportActivityLogsToPDF = (logs: ActivityLog[]): void => {
  const columns = ['Timestamp', 'Entity Type', 'Entity Name', 'Action', 'User'];
  const data = logs.map(log => ({
    Timestamp: new Date(log.timestamp).toLocaleString('id-ID'),
    'Entity Type': log.entityType,
    'Entity Name': log.entityName,
    Action: log.action,
    User: log.userName,
  }));

  const html = generatePDFContent('Activity Logs Report', columns, data);
  const printWindow = window.open('', '', 'height=600,width=900');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  }
};
