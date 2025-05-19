export interface MaintenanceRequest {
    id: number;
    problem_type: string;
    description: string;
    scheduled_date: string;
    apartment_id: number;
    technician_id: number;
    request_status: 'Pending' | 'In Progress' | 'Completed';
    schedule_status: string;
  }
  