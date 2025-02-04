const baseURL =
  import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface Bot {
  id: string;
  pair: string;
  timeframe: string;
  running: boolean;
}

export interface Config {
  bots: Bot[];
}

export interface CreateConfigData {
  username: string;
  symbol: string;
  interval: string;
  min_impulse_percent: number;
  margin_type: "ISOLATED" | "CROSSED";
  leverage: number;
  balance_type: "BTC" | "USDT";
  balance: number;
  lo_1: number;
  lo_2: number;
  lo_3: number;
  tp_11: number;
  tp_21: number;
  tp_22: number;
  tp_32: number;
}

export interface SettingsData {
  api_key: string;
  secret_key: string;
}

export interface SettingsPresence {
  has_api_key: boolean;
  has_secret_key: boolean;
}

export interface CreateConfigResponse {
  id: string;
}

export async function fetchConfigs(userName: string): Promise<Config> {
  try {
    const response = await fetch(`${baseURL}/bot/all?USERNAME=${userName}`, {
      headers: getHeaders(),
    });
    if (response.status === 404) {
      return { bots: [] };
    }
    if (!response.ok) {
      throw new Error("Failed to fetch configs");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching configs:", error);
    return { bots: [] };
  }
}

export async function createConfig(
  configData: CreateConfigData,
): Promise<CreateConfigResponse> {
  try {
    const response = await fetch(`${baseURL}/bot/create_config`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(configData),
    });

    if (!response.ok) {
      throw new Error("Failed to create config");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating config:", error);
    throw error;
  }
}

export async function getBotConfig(userName: string, id: string) {
  const response = await fetch(
    `${baseURL}/bot/get_configs?USERNAME=${userName}&id=${id}`,
    {
      headers: getHeaders(),
    },
  );
  if (!response.ok) throw new Error("Failed to fetch bot config");
  return await response.json();
}

export async function startBot(id: string, userName: string) {
  const response = await fetch(
    `${baseURL}/bot/start?id=${id}&USERNAME=${userName}&amt_klines=100`,
    {
      headers: getHeaders(),
    },
  );
  if (!response.ok) throw new Error("Failed to start bot");
  return await response.json();
}

export async function stopBot(
  id: string,
  userName: string,
  del: boolean = false,
) {
  const response = await fetch(
    `${baseURL}/bot/stop?id=${id}&delete=${del}&USERNAME=${userName}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!response.ok) throw new Error("Failed to stop bot");
  return await response.json();
}

export async function saveSettings(
  data: SettingsData,
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${baseURL}/api/settings`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save settings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

export async function getSettingsPresence(): Promise<SettingsPresence> {
  try {
    const response = await fetch(`${baseURL}/api/settings/presence`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch settings presence");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching settings presence:", error);
    throw error;
  }
}
