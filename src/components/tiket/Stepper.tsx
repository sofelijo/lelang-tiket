import { cn } from "@/lib/utils";

interface StepperProps {
  step: number;
}

const steps = [
    "Cari Konser",
    "Cara Jual",
    "Detail Tiket",
    "Cek & Launch",
];

export function Stepper({ step }: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((label, index) => {
        const isActive = index + 1 === step;
        const isCompleted = index + 1 < step;

        return (
          <div key={label} className="flex items-center gap-2 w-full">
            {/* Circle step */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors",
                isCompleted
                  ? "bg-green-500 text-white border-green-500"
                  : isActive
                  ? "bg-gray-700 text-white border-primary"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {index + 1}
            </div>

            {/* Label */}
            <div
              className={cn(
                "text-sm truncate",
                isCompleted
                  ? "text-green-600"
                  : isActive
                  ? "text-white font-semibold" : "text-muted-foreground"
              )}
            >
              {label}
            </div>

            {/* Line connector */}
            {index !== steps.length - 1 && (
              <div className="flex-1 h-px bg-border mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
