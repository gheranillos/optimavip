"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { createInquiry } from "@/lib/actions/inquiry";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ContactForm({
  propertyId,
  realtorId,
  defaultMessage,
}: {
  propertyId?: string;
  realtorId?: string;
  defaultMessage?: string;
}) {
  const t = useTranslations("Contact");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: defaultMessage ?? "",
      propertyId,
      realtorId,
    },
  });

  async function onSubmit(values: InquiryInput) {
    setIsSending(true);
    const res = await createInquiry(values);
    setIsSending(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(t("sent"));
    setSent(true);
    form.reset({ ...form.getValues(), name: "", phone: "", email: "", message: "" });
  }

  if (sent) {
    return (
      <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
        {t("sentDetail")}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phone")}</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("email")}{" "}
                <span className="text-xs text-muted-foreground">
                  ({t("optional")})
                </span>
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("message")}</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSending}>
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {t("send")}
        </Button>
      </form>
    </Form>
  );
}
