import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getCounterValue, incrementCounter, decrementCounter } from '../../services/contractService';

export default function DebugScreen() {
  const [counter, setCounter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGet = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DebugScreen] handleGet called');
      const value = await getCounterValue();
      setCounter(value);
      console.log('[DebugScreen] getCounterValue returned', value);
    } catch (e: any) {
      setError(e.message || 'Error fetching counter');
      console.log('[DebugScreen] handleGet error', e);
    } finally {
      setLoading(false);
      console.log('[DebugScreen] handleGet finished');
    }
  };

  const handleIncrement = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DebugScreen] handleIncrement called');
      await incrementCounter();
      await handleGet();
      console.log('[DebugScreen] incrementCounter finished');
    } catch (e: any) {
      setError(e.message || 'Error incrementing counter');
      console.log('[DebugScreen] handleIncrement error', e);
    } finally {
      setLoading(false);
      console.log('[DebugScreen] handleIncrement finished');
    }
  };

  const handleDecrement = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[DebugScreen] handleDecrement called');
      await decrementCounter();
      await handleGet();
      console.log('[DebugScreen] decrementCounter finished');
    } catch (e: any) {
      setError(e.message || 'Error decrementing counter');
      console.log('[DebugScreen] handleDecrement error', e);
    } finally {
      setLoading(false);
      console.log('[DebugScreen] handleDecrement finished');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Counter Contract Debug</Text>
      <Button title="Get Count" onPress={handleGet} disabled={loading} />
      <Button title="Increment" onPress={handleIncrement} disabled={loading} />
      <Button title="Decrement" onPress={handleDecrement} disabled={loading} />
      {counter !== null && <Text style={styles.value}>Current Value: {counter}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  value: { fontSize: 18, marginTop: 16 },
  error: { color: 'red', marginTop: 8 },
}); 