import SignClient from "@walletconnect/sign-client";

const SESSION_KEY = "WALLETCONNECT_SESSION"; // No longer used, but kept for reference

export class WalletConnectService {
  client: SignClient | null = null;
  session: any = null;
  approval: (() => Promise<any>) | null = null;

  async init() {
    if (this.client) return;
    this.client = await SignClient.init({
      projectId: "1f3ba1d16816b5ed5cfcafa99bde5aa8",
      metadata: {
        name: "WalletConnectDevelopment",
        description: "MVP with polling and tx signing",
        url: "https://your-app.com",
        icons: ["https://your-app.com/icon.png"],
      },
    });
    // Restore session from the client (WalletConnect v2 handles persistence internally)
    const sessions = this.client.session.getAll();
    if (sessions.length > 0) {
      this.session = sessions[0]; // Use the first session, or handle multiple as needed
    } else {
      this.session = null;
    }
    // Add event listeners for disconnect/session expiry
    this.client.on("session_delete", () => {
      this.disconnect();
    });
    this.client.on("session_expire", () => {
      this.disconnect();
    });
  }

  async connect() {
    if (!this.client) throw new Error("Client not initialized");
    const { uri, approval } = await this.client.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "personal_sign"
          ],
          chains: ["eip155:11155111"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });
    this.approval = approval;
    return { uri };
  }

  async approve() {
    if (!this.approval) throw new Error("Approval not available");
    this.session = await this.approval();
    this.approval = null; // Clear approval after use
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
    const chainId = "eip155:11155111";
    const from = this.session.namespaces.eip155.accounts[0].split(":").pop();
    const txRequest = {
      ...tx,
      from,
    };
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