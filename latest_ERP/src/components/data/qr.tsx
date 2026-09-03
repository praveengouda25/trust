import { useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Absolute URL a scanner should open for a record. */
export function recordUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function QrTag({ value, size = 96 }: { value: string; size?: number }) {
  return (
    <div className="inline-flex rounded-md border border-border bg-white p-2">
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}

/** Small QR button that opens a printable code for any record. */
export function QrButton({
  value,
  title,
  subtitle,
  children,
}: {
  value: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`QR code for ${title}`}
          onClick={(e) => e.stopPropagation()}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm print:shadow-none">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <QrTag value={value} size={190} />
          <p className="break-all text-center text-[10px] text-muted-foreground">{value}</p>
          {children}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
