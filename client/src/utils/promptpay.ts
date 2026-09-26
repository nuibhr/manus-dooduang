import QRCode from 'qrcode';

/**
 * CRC16-CCITT calculation for EMVCo standard
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Helper to build EMV Tag-Length-Value format
 */
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Format PromptPay target ID (Phone or Thai National ID)
 */
export function formatPromptPayTarget(target: string): { type: 'phone' | 'idcard' | 'unknown'; formatted: string } {
  const cleaned = target.replace(/[^0-9]/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // 0812345678 -> 0066812345678
    return {
      type: 'phone',
      formatted: '0066' + cleaned.substring(1),
    };
  } else if (cleaned.length === 9 && (cleaned.startsWith('8') || cleaned.startsWith('9') || cleaned.startsWith('6'))) {
    return {
      type: 'phone',
      formatted: '0066' + cleaned,
    };
  } else if (cleaned.length === 13) {
    return {
      type: 'idcard',
      formatted: cleaned,
    };
  }
  return {
    type: 'unknown',
    formatted: cleaned,
  };
}

/**
 * Generate EMVCo PromptPay QR string (Thai Standard)
 */
export function generatePromptPayPayload(target: string, amount?: number): string {
  const targetInfo = formatPromptPayTarget(target);

  // Payload Format Indicator (00)
  let payload = tlv('00', '01');

  // Point of Initiation Method (01): 11 for static, 12 for dynamic with amount
  payload += tlv('01', amount && amount > 0 ? '12' : '11');

  // Merchant Account Information (Tag 29) for PromptPay
  let merchantInfo = tlv('00', 'A000000677010111'); // PromptPay AID
  if (targetInfo.type === 'phone') {
    merchantInfo += tlv('01', targetInfo.formatted);
  } else {
    merchantInfo += tlv('02', targetInfo.formatted);
  }
  payload += tlv('29', merchantInfo);

  // Transaction Currency (53): 764 = THB
  payload += tlv('53', '764');

  // Transaction Amount (54) if provided
  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += tlv('54', formattedAmount);
  }

  // Country Code (58): TH
  payload += tlv('58', 'TH');

  // Add Tag 63 (CRC) with placeholder
  const payloadWithCrcTag = payload + '6304';
  const checksum = crc16(payloadWithCrcTag);

  return payloadWithCrcTag + checksum;
}

/**
 * Generates base64 QR Code image data URL for PromptPay
 */
export async function generatePromptPayQRCode(target: string, amount?: number): Promise<string> {
  const payload = generatePromptPayPayload(target, amount);
  try {
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#002D62', // Deep PromptPay Blue
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    throw err;
  }
}
