function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

export function info(message: string, ...args: unknown[]): void {
  const extra = args.length > 0 ? ' ' + args.map(a => String(a)).join(' ') : '';
  console.log(`[${timestamp()}] INFO: ${message}${extra}`);
}

export function warn(message: string, ...args: unknown[]): void {
  const extra = args.length > 0 ? ' ' + args.map(a => String(a)).join(' ') : '';
  console.warn(`[${timestamp()}] WARN: ${message}${extra}`);
}

export function error(message: string, ...args: unknown[]): void {
  const extra = args.length > 0 ? ' ' + args.map(a => String(a)).join(' ') : '';
  console.error(`[${timestamp()}] ERROR: ${message}${extra}`);
}
