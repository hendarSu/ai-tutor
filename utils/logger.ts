import fs from 'fs';
import path from 'path';

export function logToFile(filename: string, content: string) {
  const logDir = path.join(process.cwd(), '.next/server/logs');
  const logPath = path.join(logDir, filename);

  // Ensure the log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.writeFileSync(logPath, content, { flag: 'a' });
}
