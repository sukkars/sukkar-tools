export const LS_KEY = 'steadfastApiKey';
export const LS_SECRET = 'steadfastSecretKey';
export const LS_AI_KEY = 'geminiApiKey_user';
export const LS_MODEL_KEY = 'geminiModel_user';
export const STEADFAST_API = 'https://portal.packzy.com/api/v1/create_order';

export function cleanNumberString(str: string): string {
  if (!str) return '';
  let cleaned = String(str).replace(/[^\d০-৯]/g, '');
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = 0; i < bn.length; i++) cleaned = cleaned.replace(new RegExp(bn[i], 'g'), en[i]);
  return cleaned;
}

export function cleanPrefixes(text: string): string {
  if (!text) return '';
  return text.replace(/^(নাম|Name|Customer|ঠিকানা|Address|ফোন|Phone|Mobile|মোবাইল|নাম্বার|Number|টাকা|COD|Amount|TK|টাক|টঃ)[:ঃ\-\s]*/gi, '').trim();
}

export interface OrderData {
  invoice: string;
  name: string;
  address: string;
  phone: string;
  cod: number;
  note?: string;
  item?: string;
  deliveryType?: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  parcelId?: string;
  trackingCode?: string;
  errorMsg?: string;
}

export function parseMessage(msg: string): Omit<OrderData, 'invoice' | 'status'> | null {
  const lines = msg.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) return null;
  const phoneRx = /^01\d{9}$/;
  const name = cleanPrefixes(lines[0]);
  const c1 = cleanNumberString(lines[1] || '');
  const c2 = cleanNumberString(lines[2] || '');
  let phone = '', addr = '';
  if (phoneRx.test(c1)) { phone = c1; addr = cleanPrefixes(lines[2]); }
  else if (phoneRx.test(c2)) { phone = c2; addr = cleanPrefixes(lines[1]); }
  else {
    for (const l of lines) {
      const p = cleanNumberString(l);
      if (phoneRx.test(p)) { phone = p; break; }
    }
    addr = cleanPrefixes(lines[1]);
  }
  let cod = 0;
  for (const l of lines) {
    if (l.toLowerCase().includes('tk') || l.includes('টাকা') || l.toLowerCase().includes('cod')) {
      cod = parseFloat(cleanNumberString(l)) || 0; break;
    }
  }
  if (cod === 0 && lines[3]) cod = parseFloat(cleanNumberString(lines[3])) || 0;
  return { name, address: addr, phone, cod };
}

export function generateInvoice(prefix = 'INV'): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrder(order: OrderData): Promise<OrderData> {
  const apiKey = localStorage.getItem(LS_KEY);
  const secretKey = localStorage.getItem(LS_SECRET);
  if (!apiKey || !secretKey) throw new Error('API কী অনুপস্থিত');

  const res = await fetch(STEADFAST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
    },
    body: JSON.stringify({
      invoice: order.invoice,
      recipient_name: order.name,
      recipient_address: order.address,
      recipient_phone: order.phone,
      cod_amount: order.cod,
      note: order.note || '',
      delivery_type: order.deliveryType ?? 0,
    }),
  });
  const data = await res.json();
  if (data?.status === 200) {
    return {
      ...order,
      status: 'success',
      parcelId: data.consignment?.consignment_id || 'N/A',
      trackingCode: data.consignment?.tracking_code || '',
    };
  }
  return { ...order, status: 'error', errorMsg: data.message || 'Unknown error' };
}

export function hasKeys(): boolean {
  return !!(localStorage.getItem(LS_KEY) && localStorage.getItem(LS_SECRET));
}
