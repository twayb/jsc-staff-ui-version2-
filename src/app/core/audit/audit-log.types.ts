export interface AuditLogEntry {
  id: string;
  username: string;
  action: string;
  resource: string;
  method: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  requestPayload: string;
  responsePayload: string;
}

export interface AuditLogPage {
  content: AuditLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
