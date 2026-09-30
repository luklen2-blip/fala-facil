/**
 * Gerador Nativo de PIX EMV Copia-e-Cola (Bacen Oficial)
 * Cálculo rigoroso de redundância cíclica CRC-16 / CCITT-FALSE.
 */

export function generatePixPayload({
  pixKey = 'luklen2@gmail.com',
  name = 'Luciano Sant Anna',
  city = 'Rio de Janeiro',
  amount = '',
  txId = '***'
} = {}) {
  const formatField = (id, value) => {
    const len = String(value.length).padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const merchantAccountInfo = [
    formatField('00', 'br.gov.bcb.pix'),
    formatField('01', pixKey)
  ].join('');

  const additionalDataField = formatField('05', txId);

  let payload = [
    formatField('00', '01'), // Payload Format Indicator
    formatField('26', merchantAccountInfo), // Merchant Account Info
    formatField('52', '0000'), // Merchant Category Code
    formatField('53', '986'), // Transaction Currency (BRL)
    amount ? formatField('54', Number(amount).toFixed(2)) : '', // Transaction Amount
    formatField('58', 'BR'), // Country Code
    formatField('59', name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25)), // Merchant Name
    formatField('60', city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15)), // Merchant City
    formatField('62', additionalDataField), // Additional Data Field
    '6304' // CRC16 Indicator
  ].join('');

  // Cálculo CRC-16 / CCITT-FALSE
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

  return payload + crcHex;
}

export function getPixQrCodeUrl(payloadPix) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payloadPix)}`;
}
