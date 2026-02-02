'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/ui/input';
import { SearchIcon } from 'lucide-react';

interface SearchTodoProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchTodo({ value, onChange }: SearchTodoProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        placeholder="Search todos..."
        value={debouncedValue}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
}