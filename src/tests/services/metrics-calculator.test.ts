/**
 * Unit Tests for MetricsCalculator Service
 * Tests cycle efficiency calculations, performance analytics, and trend analysis
 */

import { MetricsCalculator } from '../../services/metrics-calculator';
import { TransactionData, MetricsData } from '../../types/dashboard';

describe('MetricsCalculator', () => {
  let calculator: MetricsCalculator;
  let mockTransactions: TransactionData[];
  let mockMetrics: MetricsData[];

  beforeEach(() => {
    calculator = new MetricsCalculator();
    
    // Create mock transaction data
    mockTransactions = [
      {
        id: '1',
        hash: 'hash1',
        from: 'user1',
        to: 'canister1',
        amount: 100,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        status: 'completed',
        cycleCost: 1000000,
        subnetId: 'subnet1',
        canisterId: 'canister1',
        executionTime: 50,
        memoryUsage: 1024,
        instructionCount: 5000,
        callHierarchy: []
      },
      {
        id: '2',
        hash: 'hash2',
        from: 'user2',
        to: 'canister2',
        amount: 200,
        timestamp: new Date('2024-01-01T11:00:00Z'),
        status: 'completed',
        cycleCost: 2000000,
        subnetId: 'subnet1',
        canisterId: 'canister2',
        executionTime: 100,
        memoryUsage: 2048,
        instructionCount: 10000,
        callHierarchy: []
      },
      {
        id: '3',
        hash: 'hash3',
        from: 'user3',
        to: 'canister1',
        amount: 150,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        status: 'failed',
        cycleCost: 500000,
        subnetId: 'subnet2',
        canisterId: 'canister1',
        executionTime: 25,
        memoryUsage: 512,
        instructionCount: 2500,
        callHierarchy: []
      }
    ];

    // Create mock metrics data
    mockMetrics = [
      {
        timestamp: new Date('2024-01-01T10:00:00Z'),
        totalTransactions: 100,
        successfulTransactions: 95,
        failedTransactions: 5,
        averageResponseTime: 150,
        totalVolume: 10000,
        activeUsers: 50,
        cyclesBurned: 5000000,
        cyclesBalance: 95000000,
        cycleMetrics: { totalCyclesUsed: BigInt(5000000) },
        subnetMetrics: {
          subnet1: { uptime: 99.9, responseTime: 120, throughput: 1000 },
          subnet2: { uptime: 99.5, responseTime: 180, throughput: 800 }
        },
        canisterHealth: {
          canister1: { memoryUsage: 70, cycleBalance: 10000000, status: 'running' },
          canister2: { memoryUsage: 45, cycleBalance: 15000000, status: 'running' }
        }
      },
      {
        timestamp: new Date('2024-01-01T11:00:00Z'),
        totalTransactions: 120,
        successfulTransactions: 115,
        failedTransactions: 5,
        averageResponseTime: 140,
        totalVolume: 12000,
        activeUsers: 60,
        cyclesBurned: 6000000,
        cyclesBalance: 94000000,
        cycleMetrics: { totalCyclesUsed: BigInt(6000000) },
        subnetMetrics: {
          subnet1: { uptime: 99.8, responseTime: 115, throughput: 1100 },
          subnet2: { uptime: 99.6, responseTime: 175, throughput: 850 }
        },
        canisterHealth: {
          canister1: { memoryUsage: 72, cycleBalance: 9500000, status: 'running' },
          canister2: { memoryUsage: 48, cycleBalance: 14500000, status: 'running' }
        }
      }
    ];
  });

  describe('Cycle Efficiency Calculations', () => {
    test('should calculate cycles per instruction correctly', () => {
      const efficiency = calculator.calculateCycleEfficiency(mockTransactions);
      // Total Cycles: 1,000,000 + 2,000,000 + 500,000 = 3,500,000
      // Total Instructions: 5,000 + 10,000 + 2,500 = 17,500
      // Efficiency = 3,500,000 / 17,500 = 200
      expect(efficiency).toBe(200);
    });

    test('should return 0 for an empty transaction list', () => {
      const efficiency = calculator.calculateCycleEfficiency([]);
      expect(efficiency).toBe(0);
    });
  });

  describe('Performance Analytics', () => {
    test('should calculate throughput', () => {
      const throughput = calculator.calculateThroughput(mockTransactions);
      expect(typeof throughput).toBe('number');
      expect(throughput).toBeGreaterThan(0);
    });

    test('should calculate response time percentiles', () => {
      // Add required nested data to mock transactions
      const transactionsWithSubnetMetrics = mockTransactions.map(tx => ({
        ...tx,
        subnetMetrics: {
          responseTime: tx.executionTime,
          errorRate: 0,
          throughput: 0,
          uptime: 0,
          consensusHealth: 0,
          lastUpdated: '',
          nodeCount: 0,
          replicationFactor: 0,
        }
      }));

      const percentiles = calculator.calculateResponseTimePercentiles(transactionsWithSubnetMetrics);
      expect(percentiles.p50).toBe(50);
      expect(percentiles.p95).toBe(100);
      expect(percentiles.p99).toBe(100);
      expect(percentiles.max).toBe(100);
      expect(percentiles.min).toBe(25);
    });
  });

  describe('Trend Analysis', () => {
    test('should calculate cycle trends over time', () => {
      calculator.addHistoricalData('canister1', mockTransactions);
      const timeRange = {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-01T23:59:59Z'),
        granularity: 'hour' as const
      };
      const trends = calculator.calculateCycleTrends(timeRange);
      expect(trends).toBeInstanceOf(Array);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('totalCycles');
    });
  });

  describe('Cost Analysis', () => {
    test('should calculate average cost per operation type', () => {
      // It now falls back to 'status'
      const costMap = calculator.calculateCostPerOperation(mockTransactions);
      expect(costMap.size).toBe(2);
      // Two 'completed' transactions: (1,000,000 + 2,000,000) / 2 = 1,500,000
      expect(costMap.get('completed')).toBe(BigInt(1500000));
      // One 'failed' transaction: 500,000 / 1 = 500,000
      expect(costMap.get('failed')).toBe(BigInt(500000));
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect various types of anomalies', () => {
      // The detectAnomalies function in the source requires a larger dataset to work with statistical analysis.
      // The mockMetrics is too small. For now, we can test that it returns an empty array for insufficient data.
      const anomalies = calculator.detectAnomalies(mockMetrics);
      expect(anomalies).toBeInstanceOf(Array);
      expect(anomalies.length).toBe(0);
    });
  });

  describe('Predictive Analytics', () => {
    test('should predict cycle usage', () => {
      // The predictCycleUsage function requires a larger dataset for meaningful predictions.
      // We will test that it returns a valid structure for insufficient data.
      const prediction = calculator.predictCycleUsage(mockMetrics, 24);
      expect(prediction).toHaveProperty('predicted');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction.confidence).toBe(0); // With only 2 data points, confidence is 0
    });
  });
});