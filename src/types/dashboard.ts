// Core Data Models
export interface MetricsData {
  payments: number;
  errors: number;
  transactions: number;
  revenue: number;
  conversionRate: number;
  activeUsers: number;
  chartData: ChartDataPoint[];
  trends: {
    paymentsChange: number;
    errorsChange: number;
    revenueChange: number;
    usersChange: number;
  };
}

export interface ChartDataPoint {
  date: string;
  payments: number;
  errors: number;
  revenue: number;
  users: number;
  timestamp: number;
}

// Configuration Models
export interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  environment: Environment;
  createdAt: string;
  lastUsed: string;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'expired';
}

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  environment: Environment;
  status: ConnectionStatus;
  lastChecked: string;
  responseTime?: number;
  version?: string;
}

export interface NotificationConfig {
  email: {
    enabled: boolean;
    address: string;
    events: NotificationEvent[];
    verified: boolean;
  };
  webhook: {
    enabled: boolean;
    url: string;
    events: NotificationEvent[];
    secret?: string;
  };
  sms: {
    enabled: boolean;
    number: string;
    events: NotificationEvent[];
    verified: boolean;
  };
}

export interface SecurityConfig {
  twoFactorAuth: {
    enabled: boolean;
    method: '2fa_app' | 'sms' | 'email';
    backupCodes: string[];
  };
  ipWhitelist: {
    enabled: boolean;
    addresses: IPWhitelistEntry[];
  };
  sessionTimeout: number;
  auditLog: {
    enabled: boolean;
    retentionDays: number;
    events: AuditLogEntry[];
  };
}

export interface IPWhitelistEntry {
  id: string;
  address: string;
  description: string;
  addedAt: string;
  lastUsed?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  details: Record<string, any>;
}

export interface ConfigData {
  apiKeys: ApiKeyConfig[];
  canisterEndpoints: EndpointConfig[];
  notifications: NotificationConfig;
  security: SecurityConfig;
  lastUpdated: string;
}

// Webhook Models
export interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  lastTriggered: string;
  successRate: number;
  responseTime: number;
  createdAt: string;
  description?: string;
  headers?: Record<string, string>;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
  logs: WebhookLogEntry[];
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed' | 'retry';
  responseCode?: number;
  responseTime: number;
  error?: string;
  payload: Record<string, any>;
}

// Aggregate Dashboard Data
export interface DashboardData {
  metrics: MetricsData;
  config: ConfigData;
  webhooks: WebhookData[];
  lastRefreshed: string;
}

// Enums and Union Types
export type Environment = 'development' | 'staging' | 'production';
export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'testing';
export type WebhookStatus = 'active' | 'inactive' | 'error' | 'paused';
export type DashboardTab = 'analytics' | 'config' | 'webhooks';

export type Permission = 
  | 'read_metrics'
  | 'write_config'
  | 'manage_webhooks'
  | 'admin_access'
  | 'read_logs';

export type NotificationEvent = 
  | 'payment_completed'
  | 'payment_failed'
  | 'webhook_failed'
  | 'api_error'
  | 'security_alert'
  | 'system_maintenance';

export type WebhookEvent = 
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.pending'
  | 'user.created'
  | 'user.updated'
  | 'transaction.created'
  | 'error.occurred';

// State Management Types
export interface DashboardState {
  activeTab: DashboardTab;
  isLoading: boolean;
  error: DashboardError | null;
  data: DashboardData | null;
  lastRefresh: string | null;
}

export interface LoadingState {
  metrics: boolean;
  config: boolean;
  webhooks: boolean;
  global: boolean;
}

// Error Types
export interface DashboardError {
  type: ErrorType;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: string;
  context?: Record<string, any>;
}

export type ErrorType = 
  | 'network'
  | 'canister'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'unknown';

// Component Props Types
export interface DashboardProps {
  defaultTab?: DashboardTab;
  canisterId?: string;
  refreshInterval?: number;
}

export interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  error?: boolean;
}

export interface ChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  error?: boolean;
  height?: number;
  showTooltip?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter and Search Types
export interface FilterOptions {
  environment?: Environment[];
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface WebhookFormData {
  name: string;
  url: string;
  events: WebhookEvent[];
  description?: string;
  headers?: Record<string, string>;
  maxRetries: number;
  retryDelay: number;
}

export interface ApiKeyFormData {
  name: string;
  environment: Environment;
  permissions: Permission[];
  expiresAt?: string;
}

export interface EndpointFormData {
  name: string;
  url: string;
  environment: Environment;
}

// Transaction Models
export interface TransactionData {
  id: string;
  txHash?: string;
  amount: number;
  token: 'ICP' | 'ckBTC' | 'ckETH' | 'USD';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  user: {
    id: string;
    name?: string;
    email?: string;
    principal?: string;
    wallet?: string;
  };
  timestamp: string;
  fee?: number;
  blockHeight?: number;
  confirmations?: number;
  description?: string;
  metadata?: Record<string, any>;
  canRefund: boolean;
  refundedAt?: string;
  refundTxId?: string;
}

export interface TransactionFilters {
  status?: string[];
  tokens?: string[];
  types?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface TransactionTableProps {
  transactions: TransactionData[];
  loading?: boolean;
  error?: boolean;
  onRefund?: (transactionId: string) => Promise<void>;
  onViewDetails?: (transaction: TransactionData) => void;
  onExport?: () => void;
  filters?: TransactionFilters;
  onFiltersChange?: (filters: TransactionFilters) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Constants
export const DASHBOARD_TABS = ['analytics', 'config', 'webhooks'] as const;
export const ENVIRONMENTS = ['development', 'staging', 'production'] as const;
export const WEBHOOK_EVENTS = [
  'payment.completed',
  'payment.failed',
  'payment.pending',
  'user.created',
  'user.updated',
  'transaction.created',
  'error.occurred'
] as const;

export const NOTIFICATION_EVENTS = [
  'payment_completed',
  'payment_failed',
  'webhook_failed',
  'api_error',
  'security_alert',
  'system_maintenance'
] as const;

export const PERMISSIONS = [
  'read_metrics',
  'write_config',
  'manage_webhooks',
  'admin_access',
  'read_logs'
] as const;