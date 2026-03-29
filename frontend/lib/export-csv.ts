import Papa from 'papaparse';

interface ExportOptions {
  filename: string;
  columns?: { key: string; header: string }[];
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions,
): void {
  const { filename, columns } = options;

  let exportData = data;
  let fields: string[] | undefined;

  if (columns) {
    fields = columns.map(c => c.header);
    exportData = data.map(row =>
      Object.fromEntries(columns.map(c => [c.header, row[c.key]])),
    ) as T[];
  }

  const csv = Papa.unparse(exportData, { columns: fields });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
