import React, { useState, useEffect, useMemo, useRef } from 'react';
import TokenVisualization from './TokenVisualization';
import { visualizeApi, VisualizeResponse, TokenVector } from '../services/api';

// 애니메이션 프레임 설정
const TARGET_FPS = 60; //프레임 수정하려면 이거만 수정하면됨
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

const VisualizationContainer: React.FC = () => {
  // 테스트용 입력, 이후에는 유저의 요청에 맞는 입력으로 바꿀거임 
  const inputText = 'The quick brown fox jumps over the lazy dog.';
  const [visualizationData, setVisualizationData] = useState<VisualizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 애니메이션 스텝: 0 = 입력토큰만, 1~N = 출력 토큰
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // 토큰(텍스트) 모으기 애니메이션 상태
  const [isGathering, setIsGathering] = useState<boolean>(false);
  const [gatherProgress, setGatherProgress] = useState<number>(0);
  
  // 벡터 시작점에서 끝점까지 성장 애니메이션 상태
  const [isGrowing, setIsGrowing] = useState<boolean>(false);
  const [growProgress, setGrowProgress] = useState<number>(0);
  
  // 애니메이션 속도
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  
  // 타이머 ref (중복 방지)
  const animationTimerRef = useRef<number | null>(null);
  const delayTimerRef = useRef<number | null>(null);
  const growTimerRef = useRef<number | null>(null);

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
        setAnimationStep(0); // 데이터 로드 시 애니메이션 리셋
      } catch (err) {
        console.error('Error fetching output:', err);
        setError('Failed to fetch output');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutput();
  }, [inputText]);

  // 입력/출력 토큰 분리
  const { inputTokens, outputTokens } = useMemo(() => {
    if (!visualizationData) return { inputTokens: [], outputTokens: [] };
    const input = visualizationData.tokens.filter(t => t.is_input);
    const output = visualizationData.tokens.filter(t => !t.is_input);
    return { inputTokens: input, outputTokens: output };
  }, [visualizationData]);

  // 현재 스텝에 따라 표시할 토큰 필터링
  // 성장 중일 때는 성장 중인 토큰도 포함
  const visibleTokens: TokenVector[] = useMemo(() => {
    if (!visualizationData) return [];
    // 입력 토큰은 항상 표시, 출력 토큰은 스텝만큼만 표시
    const baseTokens = [...inputTokens, ...outputTokens.slice(0, animationStep)];
    
    // 성장 중일 때 다음 출력 토큰 추가
    if (isGrowing && animationStep < outputTokens.length) {
      baseTokens.push(outputTokens[animationStep]);
    }
    
    return baseTokens;
  }, [visualizationData, inputTokens, outputTokens, animationStep, isGrowing]);

  // 토큰(텍스트) 모으기 애니메이션 진행
  useEffect(() => {
    if (!isGathering) return;
    
    // 이미 타이머가 있으면 중복 방지
    if (animationTimerRef.current) return;
    
    animationTimerRef.current = window.setInterval(() => {
      setGatherProgress(prev => {
        if (prev >= 1) {
          if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current);
            animationTimerRef.current = null;
          }
          setIsGathering(false);
          setGatherProgress(0);
          // 모으기 완료 → 벡터 성장 시작
          setIsGrowing(true);
          setGrowProgress(0);
          return 0;
        }
        return prev + 0.05 * animationSpeed;
      });
    }, FRAME_INTERVAL_MS);
    
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [isGathering, animationSpeed]);

  // 벡터 성장 애니메이션 진행
  useEffect(() => {
    if (!isGrowing) return;
    
    // 이미 타이머가 있으면 중복 방지
    if (growTimerRef.current) return;
    
    growTimerRef.current = window.setInterval(() => {
      setGrowProgress(prev => {
        if (prev >= 1) {
          if (growTimerRef.current) {
            clearInterval(growTimerRef.current);
            growTimerRef.current = null;
          }
          setIsGrowing(false);
          setGrowProgress(1); // 완료 상태 유지
          // 성장 완료 → 스텝 증가
          setAnimationStep(step => step + 1);
          return 1;
        }
        return prev + 0.04 * animationSpeed;
      });
    }, FRAME_INTERVAL_MS);
    
    return () => {
      if (growTimerRef.current) {
        clearInterval(growTimerRef.current);
        growTimerRef.current = null;
      }
    };
  }, [isGrowing, animationSpeed]);

  // 자동 재생 - 다음 스텝 시작
  useEffect(() => {
    if (!isPlaying || !visualizationData || isGathering || isGrowing) return;
    
    const maxStep = outputTokens.length;
    if (animationStep >= maxStep) {
      setIsPlaying(false);
      return;
    }
    
    // 이미 타이머가 있으면 중복 방지
    if (delayTimerRef.current) return;
    
    delayTimerRef.current = window.setTimeout(() => {
      delayTimerRef.current = null;
      setIsGathering(true);
      setGatherProgress(0);
    }, 300 / animationSpeed);
    
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, [isPlaying, animationStep, isGathering, isGrowing, animationSpeed]);

  const maxOutputSteps = outputTokens.length;

  // 다음 출력 토큰의 목표 위치 계산 (벡터 중간점)
  const nextTargetPosition: [number, number, number] = useMemo(() => {
    if (!visualizationData || animationStep >= outputTokens.length) {
      return [0, 0, 0];
    }
    
    // animationStep번째 출력 토큰 
    const nextOutputToken = outputTokens[animationStep];
    if (!nextOutputToken) return [0, 0, 0];
    
    // 시작점 계산: 원점 or 이전토큰 목적지
    let startPoint: [number, number, number] = [0, 0, 0];
    if (animationStep > 0) {
      // 이전 출력 토큰 destination
      startPoint = outputTokens[animationStep - 1].destination as [number, number, number];
    } else if (inputTokens.length > 0) {
      // 첫 출력 토큰이면 마지막 입력 토큰의 destination
      startPoint = inputTokens[inputTokens.length - 1].destination as [number, number, number];
    }
    
    // 끝점, 다음 출력 토큰의 destination
    const endPoint = nextOutputToken.destination as [number, number, number];
    
    // 중간점 계산
    return [
      (startPoint[0] + endPoint[0]) / 2,
      (startPoint[1] + endPoint[1]) / 2,
      (startPoint[2] + endPoint[2]) / 2,
    ];
  }, [visualizationData, animationStep, outputTokens, inputTokens]);

  return (
    <div className="App" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* 상단 정보 패널 */}
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
          <strong style={{ color: '#ff4d4f' }}>Output:</strong>{' '}
          {isLoading 
            ? 'Loading...' 
            : outputTokens.slice(0, animationStep).map(t => t.token).join(' ') || '(waiting...)'}
        </div>
        {error && (
          <div style={{ marginTop: '10px', color: '#ff4d4f', fontSize: '12px' }}>
            {error}
          </div>
        )}
      </div>

      {/* 3D 시각화 */}
      {visualizationData && !isLoading && (
        <TokenVisualization 
          tokens={visibleTokens}
          isAnimating={isGathering}
          animationProgress={gatherProgress}
          targetPosition={nextTargetPosition}
          isGrowing={isGrowing}
          growProgress={growProgress}
        />
      )}

      {/* 하단 애니메이션 컨트롤 바 */}
      {visualizationData && !isLoading && maxOutputSteps > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px 25px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontFamily: 'monospace',
        }}>
          {/* 상단: 재생 컨트롤 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* 재생/일시정지 버튼 */}
            <button
              onClick={() => {
                if (animationStep >= maxOutputSteps) {
                  setAnimationStep(0);
                }
                setIsPlaying(!isPlaying);
              }}
              style={{
                background: isPlaying ? '#ff4d4f' : '#52c41a',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'white',
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* 슬라이더 */}
            <input
              type="range"
              min={0}
              max={maxOutputSteps}
              value={animationStep}
              onChange={(e) => {
                setIsPlaying(false);
                setAnimationStep(Number(e.target.value));
              }}
              style={{
                width: '200px',
                cursor: 'pointer',
                accentColor: '#ff4d4f',
              }}
            />

            {/* 스텝 표시 */}
            <span style={{ minWidth: '60px', textAlign: 'center' }}>
              {animationStep} / {maxOutputSteps}
            </span>
          </div>

          {/* 하단: 속도 조절 + 리셋 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
            <span>Speed:</span>
            <input
              type="range"
              min={0.25}
              max={3}
              step={0.25}
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              style={{
                width: '120px',
                cursor: 'pointer',
                accentColor: '#52c41a',
              }}
            />
            <span style={{ minWidth: '35px' }}>{animationSpeed}x</span>

            {/* 리셋 버튼 */}
            <button
              onClick={() => {
                setIsPlaying(false);
                setAnimationStep(0);
              }}
              style={{
                background: '#666',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '11px',
                marginLeft: '10px',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationContainer;

