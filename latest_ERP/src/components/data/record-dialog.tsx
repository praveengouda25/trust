import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoField } from "@/components/data/photo-field";
import { PhoneField } from "@/components/data/phone-field";

export type FormValues = Record<string, string>;

export type FieldSpec = {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "email"
    | "tel"
    | "photo"
    | "phone"
    | "url"
    | "datetime-local"
    | "custom";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  full?: boolean;
  /** Optional grouping heading; fields without a section render first. */
  section?: string;
  /** Return an error message, or null when the value is acceptable. */
  validate?: (value: string, values: FormValues) => string | null;
  /** Normalise the typed value (e.g. upper-case a PAN). */
  transform?: (value: string) => string;
  render?: ({
    value,
    onChange,
    values,
  }: {
    value: string;
    onChange: (value: string) => void;
    values: FormValues;
  }) => ReactNode;
};

/**
 * Small declarative create/edit dialog used by every operations module so the
 * forms stay consistent across the app. Fields may be grouped into sections.
 */
export function RecordDialog({
  title,
  description,
  fields,
  initial,
  trigger,
  submitLabel = "Save",
  open,
  onOpenChange,
  onSubmit,
  pending,
}: {
  title: string;
  description?: string;
  fields: FieldSpec[];
  initial?: FormValues;
  trigger?: ReactNode;
  submitLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (values: FormValues) => void | Promise<void>;
  pending?: boolean;
}) {
  const [values, setValues] = useState<FormValues>(initial ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(initial ?? {});
    setErrors({});
  }, [initial, open]);

  function set(field: FieldSpec, raw: string) {
    const value = field.transform ? field.transform(raw) : raw;
    setValues((v) => ({ ...v, [field.name]: value }));
    setErrors((e) => {
      if (!e[field.name]) return e;
      const next = { ...e };
      delete next[field.name];
      return next;
    });
  }

  const sections = useMemo(() => {
    const groups: { heading: string | null; items: FieldSpec[] }[] = [];
    for (const field of fields) {
      const heading = field.section ?? null;
      const last = groups[groups.length - 1];
      if (last && last.heading === heading) last.items.push(field);
      else groups.push({ heading, items: [field] });
    }
    return groups;
  }, [fields]);

  function handleSubmit() {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const value = values[f.name] ?? "";
      if (f.required && !value.trim()) {
        next[f.name] = `${f.label} is required.`;
        continue;
      }
      const error = f.validate?.(value, values);
      if (error) next[f.name] = error;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    void onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {sections.map((section, index) => (
            <div
              key={section.heading ?? `group-${index}`}
              className={
                section.heading
                  ? "rounded-lg border bg-card/50 p-4 shadow-sm"
                  : undefined
              }
            >
              {section.heading ? (
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.heading}
                </h3>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((f) => (
                  <div
                    key={f.name}
                    className={f.full || f.type === "textarea" ? "sm:col-span-2" : undefined}
                  >
                    <Label htmlFor={f.name} className="mb-1.5 block text-xs">
                      {f.label}
                      {f.required ? <span className="text-destructive"> *</span> : null}
                    </Label>

                    {f.type === "custom" && f.render ? (
                      f.render({
                        value: values[f.name] ?? "",
                        onChange: (v) => set(f, v),
                        values,
                      })
                    ) : f.type === "photo" ? (
                      <PhotoField value={values[f.name]} onChange={(p) => set(f, p)} />
                    ) : f.type === "phone" ? (
                      <PhoneField
                        id={f.name}
                        value={values[f.name]}
                        onChange={(p) => set(f, p)}
                        placeholder={f.placeholder}
                      />
                    ) : f.type === "select" ? (
                      <Select value={values[f.name] ?? ""} onValueChange={(v) => set(f, v)}>
                        <SelectTrigger id={f.name}>
                          <SelectValue placeholder={f.placeholder ?? "Select…"} />
                        </SelectTrigger>
                        <SelectContent>
                          {(f.options ?? []).map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "textarea" ? (
                      <Textarea
                        id={f.name}
                        rows={3}
                        placeholder={f.placeholder}
                        value={values[f.name] ?? ""}
                        onChange={(e) => set(f, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={f.name}
                        type={f.type}
                        step={f.type === "number" ? "any" : undefined}
                        placeholder={f.placeholder}
                        aria-invalid={errors[f.name] ? true : undefined}
                        value={values[f.name] ?? ""}
                        onChange={(e) => set(f, e.target.value)}
                      />
                    )}

                    {errors[f.name] ? (
                      <p className="mt-1 text-xs font-medium text-destructive">{errors[f.name]}</p>
                    ) : f.hint ? (
                      <p className="mt-1 text-xs text-muted-foreground">{f.hint}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const today = () => new Date().toISOString().slice(0, 10);

/** Turn empty strings into null so optional columns stay clean. */
export function clean<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === "" ? null : v;
  return out as T;
}
