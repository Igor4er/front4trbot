import { useState, useEffect } from "react";
import CenterLayout from "@/components/CenterLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormDescription,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, ShieldIcon, ShieldBan } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettingsPresence, saveSettings } from "@/services/api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the form validation schema
const formSchema = z.object({
  publicKey: z.string().min(1, "Public key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
});

export default function Settings() {
  const [isHttps, setIsHttps] = useState(false);
  const [isDevOverride, setDevOverride] = useState(false);

  useEffect(() => {
    document.title = "Settings | Trading bot";
    setDevOverride(
      localStorage.getItem("iAmDeveloperAndKnowWhatImDoing") === "true",
    );
    setIsHttps(window.location.protocol === "https:");
    loadSettings();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSettings, setSavedSettings] = useState({
    publicKey: false,
    secretKey: false,
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicKey: "",
      secretKey: "",
    },
  });

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const presence = await getSettingsPresence();
      setSavedSettings({
        publicKey: presence.has_api_key,
        secretKey: presence.has_secret_key,
      });
    } catch (error) {
      toast.error("Failed to check settings status");
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSaving(true);
      await saveSettings({
        api_key: values.publicKey,
        secret_key: values.secretKey,
      });

      toast.success("Settings saved successfully");

      // Refresh settings presence after saving
      await loadSettings();

      // Clear the form
      form.reset();
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <CenterLayout showBackButton={true}>
      <div className="flex flex-col space-y-6 w-full max-w-md text-left">
        <div className="text-4xl font-bold text-center">Trading bot</div>
        {!isHttps && (
          <Alert variant="destructive">
            <ShieldBan className="" />
            <AlertDescription className="ml-3">
              <AlertTitle className="!text-lg font-bold">Warning</AlertTitle>
              <span className="font-semibold">
                This connection is not secure
              </span>{" "}
              (HTTP). For security purposes, please use HTTPS when managing API
              keys.
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your trading bot API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="publicKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <Label>Public Key</Label>
                          {savedSettings.publicKey ? (
                            <Badge variant="secondary" className="text-xs">
                              <Circle className="w-2 h-2 mr-2 text-blue-500 fill-current" />
                              Already set
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Circle className="w-2 h-2 mr-2 text-gray-400 fill-current" />
                              Not set
                            </Badge>
                          )}
                        </div>
                        <Input
                          placeholder="Enter your new public key"
                          {...field}
                          className={
                            form.formState.errors.publicKey
                              ? "border-red-500"
                              : ""
                          }
                          autoComplete="off"
                        />
                        <FormDescription
                          className={
                            form.formState.errors.publicKey
                              ? "text-red-500"
                              : ""
                          }
                        >
                          {form.formState.errors.publicKey
                            ? form.formState.errors.publicKey.message
                            : "Your exchange API public key"}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secretKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <Label>Secret Key</Label>
                          {savedSettings.secretKey ? (
                            <Badge variant="secondary" className="text-xs">
                              <Circle className="w-2 h-2 mr-2 text-blue-500 fill-current" />
                              Already set
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Circle className="w-2 h-2 mr-2 text-gray-400 fill-current" />
                              Not set
                            </Badge>
                          )}
                        </div>
                        <Input
                          type="password"
                          placeholder="Enter your new secret key"
                          {...field}
                          className={
                            form.formState.errors.secretKey
                              ? "border-red-500"
                              : ""
                          }
                          autoComplete="off"
                        />
                        <FormDescription
                          className={
                            form.formState.errors.secretKey
                              ? "text-red-500"
                              : ""
                          }
                        >
                          {form.formState.errors.secretKey
                            ? form.formState.errors.secretKey.message
                            : "Your exchange API secret key"}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          {" "}
                          {/* wrapper div for full-width button */}
                          <Button
                            type="submit"
                            className={`w-full ${!isHttps ? "bg-red-500 hover:bg-red-600" : ""}`}
                            disabled={(isSaving || !isHttps) && !isDevOverride}
                          >
                            {!isHttps
                              ? "UNSAFE - USE HTTPS!"
                              : isSaving
                                ? "Saving..."
                                : "Save Settings"}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        className="max-w-[300px] p-3"
                        side="bottom"
                      >
                        <p className="font-semibold text-red-500 mb-1">
                          Security Risk!
                        </p>
                        <p>
                          Sending API keys over HTTP (non-secure) connection
                          exposes them to potential interception by malicious
                          actors. This could lead to unauthorized access to your
                          trading account. Please use HTTPS for secure
                          transmission.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        <Alert>
          <ShieldAlert className="!text-yellow-500" />
          <AlertDescription className="ml-3">
            For security reasons, settings work in{" "}
            <span className="font-semibold">write-only</span> mode. Previously
            saved values cannot be displayed.
          </AlertDescription>
        </Alert>
        {isHttps && (
          <Alert className="!mt-2">
            <ShieldIcon className="!text-blue-500 " />
            <AlertDescription className="ml-3">
              Keys are encrypted with AES-128/Fernet and only decrypted when in
              use. Transfer secured via HTTPS
            </AlertDescription>
          </Alert>
        )}
      </div>
    </CenterLayout>
  );
}
