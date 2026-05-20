function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

function formatMessage(level: string, message: string, requestId?: string, ...args: unknown[]): string {
  const idPart = requestId ? ` [${requestId}]` : '';
  const extra = args.length > 0 ? ' ' + args.map(a => String(a)).join(' ') : '';
  return `[${timestamp()}] ${level}:${idPart} ${message}${extra}`;
}

export function info(message: string, requestId?: string, ...args: unknown[]): void {
  console.log(formatMessage('INFO', message, requestId, ...args));
}

export function warn(message: string, requestId?: string, ...args: unknown[]): void {
  console.warn(formatMessage('WARN', message, requestId, ...args));
}

export function error(message: string, requestId?: string, ...args: unknown[]): void {
  console.error(formatMessage('ERROR', message, requestId, ...args));
}
