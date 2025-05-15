"use client";

import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "./command";
import { Badge } from "./badge";
import { X } from "lucide-react";

interface ComboboxProps {
    options: { id: number; nama: string }[];
    selected: { id: number; nama: string }[];
    setSelected: (val: { id: number; nama: string }[]) => void;
    placeholder?: string;
    allowMultiple?: boolean;
    onInputChange?: (val: string) => void; // ✅ Tambahkan ini
  }
  

  export function Combobox({
    options,
    selected,
    setSelected,
    placeholder,
    allowMultiple = true,
    onInputChange,
  }: ComboboxProps) {
  const [input, setInput] = useState("");

  const handleSelect = (option: { id: number; nama: string }) => {
    if (selected.find((s) => s.id === option.id)) return;
    setSelected([...selected, option]);
    setInput("");
  };

  const handleRemove = (id: number) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const filtered = options.filter(
    (opt) => opt.nama.toLowerCase().includes(input.toLowerCase()) && !selected.some((s) => s.id === opt.id)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selected.map((item) => (
          <Badge key={item.id} variant="outline" className="flex items-center gap-1">
            {item.nama}
            <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemove(item.id)} />
          </Badge>
        ))}
      </div>
      <Command>
      <CommandInput
  placeholder={placeholder}
  value={input}
  onValueChange={(val) => {
    setInput(val);
    onInputChange?.(val); // ✅ Panggil callback jika ada
  }}
/>

        <CommandList>
          <CommandEmpty>Ga nemu nih, coba nama kategori lain</CommandEmpty>
          {filtered.map((item) => (
            <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
              {item.nama}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
