"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileTextIcon, UploadIcon, SaveIcon, SettingsIcon } from "lucide-react";
import { getCSVHash, getCSVFormat } from "@/lib/csv";
import {
  REPORTING_TYPE,
  REPORTING_CURRENCY,
  REPORTING_DELIMITER,
} from "@/lib/prisma/enums";
import {
  CreateReportingData,
  createReportingSchema,
} from "@/validators/system/reporting";
import {
  checkReportingHashExists,
  checkReportingNameExists,
  createReporting,
} from "@/actions/system/reporting";

interface TreeifyErrorStructure {
  properties?: Record<
    string,
    {
      errors: string[];
    }
  >;
}

interface ExtractedErrors {
  fieldErrors: Record<string, string>;
}

function extractServerErrors(errors: unknown): ExtractedErrors {
  const fieldErrors: Record<string, string> = {};

  if (!errors || typeof errors !== "object") {
    return { fieldErrors };
  }

  const errorObj = errors as TreeifyErrorStructure;

  // Get first error for each field
  if (errorObj.properties && typeof errorObj.properties === "object") {
    for (const [key, value] of Object.entries(errorObj.properties)) {
      if (
        value &&
        typeof value === "object" &&
        "errors" in value &&
        Array.isArray(value.errors) &&
        value.errors.length > 0
      ) {
        fieldErrors[key] = value.errors[0];
      }
    }
  }

  return { fieldErrors };
}

export default function ReportingForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    resetField,
    formState: { errors },
    setError,
  } = useForm<CreateReportingData>({
    resolver: zodResolver(createReportingSchema),
    defaultValues: {
      // Remove default values for auto-detected fields
    },
  });

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        // Auto-set name from file name (remove extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setValue("name", nameWithoutExt);

        // Generate hash from file content and detect format
        try {
          const content = await file.text();
          const hash = await getCSVHash(content);
          setValue("hash", hash);

          const format = getCSVFormat(content);
          setValue("type", format.type);
          setValue("currency", format.currency);
          setValue("delimiter", format.delimiter);
          setValue("reportingMonth", format.reportingMonth);
          setValue("netRevenue", format.netRevenue);
        } catch (error) {
          console.error("Error reading file for hash generation:", error);
          toast.error(
            (error instanceof Error ? error.message : undefined) ||
              "Failed to read file for processing. Please try again."
          );
          setValue("hash", "");
        }

        setValue("file", file);
      } else {
        setSelectedFile(null);
        resetField("name");
        resetField("hash");
        resetField("type");
        resetField("currency");
        resetField("delimiter");
        resetField("reportingMonth");
        resetField("netRevenue");
        resetField("file");
      }
    },
    [resetField, setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    resetField("name");
    resetField("hash");
    resetField("type");
    resetField("currency");
    resetField("delimiter");
    resetField("reportingMonth");
    resetField("netRevenue");
    resetField("file");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetField]);

  const onSubmit = async (data: CreateReportingData) => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const nameExistsResult = await checkReportingNameExists(data.name);

      if (!nameExistsResult.success) {
        const { fieldErrors } = extractServerErrors(nameExistsResult.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateReportingData, {
            type: "manual",
            message,
          });
        });

        if (nameExistsResult.message) {
          setFormMessage(nameExistsResult.message);
          toast.error(nameExistsResult.message);
        } else {
          setFormMessage("Failed to check reporting. Please try again.");
          toast.error("Failed to check reporting. Please try again.");
        }
        return;
      }

      if (nameExistsResult.data.nameExists) {
        if (nameExistsResult.message) {
          setFormMessage(nameExistsResult.message);
          toast.error(nameExistsResult.message);
        } else {
          setFormMessage("A reporting with this name already exists.");
          toast.error("A reporting with this name already exists.");
        }
        return;
      }

      const hashExistsResult = await checkReportingHashExists(data.hash);

      if (!hashExistsResult.success) {
        const { fieldErrors } = extractServerErrors(hashExistsResult.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateReportingData, {
            type: "manual",
            message,
          });
        });

        if (hashExistsResult.message) {
          setFormMessage(hashExistsResult.message);
          toast.error(hashExistsResult.message);
        } else {
          setFormMessage("Failed to check reporting. Please try again.");
          toast.error("Failed to check reporting. Please try again.");
        }
        return;
      }

      if (hashExistsResult.data.hashExists) {
        if (hashExistsResult.message) {
          setFormMessage(hashExistsResult.message);
          toast.error(hashExistsResult.message);
        } else {
          setFormMessage("This reporting file has already been uploaded.");
          toast.error("This reporting file has already been uploaded.");
        }
        return;
      }

      const result = await createReporting(data);

      if (!result.success) {
        const { fieldErrors } = extractServerErrors(result.errors);

        // Set field errors
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateReportingData, {
            type: "manual",
            message,
          });
        });

        if (result.message) {
          setFormMessage(result.message);
          toast.error(result.message);
        } else {
          setFormMessage("Failed to create reporting. Please try again.");
          toast.error("Failed to create reporting. Please try again.");
        }
        return;
      }

      toast.success(result.message || "Reporting created successfully!");
      router.push("/system/administration/reporting");
    } catch (err) {
      console.error("Error creating reporting:", err);
      setFormMessage("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-none px-0 py-1 sm:px-0 sm:py-2 md:px-0 md:py-4">
      <div className="mx-auto max-w-full space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileTextIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Reporting
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload and configure a new reporting file
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formMessage && (
            <Alert variant="destructive">
              <AlertDescription>{formMessage}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="size-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Upload a CSV file for reporting (max 25MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="file">CSV File</FieldLabel>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadIcon className="mr-2 size-4" />
                      Choose CSV File
                    </Button>
                    {selectedFile && (
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  {errors.file && (
                    <FieldError>{errors.file.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="name">Report Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Auto-filled from file name"
                    disabled
                    className="bg-muted"
                    {...register("name")}
                  />
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="hash">File Hash</FieldLabel>
                  <Input
                    id="hash"
                    placeholder="Auto-generated from file content"
                    disabled
                    className="bg-muted font-mono text-xs"
                    {...register("hash")}
                  />
                  {errors.hash && (
                    <FieldError>{errors.hash.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="size-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure the reporting settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="type">Type</FieldLabel>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select value={field.value} disabled>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Auto-detected from CSV" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={REPORTING_TYPE.ANS}>
                            ANS
                          </SelectItem>
                          <SelectItem value={REPORTING_TYPE.BELIEVE}>
                            BELIEVE
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-detected from CSV
                  </p>
                  {errors.type && (
                    <FieldError>{errors.type.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="currency">Currency</FieldLabel>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select value={field.value} disabled>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Auto-detected from CSV" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={REPORTING_CURRENCY.USD}>
                            USD
                          </SelectItem>
                          <SelectItem value={REPORTING_CURRENCY.EUR}>
                            EUR
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-detected from CSV
                  </p>
                  {errors.currency && (
                    <FieldError>{errors.currency.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="delimiter">Delimiter</FieldLabel>
                  <Controller
                    control={control}
                    name="delimiter"
                    render={({ field }) => (
                      <Select value={field.value} disabled>
                        <SelectTrigger className="bg-muted">
                          <SelectValue placeholder="Auto-detected from CSV" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={REPORTING_DELIMITER.COMMA}>
                            Comma (,)
                          </SelectItem>
                          <SelectItem value={REPORTING_DELIMITER.SEMICOLON}>
                            Semicolon (;)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-detected from CSV
                  </p>
                  {errors.delimiter && (
                    <FieldError>{errors.delimiter.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="reportingMonth">
                    Reporting Month
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="reportingMonth"
                    render={({ field }) => (
                      <Input
                        id="reportingMonth"
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        placeholder="Auto-calculated from CSV"
                        disabled
                        className="bg-muted"
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from CSV
                  </p>
                  {errors.reportingMonth && (
                    <FieldError>{errors.reportingMonth.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="netRevenue">
                    Total Net Revenue
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="netRevenue"
                    render={({ field }) => (
                      <Input
                        id="netRevenue"
                        value={
                          field.value !== undefined
                            ? `${field.value.toFixed(3)} ${watch("currency") === REPORTING_CURRENCY.USD ? "USD" : "EUR"}`
                            : "0.000"
                        }
                        placeholder="Auto-calculated from CSV"
                        disabled
                        className="bg-muted"
                      />
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from CSV
                  </p>
                  {errors.netRevenue && (
                    <FieldError>{errors.netRevenue.message}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => router.back()}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Creating...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" />
                  Create Reporting
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
