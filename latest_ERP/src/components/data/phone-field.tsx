import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, joinPhone, phoneError, splitPhone } from "@/lib/form-options";

/**
 * International phone field: country dial-code selector plus the national
 * number. Value is stored as a single string like "+91 9876543210".
 */
export function PhoneField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string | undefined;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const { dial, number } = useMemo(() => splitPhone(value), [value]);
  const error = phoneError(dial, number);

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Select value={dial} onValueChange={(d) => onChange(joinPhone(d, number))}>
          <SelectTrigger className="w-[7.5rem] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.dial}>
                {c.flag} {c.dial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder ?? "9876543210"}
          value={number}
          onChange={(e) => onChange(joinPhone(dial, e.target.value))}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
