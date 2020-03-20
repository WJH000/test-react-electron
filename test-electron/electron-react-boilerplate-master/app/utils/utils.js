import CryptoJS from 'crypto-js';

export function encryptByAES(password) {
  return CryptoJS.AES.encrypt(password, 'ShennongKEYForSN').toString();
}
