// ─────────────────────────────────────────────────────────────
// Lemon Squeezy — base API client
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://api.lemonsqueezy.com/v1";

export class LemonSqueezyClient {
  private readonly headers: Record<string, string>;

  constructor(private readonly apiKey: string) {
    this.headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: this.headers,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[LemonSqueezy] GET ${path} failed ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[LemonSqueezy] POST ${path} failed ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  }
}
