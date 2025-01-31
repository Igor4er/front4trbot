import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CenterLayout from "@/components/CenterLayout";
import { createConfig } from "@/services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { eventService } from "@/services/events";

const formSchema = z
  .object({
    username: z.string(),
    symbol: z.string(),
    interval: z.string(),
    min_impulse_percent: z.number().min(0.001).max(0.2),
    margin_type: z.enum(["ISOLATED", "CROSSED"]),
    leverage: z.number().min(1).max(100),
    balance_type: z.enum(["BTC", "USDT"]),
    balance: z.number().min(0.001).max(100),
    lo_1: z.number().min(0.001).max(1),
    lo_2: z.number().min(0.001).max(1),
    lo_3: z.number().min(0.001).max(1),
    tp_11: z.number().min(0.001).max(1),
    tp_21: z.number().min(0.001).max(1),
    tp_22: z.number().min(0.001).max(1),
    tp_32: z.number().min(0.001).max(1),
  })
  .refine((data) => data.lo_1 + data.lo_2 + data.lo_3 <= 1, {
    message: "Sum of LO fields must be less than or equal to 1",
  })
  .refine(
    (data) => data.tp_11 + data.tp_21 <= 1 && data.tp_32 + data.tp_22 <= 1,
    {
      message:
        "Sum of TP_11 + TP_21 and TP_32 + TP_22 must be less than or equal to 1",
    },
  );

const selectOptions = {
  symbols: ["BTCUSDT", "ETHUSDT", "XRPUSDT", "BNBUSDT", "SOLUSDT", "LINKUSDT"],
  intervals: ["1m", "5m", "10m", "15m", "30m"],
  marginTypes: ["ISOLATED", "CROSSED"],
  balanceTypes: ["BTC", "USDT"],
};

type SelectFieldProps = {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  options: string[];
};

type InputFieldProps = {
  name: keyof z.infer<typeof formSchema>;
  label: string;
  type: string;
  min: number;
  max: number;
  step: number;
};

export default function AddConfig() {
  const { username } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const defaultValues: z.infer<typeof formSchema> = {
    username: username ? username : "",
    symbol: "BTCUSDT",
    interval: "1min",
    min_impulse_percent: 0.01,
    margin_type: "ISOLATED",
    leverage: 10,
    balance_type: "BTC",
    balance: 0.02,
    lo_1: 0.3,
    lo_2: 0.3,
    lo_3: 0.4,
    tp_11: 0.5,
    tp_21: 0.5,
    tp_22: 0.55,
    tp_32: 0.45,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await createConfig(values);
      toast.success("Config created successfully");
      eventService.emit("configsUpdated");
      // Navigate to the bot detail page using the returned ID
      navigate(`/bots/${result.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error creating config");
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderSelectField = ({ name, label, options }: SelectFieldProps) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-4">
          <FormLabel className="w-1/3 text-right">{label}</FormLabel>
          <div className="w-2/3">
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );

  const renderInputField = ({
    name,
    label,
    type,
    min,
    max,
    step,
  }: InputFieldProps) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-4">
          <FormLabel className="w-1/3 text-right">{label}</FormLabel>
          <div className="w-2/3">
            <FormControl>
              <Input type={type} min={min} max={max} step={step} {...field} />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );

  return (
    <CenterLayout>
      <div className="w-full max-w-2xl p-4 space-y-6">
        <h2 className="text-2xl font-bold">Create Bot Configuration</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderSelectField({
              name: "symbol",
              label: "Symbol",
              options: selectOptions.symbols,
            })}
            {renderSelectField({
              name: "interval",
              label: "Timeframe",
              options: selectOptions.intervals,
            })}
            {renderInputField({
              name: "min_impulse_percent",
              label: "Min impulse percent",
              type: "number",
              min: 0.001,
              max: 0.2,
              step: 0.001,
            })}
            {renderSelectField({
              name: "margin_type",
              label: "Margin type",
              options: selectOptions.marginTypes,
            })}
            {renderInputField({
              name: "leverage",
              label: "Leverage",
              type: "number",
              min: 1,
              max: 100,
              step: 1,
            })}
            {renderSelectField({
              name: "balance_type",
              label: "Balance type",
              options: selectOptions.balanceTypes,
            })}
            {renderInputField({
              name: "balance",
              label: "Balance",
              type: "number",
              min: 0.001,
              max: 100,
              step: 0.001,
            })}
            {["lo_1", "lo_2", "lo_3"].map((field, idx) => (
              <div key={field}>
                {" "}
                {/* Add this wrapper div with a key */}
                {renderInputField({
                  name: field as keyof z.infer<typeof formSchema>,
                  label: `LO ${idx + 1}`,
                  type: "number",
                  min: 0.001,
                  max: 1,
                  step: 0.001,
                })}
              </div>
            ))}

            {["tp_11", "tp_21", "tp_22", "tp_32"].map((field) => (
              <div key={field}>
                {renderInputField({
                  name: field as keyof z.infer<typeof formSchema>,
                  label: `TP ${field.replace("_", " ")}`,
                  type: "number",
                  min: 0.001,
                  max: 1,
                  step: 0.001,
                })}
              </div>
            ))}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </CenterLayout>
  );
}
