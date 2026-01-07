import React from 'react';
import { formatDateLabel } from "../../utils/date"

interface DateBadgeProps {
  date: string | Date;
}

const DateBadge: React.FC<DateBadgeProps> = ({ date }) => (
  <div className="flex justify-center my-4 sticky top-2 z-10 opacity-90 pointer-events-none">
    <span className="bg-gray-800 text-gray-400 text-[11px] font-bold px-3 py-1 rounded-full border border-white/5 shadow-sm uppercase tracking-wider">
      {formatDateLabel(date)}
    </span>
  </div>
);

export default DateBadge;