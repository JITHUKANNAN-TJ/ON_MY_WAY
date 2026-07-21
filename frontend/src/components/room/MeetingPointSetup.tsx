import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface MeetingPointSetupProps {
  onSet: (name: string, lat: number, lng: number) => void;
  onClear: () => void;
  meetingPoint: string | null;
}

export function MeetingPointSetup({ onSet, onClear, meetingPoint }: MeetingPointSetupProps) {
  const [name, setName] = useState(meetingPoint || "");
  const [coords, setCoords] = useState("");
  const [error, setError] = useState("");

  const handleSet = () => {
    if (!name.trim()) {
      setError("Enter a meeting point name");
      return;
    }
    if (!coords.trim()) {
      setError("Click the map to set coordinates, or enter lat,lng");
      return;
    }
    const parts = coords.split(",").map(Number);
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      setError("Invalid coordinates");
      return;
    }
    setError("");
    onSet(name.trim(), parts[0], parts[1]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">Meeting Point</h3>
        {meetingPoint && (
          <button onClick={onClear} className="text-xs text-danger hover:underline">
            Clear
          </button>
        )}
      </div>

      <Input
        placeholder="e.g. College Main Gate"
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Location Name"
      />

      <div className="space-y-1">
        <p className="text-xs text-text-secondary">
          Click on the map or enter coordinates:
        </p>
        <div className="flex gap-2">
          <input
            className="input-field text-sm flex-1"
            placeholder="lat, lng"
            value={coords}
            onChange={(e) => setCoords(e.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0"
            onClick={handleSet}
          >
            Set
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {meetingPoint && (
        <p className="text-xs text-primary">📍 {meetingPoint}</p>
      )}
    </div>
  );
}
