import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

import { TokenVector } from '../services/api';

// 텍스트가 벡터 위로 올라가는 거리
const TEXT_OFFSET_Y = 0.2;

// 카메라 수직 회전 각도 제한 (도 단위)
const CAMERA_MIN_POLAR_ANGLE_DEG = 10; // 위쪽 제한
const CAMERA_MAX_POLAR_ANGLE_DEG = 170; // 아래쪽 제한
const CAMERA_MIN_POLAR_ANGLE = CAMERA_MIN_POLAR_ANGLE_DEG * Math.PI / 180;
const CAMERA_MAX_POLAR_ANGLE = CAMERA_MAX_POLAR_ANGLE_DEG * Math.PI / 180;

interface TokenData {
  token: string;
  position: [number, number, number]; // 절대 위치
  isInput: boolean;
}

interface TokenVisualizationProps {
  tokens: TokenVector[]; // 토큰과 벡터 정보가 함께 묶인 배열
  // 모으기 애니메이션 관련 props
  isAnimating?: boolean; // 현재 모으기 애니메이션 진행 중인지
  animationProgress?: number; // 0~1 모으기 애니메이션 진행도
  targetPosition?: [number, number, number]; // 토큰(텍스트)들이 모여드는 목표 위치
  // 벡터 성장 애니메이션 관련 props
  isGrowing?: boolean; // 현재 벡터 성장 중인지
  growProgress?: number; // 0~1 벡터 성장 진행도
}

// 벡터 화살표 컴포넌트 (시작점-끝점 방식)
const VectorArrow: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  growProgress?: number; // 0~1, 1이면 완전히 그려짐
}> = ({ start, end, color = '#4a90e2', growProgress = 1 }) => {
  const [arrow, setArrow] = useState<THREE.ArrowHelper | null>(null);

  useEffect(() => {
    const startVec = new THREE.Vector3(...start);
    const fullEndVec = new THREE.Vector3(...end);
    
    // arrow 성장 진행도에 따라 끝점 계산
    const currentEndVec = new THREE.Vector3().lerpVectors(startVec, fullEndVec, growProgress);
    
    // 방향 벡터 계산
    const direction = new THREE.Vector3().subVectors(currentEndVec, startVec);
    const length = direction.length();
    
    if (length === 0 || growProgress === 0) {
      setArrow(null);
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
  }, [start, end, color, growProgress]);

  if (!arrow) {
    return null;
  }

  return <primitive object={arrow} />;
};

// 토큰 텍스트 컴포넌트 
// 선 위에 항상 카메라를 향하는 텍스트 표시
const TokenPoint: React.FC<{
  position: [number, number, number];
  token: string;
  isInput: boolean;
  opacity?: number;
}> = ({ position, token, isInput, opacity = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // 문자가 사용자가 보고있는 방향을 항상 보게 함 
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group position={[0, TEXT_OFFSET_Y, 0]}>
        <Text
          fontSize={0.15}
          color={isInput ? '#52c41a' : '#ff4d4f'}
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity}
        >
          {token}
        </Text>
      </group>
    </group>
  );
};

// 텍스트가 모여드는 토큰 애니메이션 컴포넌트
const GatheringToken: React.FC<{
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  token: string;
  isInput: boolean;
  progress: number; // 0~1
}> = ({ startPosition, targetPosition, token, isInput, progress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // 현재 위치 계산 (lerp)
  const currentPosition: [number, number, number] = [
    startPosition[0] + (targetPosition[0] - startPosition[0]) * progress,
    startPosition[1] + (targetPosition[1] - startPosition[1]) * progress,
    startPosition[2] + (targetPosition[2] - startPosition[2]) * progress,
  ];
  
  // 진행도에 따라 투명도 조절 (마지막에 사라짐)
  const opacity = progress < 0.9 ? 0.7 : (1 - progress) * 7;
  
  // 진행도에 따라 크기 조절 (마지막에 작아짐)
  const scale = progress < 0.8 ? 1 : 1 - (progress - 0.8) * 5;
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  return (
    <group ref={groupRef} position={currentPosition} scale={[scale, scale, scale]}>
      <group position={[0, TEXT_OFFSET_Y, 0]}>
        <Text
          fontSize={0.12}
          color={isInput ? '#52c41a' : '#ff4d4f'}
          anchorX="center"
          anchorY="middle"
          fillOpacity={opacity}
        >
          {token}
        </Text>
      </group>
    </group>
  );
};

//전체 시각화 (좌표나 화살표등을 랜더링해줌)
const TokenVisualization: React.FC<TokenVisualizationProps> = ({
  tokens,
  isAnimating = false,
  animationProgress = 0,
  targetPosition = [0, 0, 0],
  isGrowing = false,
  growProgress = 1,
}) => {
  // 시작점을 클라이언트에서 추적하며 토큰 위치 계산
  const calculateTokenPositions = (): TokenData[] => {
    const tokenData: TokenData[] = [];
    let currentStart: [number, number, number] = [0, 0, 0]; // 첫 번째 벡터는 원점에서 시작
    
    let i = 0;
    while (i < tokens.length) {
      const tv = tokens[i];
      const startVec = new THREE.Vector3(...currentStart);
      const endVec = new THREE.Vector3(...tv.destination);
      
      // 방향 벡터 계산
      const direction = new THREE.Vector3().subVectors(endVec, startVec);
      const length = direction.length();
      
      if (length === 0) {
        // 연속된 길이0의 벡터가 있는지 찾아야함.
        // 따로 분류하지 않으면 텍스트가 겹침침
        const zeroLengthGroup: number[] = [];
        let j = i;
        let groupStart = currentStart;
        
        // 연속된 길이 0 벡터 수집
        while (j < tokens.length) {
          const currentTv = tokens[j];
          const currentStartVec = new THREE.Vector3(...groupStart);
          const currentEndVec = new THREE.Vector3(...currentTv.destination);
          const currentDir = new THREE.Vector3().subVectors(currentEndVec, currentStartVec);
          
          if (currentDir.length() === 0) {
            zeroLengthGroup.push(j);
            j++;
            // 다음 그룹의 시작점은 현재 목적지 (변경 없음)
          } else {
            break;
          }
        }
        
        // 그룹 내에서 연속된 같은 타입의 토큰들을 묶어서 하나의 텍스트로 표시
        // 타입이 바뀌면 색상도 바뀌지만 같은 줄에 표시
        const centerPosition = new THREE.Vector3(tv.destination[0], tv.destination[1], tv.destination[2]);
        const fontSize = 0.15; // Text 컴포넌트의 fontSize와 일치
        const charWidth = fontSize * 0.6; // 각 문자의 대략적인 너비
        const spaceWidth = fontSize * 0.3; // 공백의 너비
        
        // 전체 그룹의 총 너비 계산 (중앙 정렬을 위해)
        let totalWidth = 0;
        const groups: Array<{ tokens: number[]; isInput: boolean; text: string }> = [];
        
        // 연속된 같은 타입의 토큰들을 그룹화
        let i_group = 0;
        while (i_group < zeroLengthGroup.length) {
          const startIdx = zeroLengthGroup[i_group];
          const startType = tokens[startIdx].is_input;
          const groupTokens: number[] = [startIdx];
          
          // 같은 타입의 연속된 토큰들 수집
          let j_group = i_group + 1;
          while (j_group < zeroLengthGroup.length && tokens[zeroLengthGroup[j_group]].is_input === startType) {
            groupTokens.push(zeroLengthGroup[j_group]);
            j_group++;
          }
          
          // 그룹의 토큰들을 하나의 텍스트로 합치기
          const combinedTokens = groupTokens.map(idx => tokens[idx].token).join(' ');
          const textWidth = combinedTokens.length * charWidth + (groupTokens.length - 1) * spaceWidth;
          
          groups.push({
            tokens: groupTokens,
            isInput: startType,
            text: combinedTokens,
          });
          
          totalWidth += textWidth;
          if (j_group < zeroLengthGroup.length) {
            totalWidth += spaceWidth; // 그룹 사이 공백
          }
          
          i_group = j_group;
        }
        
        // 각 그룹을 중앙 정렬하여 배치
        let currentX = -totalWidth / 2;
        groups.forEach(group => {
          const textWidth = group.text.length * charWidth + (group.tokens.length - 1) * spaceWidth;
          const groupPosition = new THREE.Vector3(
            centerPosition.x + currentX + textWidth / 2,
            centerPosition.y,
            centerPosition.z
          );
          
          tokenData.push({
            token: group.text,
            position: [groupPosition.x, groupPosition.y, groupPosition.z],
            isInput: group.isInput,
          });
          
          currentX += textWidth + spaceWidth;
        });
        
        currentStart = tv.destination;
        i = j; 
      } else {
        // 길이가 0이 아닌 경우: 항상 화살표 중간에 텍스트 배치
        const midPoint = new THREE.Vector3()
          .addVectors(startVec, endVec)
          .multiplyScalar(0.5);
        
        tokenData.push({
          token: tv.token,
          position: [midPoint.x, midPoint.y, midPoint.z],
          isInput: tv.is_input,
        });
        
        // 다음 벡터의 시작점은 현재 목적지
        currentStart = tv.destination;
        i++;
      }
    }
    
    return tokenData;
  };
  
  const tokenData = calculateTokenPositions();
  
  // 화살표 렌더링을 위한 시작점 추적
  const getArrowData = () => {
    const arrows: Array<{ start: [number, number, number]; end: [number, number, number]; color: string }> = [];
    let currentStart: [number, number, number] = [0, 0, 0];
    
    for (const tv of tokens) {
      arrows.push({
        start: currentStart,
        end: tv.destination,
        color: tv.is_input ? '#52c41a' : '#ff4d4f',
      });
      currentStart = tv.destination;
    }
    
    return arrows;
  };
  
  const arrowData = getArrowData();

  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {arrowData.map((arrow, idx) => {
          // 성장 중인 마지막 벡터인지 확인
          const isGrowingArrow = isGrowing && idx === arrowData.length - 1;
          return (
            <VectorArrow
              key={idx}
              start={arrow.start}
              end={arrow.end}
              color={arrow.color}
              growProgress={isGrowingArrow ? growProgress : 1}
            />
          );
        })}

        {tokenData.map((data, idx) => (
          <TokenPoint
            key={idx}
            position={data.position}
            token={data.token}
            isInput={data.isInput}
          />
        ))}

        {/* 모여드는 토큰 애니메이션 */}
        {isAnimating && tokenData.map((data, idx) => (
          <GatheringToken
            key={`gathering-${idx}`}
            startPosition={data.position}
            targetPosition={targetPosition}
            token={data.token}
            isInput={data.isInput}
            progress={animationProgress}
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
          // 각도를 제한하지 않으면 선을 중심으로 글자가 회전함
          minPolarAngle={CAMERA_MIN_POLAR_ANGLE}
          maxPolarAngle={CAMERA_MAX_POLAR_ANGLE}
        />
      </Canvas>
    </div>
  );
};

export default TokenVisualization;
