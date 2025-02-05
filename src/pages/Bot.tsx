import { useEffect, useRef, useState } from "react";
import CenterLayout from "@/components/CenterLayout";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getBotConfig, startBot, stopBot } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/events";

interface ConsoleMessage {
  timestamp: string;
  text: string;
  color: string;
}

const baseURL =
  import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL;
const wsURL = baseURL.replace("http", "ws");

export default function Bot() {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      return;
    }
    setIsLoading(true);

    getBotConfig(username, id)
      .then((data) => {
        setBotConfig(data);
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, username]);

  const startWebSocket = () => {
    wsRef.current = new WebSocket(`${wsURL}/bot/bots?id=${id}`);

    wsRef.current.onopen = () => {
      toast.success("Bot started!");
      setTimeout(() => {
        eventService.emit("configsUpdated");
        toast("Configs list updated");
      }, 5000);
      console.log("WebSocket connected");
      wsRef.current?.send("{}");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      // if (typeof data.message === "object") {
      //   data.message = null;
      // }
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

        const timestamp = new Date(data.timestamp * 1000).toLocaleTimeString();
        data.timestamp = timestamp;

        setMessages((prev) => [
          ...prev,
          {
            timestamp: data.timestamp,
            text: text.replace(/\x1B\[\d{2,3}m/g, ""),
            color: colorClass,
          },
        ]);
      }
      wsRef.current?.send("{}");
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
      setIsStarting(true);
      await startBot(id, username);
      startWebSocket();
    } catch (error) {
      toast.error(`Error starting bot: ${error}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsStopping(true);
      await stopBot(id, username);
      wsRef.current?.close();
      eventService.emit("configsUpdated");
      toast.success("Bot stopped");
    } catch (error) {
      toast.error(`Error stopping bot: ${error}`);
    } finally {
      setIsStopping(false);
    }
  };

  const handleClearLogs = () => {
    setMessages([]);
    toast("Logs cleared");
  };

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    document.title = `Bot#${id} | Trading bot`;
  }, []);

  return (
    <CenterLayout showBackButton={false} showMainPageButton={true}>
      <div className="flex gap-8 w-full h-[80vh]">
        <div className="flex-1 p-4 flex flex-col">
          <div className="text-2xl font-bold mb-4">
            {botConfig &&
              `${botConfig.SYMBOL.replace("USDT", "/USDT")} ${botConfig.INTERVAL}`}
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
              disabled={isStarting || isStopping} // Disable while either operation is in progress
            >
              {isStarting ? "Starting..." : "Start"}
            </Button>

            <Button
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleStop}
              disabled={isStarting || isStopping} // Disable while either operation is in progress
            >
              {isStopping ? "Stopping..." : "Stop"}
            </Button>

            <Button variant="outline" onClick={handleClearLogs}>
              Clear Logs
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div
            ref={consoleRef}
            className="bg-primary-foreground p-4 rounded-lg h-full font-mono overflow-y-auto text-left relative"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted text-xl font-extrabold font-sans">
                Logs will appear here. Start the bot to see
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  <span>{msg.timestamp}: </span>
                  <span className={msg.color}>{msg.text}</span>
                </div>
              ))
            )}
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => {
                // Create log content
                const logContent = messages
                  .map((msg) => `${msg.timestamp}: ${msg.text}`)
                  .join("\n");

                // Create filename with current timestamp
                const now = new Date();
                const filename = `${now.getDate().toString().padStart(2, "0")}${(
                  now.getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}${now
                  .getFullYear()
                  .toString()
                  .slice(-2)}${now.getHours().toString().padStart(2, "0")}${now
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}_trbot.log`;

                // Create and trigger download
                const blob = new Blob([logContent], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }}
            >
              Download Logs
            </Button>
          )}
        </div>
      </div>
    </CenterLayout>
  );
}
