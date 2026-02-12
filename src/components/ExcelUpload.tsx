import React, { useCallback } from 'react';
import { useAppState } from '@/context/AppContext';
import { TeamData } from '@/types/maturity';
import { Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const ExcelUpload: React.FC = () => {
  const { setTeams } = useAppState();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const teams: TeamData[] = json.map((row) => ({
          name: String(row['Team'] || row['name'] || 'Unknown'),
          maturity: Number(row['Maturity'] || row['maturity'] || 0),
          performance: Number(row['Performance'] || row['performance'] || 0),
          agility: Number(row['Agility'] || row['agility'] || 0),
          stability: Number(row['Stability'] || row['stability'] || 0),
          platform: String(row['Platform'] || row['platform'] || 'Unknown'),
          pillar: String(row['Pillar'] || row['pillar'] || 'Unknown'),
        }));

        setTeams(teams);
        toast({ title: 'Data imported', description: `${teams.length} teams loaded successfully.` });
      } catch {
        toast({ title: 'Import failed', description: 'Please check your Excel format.', variant: 'destructive' });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }, [setTeams]);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-card-foreground mb-2">Upload Data</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload an Excel/CSV file with columns: Team, Maturity, Performance, Agility, Stability, Platform, Pillar
      </p>
      <div className="flex flex-wrap gap-3">
        <label>
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Choose Excel File
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            </span>
          </Button>
        </label>
        <a href="/sample-template.csv" download="sample-template.csv">
          <Button variant="secondary" size="default">
            <Download className="w-4 h-4 mr-2" />
            Download Sample Template
          </Button>
        </a>
      </div>
    </div>
  );
};

export default ExcelUpload;
