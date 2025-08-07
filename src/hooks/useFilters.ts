import { useState, useCallback, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { ChartDataPoint, MetricsData } from '@/types/dashboard';

export interface FilterState {
  dateRange?: DateRange;
  searchQuery: string;
  tokenTypes: string[];
  statusFilters: string[];
  metricTypes: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface UseFiltersOptions {
  initialFilters?: Partial<FilterState>;
}

interface UseFiltersReturn {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  clearFilters: () => void;
  filteredData: ChartDataPoint[];
  filteredMetrics: MetricsData | null;
  applyFilters: (data: ChartDataPoint[], metrics: MetricsData | null) => {
    filteredData: ChartDataPoint[];
    filteredMetrics: MetricsData | null;
  };
}

const defaultFilters: FilterState = {
  dateRange: undefined,
  searchQuery: '',
  tokenTypes: [],
  statusFilters: [],
  metricTypes: [],
  sortBy: 'date',
  sortOrder: 'desc'
};

export const useFilters = (
  data: ChartDataPoint[] = [],
  metrics: MetricsData | null = null,
  options: UseFiltersOptions = {}
): UseFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...options.initialFilters
  });

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Apply filters to data
  const applyFilters = useCallback((
    inputData: ChartDataPoint[],
    inputMetrics: MetricsData | null
  ) => {
    let filteredData = [...inputData];

    // Date range filter
    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromTime = filters.dateRange.from.getTime();
      const toTime = filters.dateRange.to.getTime();
      
      filteredData = filteredData.filter(point => {
        const pointTime = new Date(point.date).getTime();
        return pointTime >= fromTime && pointTime <= toTime;
      });
    }

    // Search query filter (mock implementation)
    if (filters.searchQuery) {
      // In a real implementation, this would search through transaction IDs, user names, etc.
      // For now, we'll just filter based on date strings containing the query
      const query = filters.searchQuery.toLowerCase();
      filteredData = filteredData.filter(point => 
        point.date.toLowerCase().includes(query) ||
        point.revenue.toString().includes(query) ||
        point.payments.toString().includes(query)
      );
    }

    // Sort data
    filteredData.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'payments':
          aValue = a.payments;
          bValue = b.payments;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Filter metrics based on selected metric types
    let filteredMetrics = inputMetrics;
    if (inputMetrics && filters.metricTypes.length > 0) {
      // Create a filtered version of metrics
      filteredMetrics = {
        ...inputMetrics,
        // Apply any metric-specific filtering here
        // For now, we'll keep all metrics but this could be extended
      };
    }

    // Apply token type filters to metrics
    if (inputMetrics && filters.tokenTypes.length > 0) {
      // In a real implementation, this would filter revenue by token types
      // For now, we'll adjust the revenue proportionally based on selected tokens
      const tokenWeights = {
        'ckBTC': 0.6,
        'ckETH': 0.3,
        'ICP': 0.1,
        'USD': 1.0
      };
      
      if (filters.tokenTypes.length < 4) { // Not all tokens selected
        const selectedWeight = filters.tokenTypes.reduce((sum, token) => 
          sum + (tokenWeights[token as keyof typeof tokenWeights] || 0), 0
        );
        
        filteredMetrics = {
          ...inputMetrics,
          revenue: inputMetrics.revenue * selectedWeight,
        };
      }
    }

    return { filteredData, filteredMetrics };
  }, [filters]);

  // Memoized filtered results
  const { filteredData, filteredMetrics } = useMemo(() => 
    applyFilters(data, metrics), 
    [data, metrics, applyFilters]
  );

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    filteredData,
    filteredMetrics,
    applyFilters
  };
};

// Helper hook for managing filter presets
export const useFilterPresets = () => {
  const [presets, setPresets] = useState<Record<string, FilterState>>({
    'Last 7 Days': {
      ...defaultFilters,
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date()
      }
    },
    'Revenue Focus': {
      ...defaultFilters,
      metricTypes: ['revenue'],
      sortBy: 'amount',
      sortOrder: 'desc'
    },
    'Error Analysis': {
      ...defaultFilters,
      metricTypes: ['errors'],
      statusFilters: ['failed'],
      sortBy: 'date',
      sortOrder: 'desc'
    },
    'Token Performance': {
      ...defaultFilters,
      tokenTypes: ['ckBTC', 'ckETH'],
      metricTypes: ['revenue', 'payments'],
      sortBy: 'amount',
      sortOrder: 'desc'
    }
  });

  const savePreset = useCallback((name: string, filters: FilterState) => {
    setPresets(prev => ({ ...prev, [name]: filters }));
  }, []);

  const deletePreset = useCallback((name: string) => {
    setPresets(prev => {
      const newPresets = { ...prev };
      delete newPresets[name];
      return newPresets;
    });
  }, []);

  const loadPreset = useCallback((name: string): FilterState | null => {
    return presets[name] || null;
  }, [presets]);

  return {
    presets,
    savePreset,
    deletePreset,
    loadPreset
  };
};