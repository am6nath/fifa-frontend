export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entityName: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}
