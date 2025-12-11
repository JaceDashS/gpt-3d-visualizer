import React, { useState, useEffect } from 'react';
import TokenVisualization from './TokenVisualization';
import { visualizeApi, VisualizeResponse } from '../services/api';

const VisualizationContainer: React.FC = () => {
  // 테스트용 입력, 이후에는 유저의 요청에 맞는 입력으로 바꿀거임 
  const inputText = 'The quick brown fox jumps over the lazy dog.';
  const [visualizationData, setVisualizationData] = useState<VisualizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // POST
  useEffect(() => {
    const fetchOutput = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await visualizeApi.getTokenVectors(inputText);
        setVisualizationData({
          tokens: result.tokens,
        });
      } catch (err) {
        console.error('Error fetching output:', err);
        setError('Failed to fetch output');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutput();
  }, [inputText]);

  return (
    <div className="App">
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#52c41a' }}>Input:</strong> {inputText}
        </div>
        <div>
          <strong style={{ color: '#ff4d4f' }}>Output:</strong> {isLoading ? 'Loading...' : visualizationData?.tokens.filter(t => !t.is_input).map(t => t.token).join(' ')}
        </div>
        {error && (
          <div style={{ marginTop: '10px', color: '#ff4d4f', fontSize: '12px' }}>
            {error}
          </div>
        )}
      </div>
      {visualizationData && !isLoading && (
        <TokenVisualization
          tokens={visualizationData.tokens}
        />
      )}
    </div>
  );
};

export default VisualizationContainer;

