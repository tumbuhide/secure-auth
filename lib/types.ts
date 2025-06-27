// /lib/types.ts
import type { IDevice, IOS, IBrowser } from 'ua-parser-js';

export type ParsedSession = {
  id: number;
  ip_address: string | null;
  last_used_at: string;
  is_current: boolean;
  device: IDevice;
  os: IOS;
  browser: IBrowser;
};
