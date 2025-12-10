import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface TokenData {
  token: string;
  position: [number, number, number]; // 절대 위치
  isInput: boolean;
}

interface TokenVisualizationProps {
  inputText: string;
  outputText: string;
  vectors: number[][]; // 각 토큰의 도착점 좌표 배열
}

// 벡터 화살표 컴포넌트 (시작점-끝점 방식)
const VectorArrow: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
}> = ({ start, end, color = '#4a90e2' }) => {
  const [arrow, setArrow] = useState<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    
    // 방향 벡터 계산
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    
    if (length === 0) {
      return;
    }
    
    const dir = direction.normalize();

    // 정리를 위한 이전 arrow 저장
    const previousArrow = arrow;

    // 새로운 arrow 생성
    const headLength = Math.min(length * 0.1, 0.15); // 머리길이 벡터 길이의 10% ~ 15퍼
    const headWidth = headLength * 0.4; // 머리 너비는 길이의 40%
    const newArrow = new THREE.ArrowHelper(dir, startVec, length, color, headLength, headWidth);
    setArrow(newArrow);

    // 이전 arrow 정리
    return () => {
      if (previousArrow) {
        if (previousArrow.line) {
          previousArrow.line.geometry.dispose();
          (previousArrow.line.material as THREE.Material).dispose();
        }
        if (previousArrow.cone) {
          previousArrow.cone.geometry.dispose();
          (previousArrow.cone.material as THREE.Material).dispose();
        }
      }
    };
  }, [start, end, color]);

  if (!arrow) {
    return null;
  }

  return <primitive object={arrow} />;
};

// 토큰 텍스트 컴포넌트 (선 위에 표시, 항상 카메라를 향하며 world up 방향으로 offset)
const TokenPoint: React.FC<{
  position: [number, number, number];
  token: string;
  isInput: boolean;
}> = ({ position, token, isInput }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const offset = 0.2; // 선 위로 텍스트가 올라가는 거리

  // 문자가 사용자가 보고있는 방향을 항상 보게 함 
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group position={[0, offset, 0]}>
        <Text
          fontSize={0.15}
          color={isInput ? '#52c41a' : '#ff4d4f'}
          anchorX="center"
          anchorY="middle"
        >
          {token}
        </Text>
      </group>
    </group>
  );
};


//이건 클라이언트에서 임의로 벡터를 생성하는거라 나중에 지울거임
const TokenVisualization: React.FC<TokenVisualizationProps> = ({
  inputText,
  outputText,
  vectors,
}) => {
  const inputTokens = useMemo(() => {
    const tokens: string[] = [];
    const words = inputText.split(/\s+/).filter((t) => t.length > 0);
    words.forEach((word) => {
      const match = word.match(/(\w+)([.,!?;:])?/);
      if (match) {
        tokens.push(match[1]);
        if (match[2]) {
          tokens.push(match[2]);
        }
      } else {
        tokens.push(word);
      }
    });
    return tokens;
  }, [inputText]);

  const outputTokens = useMemo(() => {
    return outputText.split(/\s+/).filter((t) => t.length > 0);
  }, [outputText]);

  const vectorPairs = useMemo(() => {
    const pairs: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    
    if (vectors.length > 0 && vectors[0].length >= 3) {
      pairs.push({
        start: [0, 0, 0],
        end: [vectors[0][0], vectors[0][1], vectors[0][2]],
      });
    }
    
    for (let i = 1; i < vectors.length; i++) {
      if (vectors[i].length >= 3 && vectors[i - 1].length >= 3) {
        pairs.push({
          start: [vectors[i - 1][0], vectors[i - 1][1], vectors[i - 1][2]],
          end: [vectors[i][0], vectors[i][1], vectors[i][2]],
        });
      }
    }
    
    return pairs;
  }, [vectors]);

  const tokenData = useMemo(() => {
    const tokens: TokenData[] = [];
    const allTokens = [...inputTokens, ...outputTokens];
    
    allTokens.forEach((token, idx) => {
      if (idx < vectorPairs.length) {
        const pair = vectorPairs[idx];
        
        const direction = new THREE.Vector3(
          pair.end[0] - pair.start[0],
          pair.end[1] - pair.start[1],
          pair.end[2] - pair.start[2]
        );
        const length = direction.length();
        
        const position: [number, number, number] = length === 0
          ? [pair.end[0], pair.end[1], pair.end[2]] 
          : [
              (pair.start[0] + pair.end[0]) / 2, 
              (pair.start[1] + pair.end[1]) / 2,
              (pair.start[2] + pair.end[2]) / 2,
            ];
        
        tokens.push({
          token,
          position,
          isInput: idx < inputTokens.length,
        });
      }
    });

    return tokens;
  }, [inputTokens, outputTokens, vectorPairs]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {vectorPairs.map((pair, idx) => (
          <VectorArrow
            key={idx}
            start={pair.start}
            end={pair.end}
            color={idx < inputTokens.length ? '#52c41a' : '#ff4d4f'}
          />
        ))}

        {tokenData.map((data, idx) => (
          <TokenPoint
            key={idx}
            position={data.position}
            token={data.token}
            isInput={data.isInput}
          />
        ))}

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        <axesHelper args={[2]} />

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
        //   각도를 제한하지 않으면 선을 중심으로 글자가 회전함
          minPolarAngle={10 * Math.PI / 180} // 위쪽에서 10도 제한 (-80도)
          maxPolarAngle={170 * Math.PI / 180} // 아래쪽에서 10도 제한 (80도)
        />
      </Canvas>
    </div>
  );
};

export default TokenVisualization;
