import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/app/_components/ui/card';
  
  export default function DashboardSettingsPage() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola pengaturan dan preferensi untuk dashboard Anda.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Preferensi</CardTitle>
            <CardDescription>
              Fitur ini sedang dalam pengembangan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Pengaturan lebih lanjut akan tersedia di sini di masa mendatang.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  