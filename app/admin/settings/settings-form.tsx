'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateSettingsAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';

type Setting = {
    key: string;
    value: any;
    description: string | null;
}

interface SettingsFormProps {
    settings: Setting[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
    </Button>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const initialState = { success: false, message: null };
  const [state, formAction] = useFormState(updateSettingsAction, initialState);

  return (
    <form action={formAction}>
        <div className="space-y-6">
            {settings.map((setting) => (
                <Card key={setting.key}>
                    <CardHeader>
                        <CardTitle className="capitalize">{setting.key.replace(/_/g, ' ')}</CardTitle>
                        {setting.description && (
                            <CardDescription>{setting.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        {Object.entries(setting.value).map(([field, value]) => (
                             <div className="grid gap-2" key={field}>
                                <Label htmlFor={`${setting.key}.${field}`} className="capitalize">
                                    {field.replace(/_/g, ' ')}
                                </Label>
                                <Input
                                    id={`${setting.key}.${field}`}
                                    name={`${setting.key}.${field}`}
                                    type="number"
                                    defaultValue={value as number}
                                    placeholder="Nilai dalam detik"
                                />
                             </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
        
        <div className="flex justify-end sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 mt-6 rounded-t-lg">
            <div className="flex items-center gap-4">
                 {state?.message && (
                    <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>
                        {state.message}
                    </p>
                )}
                <SubmitButton />
            </div>
        </div>
    </form>
  );
}
