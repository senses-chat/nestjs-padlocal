export * from './messages.dto';
export * from './request-payloads.dto';

export enum LoginStatus {
  LOGIN_START = 'LOGIN_START',
  QRCODE = 'QRCODE',
  LOGGED_IN = 'LOGGED_IN',
  LOGGED_OUT = 'LOGGED_OUT',
}
