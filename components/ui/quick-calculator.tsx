"use client";
import React, { useState } from 'react';
import { Card } from './card';

const QuickCalculator = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpression(value);
    try {
      // Only allow safe math expressions
      if (/^[0-9+\-*/().\s]+$/.test(value)) {
        // eslint-disable-next-line no-eval
        const evalResult = eval(value);
        setResult(evalResult !== undefined ? String(evalResult) : null);
      } else {
        setResult('');
      }
    } catch {
      setResult('');
    }
  };

  return (
    <Card className="p-3 mb-4">
      <div className="text-xs font-semibold mb-1">Quick Calculator</div>
      <input
        type="text"
        value={expression}
        onChange={handleChange}
        placeholder="Type e.g. 1+1"
        className="w-full px-2 py-1 text-sm border rounded mb-1"
        aria-label="Quick calculator input"
      />
      <div className="text-xs text-muted-foreground">Result: <span className="font-bold">{result}</span></div>
    </Card>
  );
};

export default QuickCalculator; 