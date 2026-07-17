"use client";

import { useState } from "react";
import {
  useForm,
  Controller,
  type UseFormRegister,
  type Control,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import {
  PropertyType,
  ListingMode,
  FloorLevel,
} from "@/generated/prisma/enums";
import { createProperty, updateProperty } from "@/lib/actions/property";
import type { PropertyFormInput } from "@/lib/validations/property";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/dashboard/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Option = { id: string; name: string };

export type PropertyFormFields = {
  title: string;
  description: string;
  type: PropertyType;
  modes: ListingMode[];
  price: string;
  currency: string;
  landArea: string;
  constructionArea: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  hasLivingDiningRoom: boolean;
  hasFamilyRoom: boolean;
  hasTerraceBalcony: boolean;
  finishes: string;
  floorLevel: FloorLevel | "";
  ageYears: string;
  zoneId: string;
  address: string;
  latitude: string;
  longitude: string;
  amenityIds: string[];
  videoUrl: string;
  virtualTourUrl: string;
  images: UploadedImage[];
};

const MODE_LABEL_KEY: Record<ListingMode, string> = {
  SALE: "forSale",
  RENT: "forRent",
  BUY: "forBuy",
};

const DEFAULTS: PropertyFormFields = {
  title: "",
  description: "",
  type: PropertyType.RESIDENTIAL,
  modes: [],
  price: "",
  currency: "USD",
  landArea: "",
  constructionArea: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  hasLivingDiningRoom: false,
  hasFamilyRoom: false,
  hasTerraceBalcony: false,
  finishes: "",
  floorLevel: "",
  ageYears: "",
  zoneId: "",
  address: "",
  latitude: "",
  longitude: "",
  amenityIds: [],
  videoUrl: "",
  virtualTourUrl: "",
  images: [],
};

export function PropertyForm({
  zones,
  amenities,
  propertyId,
  defaultValues,
}: {
  zones: Option[];
  amenities: Option[];
  propertyId?: string;
  defaultValues?: Partial<PropertyFormFields>;
}) {
  const t = useTranslations("PropertyForm");
  const tp = useTranslations("Property");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, control, watch, setValue } =
    useForm<PropertyFormFields>({
      defaultValues: { ...DEFAULTS, ...defaultValues },
    });

  /* eslint-disable react-hooks/incompatible-library -- RHF watch() is safe here; this component doesn't need React Compiler memoization. */
  const modes = watch("modes");
  const amenityIds = watch("amenityIds");
  const images = watch("images");
  /* eslint-enable react-hooks/incompatible-library */

  function toggleMode(mode: ListingMode) {
    setValue(
      "modes",
      modes.includes(mode) ? modes.filter((m) => m !== mode) : [...modes, mode]
    );
  }

  function toggleAmenity(id: string) {
    setValue(
      "amenityIds",
      amenityIds.includes(id)
        ? amenityIds.filter((a) => a !== id)
        : [...amenityIds, id]
    );
  }

  async function onSubmit(values: PropertyFormFields) {
    if (values.modes.length === 0) {
      toast.error(t("errorModes"));
      return;
    }
    if (!values.zoneId) {
      toast.error(t("errorZone"));
      return;
    }

    setIsSaving(true);
    const payload = values as unknown as PropertyFormInput;
    const result = propertyId
      ? await updateProperty(propertyId, payload)
      : await createProperty(payload);
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(t("saved"));
    router.push("/dashboard/properties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sectionBasic")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t("title")}</Label>
            <Input id="title" {...register("title", { required: true })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea id="description" rows={5} {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t("type")}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PropertyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {tp(`types.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("modes")}</Label>
              <div className="flex flex-wrap gap-4 pt-2">
                {Object.values(ListingMode).map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={modes.includes(mode)}
                      onCheckedChange={() => toggleMode(mode)}
                    />
                    {tp(MODE_LABEL_KEY[mode])}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="price">{t("price")}</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                {...register("price", { required: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("currency")}</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="VES">VES</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sectionDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="landArea" label={t("landArea")} register={register} />
            <NumberField
              id="constructionArea"
              label={t("constructionArea")}
              register={register}
            />
            <NumberField id="ageYears" label={t("ageYears")} register={register} />
            <NumberField id="bedrooms" label={t("bedrooms")} register={register} />
            <NumberField id="bathrooms" label={t("bathrooms")} register={register} />
            <NumberField
              id="parkingSpaces"
              label={t("parking")}
              register={register}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t("floorLevel")}</Label>
              <Controller
                control={control}
                name="floorLevel"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FloorLevel).map((fl) => (
                        <SelectItem key={fl} value={fl}>
                          {t(`floorLevels.${fl}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="finishes">{t("finishes")}</Label>
              <Input id="finishes" {...register("finishes")} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <SwitchField
              name="hasLivingDiningRoom"
              label={t("livingDining")}
              control={control}
            />
            <SwitchField
              name="hasFamilyRoom"
              label={t("familyRoom")}
              control={control}
            />
            <SwitchField
              name="hasTerraceBalcony"
              label={t("terraceBalcony")}
              control={control}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sectionLocation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t("zone")}</Label>
              <Controller
                control={control}
                name="zoneId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input id="address" {...register("address")} />
            </div>
            <NumberField
              id="latitude"
              label={t("latitude")}
              register={register}
              step="any"
            />
            <NumberField
              id="longitude"
              label={t("longitude")}
              register={register}
              step="any"
            />
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sectionAmenities")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={amenityIds.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                {amenity.name}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sectionMedia")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>{t("images")}</Label>
            <ImageUploader
              value={images}
              onChange={(imgs) => setValue("images", imgs)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="videoUrl">{t("videoUrl")}</Label>
              <Input id="videoUrl" placeholder="https://..." {...register("videoUrl")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="virtualTourUrl">{t("virtualTourUrl")}</Label>
              <Input
                id="virtualTourUrl"
                placeholder="https://..."
                {...register("virtualTourUrl")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/properties")}
        >
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
          {t("save")}
        </Button>
      </div>
    </form>
  );
}

function NumberField({
  id,
  label,
  register,
  step,
}: {
  id: keyof PropertyFormFields;
  label: string;
  register: UseFormRegister<PropertyFormFields>;
  step?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" step={step ?? "any"} {...register(id)} />
    </div>
  );
}

function SwitchField({
  name,
  label,
  control,
}: {
  name: "hasLivingDiningRoom" | "hasFamilyRoom" | "hasTerraceBalcony";
  label: string;
  control: Control<PropertyFormFields>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={field.value} onCheckedChange={field.onChange} />
          {label}
        </label>
      )}
    />
  );
}
