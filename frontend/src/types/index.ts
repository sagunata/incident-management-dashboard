export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  service: string;
  severity: Severity;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}