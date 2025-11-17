'use client';

import React, { useState } from 'react';
import { COUNTRIES, Country } from '@/lib/constants';
import { Globe, ChevronDown } from 'lucide-react';

interface CountrySelectorProps {
  value: Country;
  onChange: (country: Country) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-white border border-gray-300 rounded-lg md:rounded-xl hover:shadow-md transition-all duration-200 text-sm md:text-base font-medium text-gray-700"
      >
        <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
        <span className="hidden sm:inline">{value.name}</span>
        <span className="sm:hidden">{value.code}</span>
        <ChevronDown
          className={`w-4 h-4 ml-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full sm:w-64 bg-white border border-gray-300 rounded-lg md:rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  onChange(country);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 md:px-5 md:py-3.5 border-b border-gray-100 last:border-b-0 transition-colors ${
                  value.code === country.code
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm md:text-base">{country.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {country.constitution}
                    </p>
                  </div>
                  {value.code === country.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
