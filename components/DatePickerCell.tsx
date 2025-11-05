import React, { useState, useRef, useEffect } from 'react';

interface DatePickerCellProps {
  value: string; // DD/MM/YYYY
  onChange: (newValue: string) => void;
}

const DatePickerCell: React.FC<DatePickerCellProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toInputFormat = (date: string): string => {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const fromInputFormat = (date: string): string => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange(fromInputFormat(e.target.value));
    }
    setIsEditing(false);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={toInputFormat(value)}
        onChange={handleDateChange}
        onBlur={handleBlur}
        className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="cursor-pointer p-1 rounded-md hover:bg-gray-100">
      {value}
    </div>
  );
};

export default DatePickerCell;
