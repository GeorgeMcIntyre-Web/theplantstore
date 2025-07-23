// D1 Database Adapter for Cloudflare D1
// This replaces Prisma for local development with Cloudflare D1

export interface D1Database {
  prepare: (query: string) => D1PreparedStatement;
  batch: (statements: D1PreparedStatement[]) => Promise<D1Result[]>;
  exec: (query: string) => Promise<D1Result>;
}

export interface D1PreparedStatement {
  bind: (...values: any[]) => D1PreparedStatement;
  first: () => Promise<any>;
  run: () => Promise<D1Result>;
  all: () => Promise<D1Result>;
}

export interface D1Result {
  results: any[];
  success: boolean;
  meta: any;
}

// Local development D1 client
class LocalD1Client {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8787') {
    this.baseUrl = baseUrl;
  }

  async prepare(query: string): Promise<D1PreparedStatement> {
    return new LocalD1PreparedStatement(this.baseUrl, query);
  }

  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    // For local development, execute statements sequentially
    const results: D1Result[] = [];
    for (const statement of statements) {
      const result = await statement.run();
      results.push(result);
    }
    return results;
  }

  async exec(query: string): Promise<D1Result> {
    const response = await fetch(`${this.baseUrl}/api/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return response.json();
  }
}

class LocalD1PreparedStatement implements D1PreparedStatement {
  private baseUrl: string;
  private query: string;
  private params: any[] = [];

  constructor(baseUrl: string, query: string) {
    this.baseUrl = baseUrl;
    this.query = query;
  }

  bind(...values: any[]): D1PreparedStatement {
    this.params = values;
    return this;
  }

  async first(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: this.query, 
        params: this.params,
        type: 'first'
      })
    });
    const result = await response.json();
    return result.data;
  }

  async run(): Promise<D1Result> {
    const response = await fetch(`${this.baseUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: this.query, 
        params: this.params,
        type: 'run'
      })
    });
    return response.json();
  }

  async all(): Promise<D1Result> {
    const response = await fetch(`${this.baseUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: this.query, 
        params: this.params,
        type: 'all'
      })
    });
    return response.json();
  }
}

// Export the D1 client
export const d1 = new LocalD1Client();

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const response = await fetch('http://localhost:8787/api/health');
    const data = await response.json();
    return { 
      status: data.success ? "healthy" : "unhealthy", 
      timestamp: data.timestamp,
      environment: data.environment
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}; 