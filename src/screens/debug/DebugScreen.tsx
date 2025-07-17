import React, { useState } from 'react';
import { View, Button, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { getCounterValue, incrementCounter, decrementCounter } from '../../services/contractService';
import { getAllDaos, getDaoMetadata } from "../../services/contractApi";
import { ethers } from "ethers";
import { AMOY_RPC_URL } from "../../utils/rpc";
import { safeStringify } from "../../utils/safeStringify";

export default function DebugScreen() {
  const [counter, setCounter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [daos, setDaos] = useState<any[]>([]);
  const [daoLoading, setDaoLoading] = useState(false);
  const [daoError, setDaoError] = useState("");

  const [daoAddress, setDaoAddress] = useState("");
  const [daoMeta, setDaoMeta] = useState<any | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState("");

  const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

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

  const handleGetAllDaos = async () => {
    setDaoLoading(true);
    setDaoError("");
    setDaos([]);
    try {
      const result = await getAllDaos(provider);
      setDaos(result);
    } catch (e: any) {
      setDaoError(e.message || String(e));
    } finally {
      setDaoLoading(false);
    }
  };

  const handleGetDaoMetadata = async () => {
    setMetaLoading(true);
    setMetaError("");
    setDaoMeta(null);
    try {
      const result = await getDaoMetadata(daoAddress, provider);
      setDaoMeta(result);
    } catch (e: any) {
      setMetaError(e.message || String(e));
    } finally {
      setMetaLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Counter Contract Debug</Text>
      <Button title="Get Count" onPress={handleGet} disabled={loading} />
      <Button title="Increment" onPress={handleIncrement} disabled={loading} />
      <Button title="Decrement" onPress={handleDecrement} disabled={loading} />
      {counter !== null && <Text style={styles.value}>Current Value: {counter}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.divider} />
      <Button title="Get All DAOs" onPress={handleGetAllDaos} />
      {daoLoading && <Text>Loading DAOs...</Text>}
      {daoError && <Text style={styles.error}>{daoError}</Text>}
      {daos.length > 0 && (
        <Text style={styles.json}>{safeStringify(daos, 2)}</Text>
      )}
      <View style={styles.divider} />
      <Text style={styles.label}>DAO Address:</Text>
      <TextInput
        style={styles.input}
        value={daoAddress}
        onChangeText={setDaoAddress}
        placeholder="0x..."
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Get DAO Metadata" onPress={handleGetDaoMetadata} />
      {metaLoading && <Text>Loading metadata...</Text>}
      {metaError && <Text style={styles.error}>{metaError}</Text>}
      {daoMeta && (
        <Text style={styles.json}>{safeStringify(daoMeta, 2)}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  value: { fontSize: 18, marginTop: 16 },
  error: { color: 'red', marginTop: 8 },
  json: { fontFamily: "monospace", fontSize: 12, marginVertical: 10 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  label: { marginTop: 20, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4, marginBottom: 10 },
}); 