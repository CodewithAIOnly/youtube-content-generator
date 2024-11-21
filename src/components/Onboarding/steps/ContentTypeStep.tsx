import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const contentTypes = [
  { id: 'tech', label: 'Tech Tutorials', icon: '💻' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
];

interface ContentTypeStepProps {
  onComplete: (data: { contentType: string[] }) => void;
}

export function ContentTypeStep({ onComplete }: ContentTypeStepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Select the type of content you create or plan to create
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => toggleSelection(type.id)}
            className={`p-4 rounded-lg border-2 text-left relative ${
              selected.includes(type.id)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl mb-2 block">{type.icon}</span>
            <span className="font-medium text-gray-900">{type.label}</span>
            {selected.includes(type.id) && (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 absolute top-2 right-2" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onComplete({ contentType: selected })}
        disabled={selected.length === 0}
        className="w-full btn-primary disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}