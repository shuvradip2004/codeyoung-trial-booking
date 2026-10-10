import { useMemo } from 'react';
import { allTimezones, COMMON_ZONES } from '../utils/timezones.js';

export default function TimezoneSelect({ value, onChange }) {
  const zones = useMemo(() => allTimezones(), []);
  return (
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <optgroup label="Common">
        {COMMON_ZONES.map((z) => (
          <option key={`c-${z}`} value={z}>{z.replace('_', ' ')}</option>
        ))}
      </optgroup>
      <optgroup label="All time zones">
        {zones.map((z) => (
          <option key={z} value={z}>{z.replace(/_/g, ' ')}</option>
        ))}
      </optgroup>
    </select>
  );
}
