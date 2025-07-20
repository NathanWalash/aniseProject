import SignClient from "@walletconnect/sign-client";

const CHAIN_ID = 80002; // Polygon Amoy
const SESSION_KEY = "WALLETCONNECT_SESSION"; // No longer used, but kept for reference

export class WalletConnectService {
  client: SignClient | null = null;
  session: any = null;
  approval: (() => Promise<any>) | null = null;
  onSessionDisconnect?: () => void;

  async init() {
    if (this.client) return;
    const metadata = {
      name: "AniseWalletConnect",
      description: "Connect your wallet to Anise services.",
      url: "https://anise.org",
      icons: ["https://your-app.com/icon.png"],
    };
    this.client = await SignClient.init({
      projectId: "1f3ba1d16816b5ed5cfcafa99bde5aa8",
      metadata,
    });
    console.log('[WalletConnect] Initialized with metadata:', metadata);

    // Add event listener for session_request to silence warning and debug
    this.client.on("session_request", (event) => {
      console.log("[WalletConnect] session_request event:", event);
      // You can handle or ignore as needed
    });

    // Log all sessions for debugging
    const sessions = this.client.session.getAll();
    console.log('[WalletConnect] All sessions:', sessions.map(s => ({
      chains: s.namespaces?.eip155?.chains,
      url: s.self?.metadata?.url,
      acknowledged: s.acknowledged,
      expiry: s.expiry,
      topic: s.topic,
    })));

    // Find a valid session for Amoy and this dapp
    const amoySession = sessions.find(
      (s) =>
        s.namespaces?.eip155?.chains?.includes(`eip155:${CHAIN_ID}`) &&
        s.self?.metadata?.url === 'https://anise.org' &&
        s.acknowledged &&
        (!s.expiry || s.expiry * 1000 > Date.now())
    );
    if (amoySession) {
      this.session = amoySession;
      console.log('[WalletConnect] Restored session with chains:', this.session.namespaces.eip155.chains, 'and url:', this.session.self?.metadata?.url);
      // Validate session by making a simple request
      try {
        await this.client.request({
          topic: this.session.topic,
          chainId: `eip155:${CHAIN_ID}`,
          request: {
            method: 'eth_chainId',
            params: [],
          },
        });
        // If this succeeds, session is valid
      } catch (err) {
        // If it fails, disconnect and clear session
        console.log('[WalletConnect] Session validation failed, disconnecting:', err);
        await this.client.disconnect({
          topic: this.session.topic,
          reason: { code: 6000, message: "Session invalid on wallet" }
        });
        this.session = null;
        if (this.onSessionDisconnect) this.onSessionDisconnect();
      }
    } else {
      // Disconnect all stale/invalid sessions for this dapp
      for (const s of sessions) {
        if (s.self?.metadata?.url === 'https://anise.org') {
          await this.client.disconnect({
            topic: s.topic,
            reason: { code: 6000, message: "Stale or invalid session" }
          });
        }
      }
      this.session = null;
      console.log('[WalletConnect] No valid Amoy session for this dapp restored.');
    }
    // Add event listeners for disconnect/session expiry
    this.client.on("session_delete", () => {
      this.disconnect();
      if (this.onSessionDisconnect) this.onSessionDisconnect();
    });
    this.client.on("session_expire", () => {
      this.disconnect();
      if (this.onSessionDisconnect) this.onSessionDisconnect();
    });
  }

  async connect() {
    if (!this.client) throw new Error("Client not initialized");
    const { uri, approval } = await this.client.connect({
      optionalNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "personal_sign"
          ],
          chains: ["eip155:" + CHAIN_ID], // Polygon Amoy only
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });
    this.approval = approval;
    console.log('[WalletConnect] connect() called. Optional chains:', ["eip155:" + CHAIN_ID]);
    return { uri };
  }

  async approve() {
    if (!this.approval) throw new Error("Approval not available");
    this.session = await this.approval();
    this.approval = null; // Clear approval after use
    // Enforce Amoy-only session
    const chains = this.session.namespaces?.eip155?.chains || [];
    if (chains.length !== 1 || chains[0] !== `eip155:${CHAIN_ID}`) {
      // Disconnect and prompt user
      await this.client.disconnect({
        topic: this.session.topic,
        reason: { code: 6000, message: "Session must be Amoy-only" }
      });
      this.session = null;
      if (typeof window !== 'undefined' && window.alert) {
        alert("Please enable only Polygon Amoy in MetaMask before connecting.");
      } else {
        console.log("Please enable only Polygon Amoy in MetaMask before connecting.");
      }
      if (this.onSessionDisconnect) this.onSessionDisconnect();
      return null;
    }
    // No need to manually save session; WalletConnect handles it
    return this.session;
  }

  isConnected() {
    return !!this.session;
  }

  async disconnect() {
    if (this.session && this.client) {
      // Properly disconnect the session from the client
      await this.client.disconnect({
        topic: this.session.topic,
        reason: {
          code: 6000,
          message: "User disconnected",
        },
      });
    }
    this.session = null;
  }

  // Send a transaction using WalletConnect (MetaMask will prompt to sign)
  async sendTransaction(tx: any) {
    if (!this.client || !this.session) throw new Error("Not connected");
    const topic = this.session.topic;
    const chainId = `eip155:${CHAIN_ID}`;
    const from = this.session.namespaces.eip155.accounts[0].split(":").pop();
    const txRequest = {
      ...tx,
      from,
    };
    console.log('[WalletConnect] sendTransaction chainId:', chainId, 'txRequest:', txRequest);
    return await this.client.request({
      topic,
      chainId,
      request: {
        method: "eth_sendTransaction",
        params: [txRequest],
      },
    });
  }
}