import { pwaIconResponse } from '@/src/lib/pwaIcon';
export const dynamic = 'force-static';
export function GET() { return pwaIconResponse(512); }
