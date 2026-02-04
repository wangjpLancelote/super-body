import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { stockAPI, StockSymbol } from './stockApi';
import { useAuth } from '../auth/AuthProvider';

const FILTERS: Array<'all' | 'gainers' | 'losers'> = ['all', 'gainers', 'losers'];

export default function StocksScreen() {
  const { signOut } = useAuth();
  const [stocks, setStocks] = useState<StockSymbol[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockSymbol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [loading, setLoading] = useState(true);

  const loadStocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockAPI.getStocks();
      setStocks(data);
    } catch (error) {
      console.warn('Failed to load stocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    let next = [...stocks];

    if (searchQuery.trim()) {
      next = next.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter === 'gainers') {
      next = next.filter((stock) => stock.change > 0).sort((a, b) => b.changePercent - a.changePercent);
    } else if (selectedFilter === 'losers') {
      next = next.filter((stock) => stock.change < 0).sort((a, b) => a.changePercent - b.changePercent);
    } else {
      next = next.sort((a, b) => b.price - a.price);
    }

    setFilteredStocks(next);
  }, [stocks, searchQuery, selectedFilter]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadStocks();
      return;
    }

    setLoading(true);
    try {
      const results = await stockAPI.searchStocks(searchQuery);
      setStocks(results);
      setSelectedFilter('all');
    } catch (error) {
      console.warn('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const summaryText = useMemo(() => {
    if (loading) return 'Loading stocks...';
    return `Showing ${filteredStocks.length} of ${stocks.length}`;
  }, [filteredStocks.length, loading, stocks.length]);

  const renderStockCard = ({ item }: { item: StockSymbol }) => {
    const isUp = item.change >= 0;
    return (
      <View style={styles.stockCard}>
        <View style={styles.stockHeader}>
          <Text style={styles.stockSymbol}>{item.symbol}</Text>
          <Text style={[styles.stockChange, isUp ? styles.stockUp : styles.stockDown]}>
            {isUp ? '+' : ''}{item.change.toFixed(2)} ({isUp ? '+' : ''}{item.changePercent.toFixed(2)}%)
          </Text>
        </View>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockPrice}>${item.price.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Stocks</Text>
          <Text style={styles.subtitle}>Realtime market snapshot</Text>
        </View>
        <TouchableOpacity style={styles.signOut} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by symbol or name"
          placeholderTextColor="#9BA0A8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter === 'all' ? 'All' : filter === 'gainers' ? 'Gainers' : 'Losers'}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.refreshButton} onPress={loadStocks}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.summary}>{summaryText}</Text>

      {loading ? (
        <ActivityIndicator color="#8CD98C" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={renderStockCard}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No stocks found</Text>
              <Text style={styles.emptySubtitle}>Try a different keyword.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  subtitle: {
    fontSize: 13,
    color: '#9AA3AF',
    marginTop: 4,
  },
  signOut: {
    borderWidth: 1,
    borderColor: '#2E3A48',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  signOutText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#121823',
    paddingHorizontal: 12,
    color: '#F5F7FA',
  },
  searchButton: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: '#8CD98C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#16261F',
    borderWidth: 1,
    borderColor: '#2B3A32',
  },
  filterButtonActive: {
    backgroundColor: '#8CD98C',
    borderColor: '#8CD98C',
  },
  filterText: {
    color: '#B2B8B0',
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#102316',
    fontWeight: '700',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  refreshText: {
    color: '#F5F7FA',
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: '#9AA3AF',
    fontSize: 12,
    marginBottom: 12,
  },
  stockCard: {
    backgroundColor: '#131B26',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  stockName: {
    color: '#9AA3AF',
    fontSize: 13,
    marginBottom: 8,
  },
  stockPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F7FA',
  },
  stockChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockUp: {
    color: '#34D399',
  },
  stockDown: {
    color: '#F87171',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#9AA3AF',
    marginTop: 4,
  },
});
