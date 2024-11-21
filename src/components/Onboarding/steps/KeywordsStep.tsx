import React, { useState } from 'react';
import { X } from 'lucide-react';

interface KeywordsStepProps {
  onComplete: (data: { keywords: string[] }) => void;
}

export function KeywordsStep({ onComplete }: KeywordsStepProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !keywords.includes(input.trim())) {
      setKeywords([...keywords, input.trim()]);
      setInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Add keywords or topics that best describe your content focus
      </p>

      <form onSubmit={handleAddKeyword} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a keyword"
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      <button
        onClick={() => onComplete({ keywords })}
        disabled={keywords.length === 0}
        className="w-full btn-primary disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}