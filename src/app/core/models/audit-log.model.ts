export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityName: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
