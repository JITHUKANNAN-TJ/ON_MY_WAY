import { useState, useEffect, useRef, useCallback, ReactNode } from "react";

interface Suggestion {
  display_name: string;
  lat: number;
  lng: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: Suggestion) => void;
  label?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
}

export function LocationAutocomplete({ value, onChange, onSelect, label, placeholder, leftIcon }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data: { display_name: string; lat: string; lon: string }[] = await res.json();
      setSuggestions(
        data.map((item) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
      setIsOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(value), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion);
    onChange(suggestion.display_name);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const showEmpty = isOpen && !loading && suggestions.length === 0 && value.trim().length >= 3;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          maxLength={100}
          autoComplete="off"
          className={`input-field ${leftIcon ? "pl-10" : ""} pr-10`}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-[calc(100%-2rem)] max-w-lg bg-surface border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden animate-fade-in"
          style={{ width: inputRef.current ? `${inputRef.current.offsetWidth}px` : undefined }}
        >
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lng}`}
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                i === selectedIndex
                  ? "bg-primary/10 text-text"
                  : "text-text-secondary hover:bg-white/[0.04] hover:text-text"
              } ${i < suggestions.length - 1 ? "border-b border-white/[0.04]" : ""}`}
            >
              <span className="line-clamp-2">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {showEmpty && (
        <div className="absolute z-50 mt-1 w-[calc(100%-2rem)] max-w-lg bg-surface border border-white/[0.06] rounded-xl shadow-2xl px-4 py-3 text-sm text-text-secondary animate-fade-in">
          No locations found
        </div>
      )}
    </div>
  );
}
