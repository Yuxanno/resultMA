import axios, { AxiosInstance } from 'axios';

interface CRMConfig {
  baseURL: string;
  apiKey: string;
  apiSecret: string;
}

interface PaginationParams {
  page?: number;
  per_page?: number;
}

interface StudentFilters extends PaginationParams {
  group_id?: number;
  specialty_id?: number;
}

interface CRMStudent {
  id: number;
  full_name: string;
  birth_date: string;
  group: {
    id: number;
    level: number;
    name: string;
  };
  specialty: {
    id: number;
    name: string;
  };
}

interface CRMSpecialty {
  id: string;
  name: string;
  organization_id: string;
  subjects: Array<{
    id: number;
    name: string;
  }>;
}

interface CRMResponse<T> {
  success: boolean;
  data: {
    students?: T[];
    specialties?: T[];
    pagination: {
      total: number;
      current_page: number;
      per_page: number;
      total_pages: number;
    };
  };
}

class CRMApiService {
  private client: AxiosInstance;
  private isEnabled: boolean;

  constructor(config?: CRMConfig) {
    this.isEnabled = !!(config?.apiKey && config?.apiSecret);
    
    this.client = axios.create({
      baseURL: config?.baseURL || 'https://crm.mathacademy.uz/api',
      headers: {
        'X-API-KEY': config?.apiKey || '',
        'Authorization': `Bearer ${config?.apiSecret || ''}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  async getStudents(filters: StudentFilters = {}): Promise<CRMResponse<CRMStudent>> {
    if (!this.isEnabled) {
      throw new Error('CRM API not configured');
    }

    const { data } = await this.client.post<CRMResponse<CRMStudent>>('/students-list', {
      page: filters.page || 1,
      per_page: filters.per_page || 20,
      ...(filters.group_id && { group_id: filters.group_id }),
      ...(filters.specialty_id && { specialty_id: filters.specialty_id })
    });

    return data;
  }

  async getSpecialties(params: PaginationParams = {}): Promise<CRMResponse<CRMSpecialty>> {
    if (!this.isEnabled) {
      throw new Error('CRM API not configured');
    }

    const { data } = await this.client.post<CRMResponse<CRMSpecialty>>('/specialty-list', {
      page: params.page || 1,
      per_page: params.per_page || 20
    });

    return data;
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
let crmService: CRMApiService;

export function initCRMService(config?: CRMConfig) {
  crmService = new CRMApiService(config);
  return crmService;
}

export function getCRMService(): CRMApiService {
  if (!crmService) {
    throw new Error('CRM service not initialized');
  }
  return crmService;
}

export type { CRMStudent, CRMSpecialty, StudentFilters, PaginationParams };
