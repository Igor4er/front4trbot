import { useEffect, useRef, useState } from "react";
import CenterLayout from "@/components/CenterLayout";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getBotConfig, startBot, stopBot } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface ConsoleMessage {
  timestamp: string;
  text: string;
  color: string;
}

export default function Bot() {
  const { id } = useParams();
  if (!id) {
    throw new Error("Bot ID is required");
  }
  const { username } = useAuth();

  if (!username) {
    throw new Error("User must be authenticated");
  }

  const [botConfig, setBotConfig] = useState<any>(null);
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!username || !id) {
      toast("No userName or botId provided!");
      return;
    }

    // Fetch initial bot config
    getBotConfig(username, id)
      .then((data) => {
        setBotConfig(data);
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  }, [id, username]); // Changed dependency

  const startWebSocket = () => {
    wsRef.current = new WebSocket(`ws://0.0.0.0:8000/bot/bots`);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      wsRef.current?.send("{}");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        const text =
          typeof data.message.data === "string"
            ? data.message.data
            : data.message.data.toString();

        // Color parsing logic
        const colorMap: Record<number, string> = {
          30: "text-black",
          31: "text-red-500",
          32: "text-green-500",
          33: "text-yellow-500",
          34: "text-blue-500",
          35: "text-purple-500",
          36: "text-cyan-500",
          37: "text-white",
        };

        const colorMatch = text.match(/(\d{2,3})m/);
        const colorCode = colorMatch ? parseInt(colorMatch[1]) : null;
        const colorClass = colorMap[colorCode || 37];

        setMessages((prev) => [
          ...prev,
          {
            timestamp: data.timestamp,
            text: text.replace(/\x1B\[\d{2,3}m/g, ""),
            color: colorClass,
          },
        ]);

        wsRef.current?.send("{}");
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket closed");
    };
  };

  const handleStart = async () => {
    try {
      await startBot(id, username);
      startWebSocket();
    } catch (error) {
      toast(`Error starting bot: ${error}`);
    }
  };

  const handleStop = async () => {
    try {
      await stopBot(id, username);
      wsRef.current?.close();
    } catch (error) {
      toast(`Error stopping bot: ${error}`);
    }
  };

  const handleClearLogs = () => {
    setMessages([]);
  };

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <CenterLayout showBackButton={false} showMainPageButton={true}>
      <div className="flex gap-8 w-full h-[80vh]">
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-2xl font-bold mb-4">
            {botConfig && `${botConfig.SYMBOL}/USDT ${botConfig.INTERVAL}`}
          </div>

          {botConfig && (
            <div className="mb-8 space-y-2">
              {Object.entries(botConfig).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="text-muted-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex min-w-full justify-center gap-4">
            <Button
              variant="outline"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleStart}
            >
              Start
            </Button>

            <Button
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleStop}
            >
              Stop
            </Button>

            <Button variant="outline" onClick={handleClearLogs}>
              Clear Logs
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div
            ref={consoleRef}
            className="bg-primary-foreground p-4 rounded-lg h-full font-mono overflow-y-auto text-left"
          >
            {messages.map((msg, index) => (
              <div key={index} className="whitespace-pre-wrap">
                <span>{msg.timestamp}: </span>
                <span className={msg.color}>{msg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CenterLayout>
  );
}
