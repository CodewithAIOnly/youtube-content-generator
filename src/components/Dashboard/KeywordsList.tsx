import React from 'react';

interface KeywordsListProps {
  keywords: string[];
}

export function KeywordsList({ keywords }: KeywordsListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Content Keywords
      </h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}