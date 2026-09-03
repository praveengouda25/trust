import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  COUNTRY_LIST,
  OTHER,
  STATE_LIST,
  districtsFor,
  taluksFor,
  toOptions,
  villagesFor,
} from "@/lib/geo-data";

export type AddressValue = {
  country: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  custom_village: string;
};

export const EMPTY_ADDRESS: AddressValue = {
  country: "India",
  state: "",
  district: "",
  taluk: "",
  village: "",
  custom_village: "",
};

/**
 * Cascading Country → State → District → Taluk → Village picker. When the
 * village is not listed, "Other" reveals a free-text box that is saved as
 * `custom_village`.
 */
export function AddressPicker({
  value,
  onChange,
}: {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
}) {
  const [openOther, setOpenOther] = useState(value.village === OTHER);

  const districts = useMemo(() => districtsFor(value.state), [value.state]);
  const taluks = useMemo(() => taluksFor(value.district), [value.district]);
  const villages = useMemo(() => villagesFor(value.taluk), [value.taluk]);

  function patch(next: Partial<AddressValue>) {
    onChange({ ...value, ...next });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Country">
        <Select
          value={value.country}
          onValueChange={(v) =>
            patch({ country: v, state: "", district: "", taluk: "", village: "", custom_village: "" })
          }
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {toOptions(COUNTRY_LIST).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="State">
        <Select
          value={value.state}
          onValueChange={(v) => {
            setOpenOther(false);
            patch({ state: v, district: "", taluk: "", village: "", custom_village: "" });
          }}
        >
          <SelectTrigger id="state">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {toOptions(STATE_LIST).map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="District">
        <Select
          value={value.district}
          disabled={!value.state}
          onValueChange={(v) => {
            setOpenOther(false);
            patch({ district: v, taluk: "", village: "", custom_village: "" });
          }}
        >
          <SelectTrigger id="district">
            <SelectValue placeholder={value.state ? "Select district" : "Select state first"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Taluk">
        <Select
          value={value.taluk}
          disabled={!value.district}
          onValueChange={(v) => {
            setOpenOther(false);
            patch({ taluk: v, village: "", custom_village: "" });
          }}
        >
          <SelectTrigger id="taluk">
            <SelectValue placeholder={value.district ? "Select taluk" : "Select district first"} />
          </SelectTrigger>
          <SelectContent>
            {taluks.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Village">
        <Select
          value={value.village}
          disabled={!value.taluk}
          onValueChange={(v) => {
            setOpenOther(v === OTHER);
            patch({ village: v, custom_village: v === OTHER ? value.custom_village : "" });
          }}
        >
          <SelectTrigger id="village">
            <SelectValue placeholder={value.taluk ? "Select village" : "Select taluk first"} />
          </SelectTrigger>
          <SelectContent>
            {villages.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {openOther || value.village === OTHER ? (
        <Field label="Enter village name">
          <Input
            id="custom_village"
            placeholder="Village name"
            value={value.custom_village}
            onChange={(e) => patch({ custom_village: e.target.value })}
          />
        </Field>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}
