import React, { useMemo } from 'react';
import TokenVisualization from './TokenVisualization';

const VisualizationContainer: React.FC = () => {
  // 테스트용 입력과 출력 텍스트
  const inputText = 'I like a dog.';
  const outputText = 'me too';

  // 테스트용 벡터 생성성
  const vectors = useMemo(() => {
    const minRange = -3;
    const maxRange = 3;

    const positions: number[][] = [];
    
    for (let i = 0; i < 7; i++) {
      // "a" 토큰 (인덱스 2)이 겹치도록: like의 위치와 동일하게 설정
      // 이후에는 길이가 0인 벡터가 생기면 이 화살촉 위에 글자가 생기도록 수정할것임
      if (i === 2) {
        positions.push([...positions[1]]);
      } else {
        const x = Math.random() * (maxRange - minRange) + minRange;
        const y = Math.random() * (maxRange - minRange) + minRange;
        const z = Math.random() * (maxRange - minRange) + minRange;
        positions.push([x, y, z]);
      }
    }
    
    return positions;
  }, []);

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
          <strong style={{ color: '#ff4d4f' }}>Output:</strong> {outputText}
        </div>
      </div>
      <TokenVisualization
        inputText={inputText}
        outputText={outputText}
        vectors={vectors}
      />
    </div>
  );
};

export default VisualizationContainer;

