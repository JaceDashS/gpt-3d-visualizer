import React from 'react';
import styles from './HowItWorksPage.module.css';

export const PCA_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/Principal_component_analysis';

export type Language = 'en' | 'ko' | 'ja' | 'zh';

export interface UiText {
  title: string;
  prev: string;
  next: string;
  stepLabel: (n: number, total: number) => string;
}

export interface StepContent {
  title: string;
  body: React.ReactNode;
}

export const getUiText = (language: Language): UiText => {
  const dict: Record<Language, UiText> = {
    en: {
      title: 'How it works',
      prev: 'Prev',
      next: 'Next',
      stepLabel: (n, total) => `Step ${n} / ${total}`,
    },
    ko: {
      title: 'How it works',
      prev: '이전',
      next: '다음',
      stepLabel: (n, total) => `Step ${n} / ${total}`,
    },
    ja: {
      title: 'How it works',
      prev: '前へ',
      next: '次へ',
      stepLabel: (n, total) => `Step ${n} / ${total}`,
    },
    zh: {
      title: 'How it works',
      prev: '上一页',
      next: '下一页',
      stepLabel: (n, total) => `Step ${n} / ${total}`,
    },
  };
  return dict[language];
};

export const getSteps = (language: Language): StepContent[] => {
  const dict: Record<Language, StepContent[]> = {
    en: [
      {
        title: '1) Enter text → vectorize',
        body: (
          <>
            When you enter a sentence, the model splits it into small pieces (tokens) and converts each token into a
            numeric vector (embedding).
            <br />
            Simply put, it’s <strong>turning text into numbers</strong>.
          </>
        ),
      },
      {
        title: '2) Send tokens (vectors) to the model',
        body: (
          <>
            The model receives the vectors built so far and uses them as “context” to decide what should come next.
            <br />
            This is the step where we <strong>pass the current context to the model</strong>.
          </>
        ),
      },
      {
        title: '3) Generate the next token',
        body: (
          <>
            The model picks the next token, outputs it, and then adds it back into the context.
            <br />
            Repeating this produces the sentence one token at a time.
          </>
        ),
      },
      {
        title: '4) When a vector has length 0',
        body: (
          <>
            Sometimes a token’s start and end positions collapse to the same spot, so its vector has length 0.
            <br />
            In that case there is no real arrow to draw, so <strong>you only see the token’s text label without any line attached</strong>.
          </>
        ),
      },
      {
        title: '5) Visualize high‑D vectors in 3D (PCA)',
        body: (
          <>
            Embedding vectors are usually very high-dimensional (e.g. <strong>2048D</strong>), so they’re not very
            intuitive on their own.
            <br />
            We reduce them to <strong>3D</strong> for visualization while keeping as much structure as possible. A common
            method is{' '}
            <strong>
              PCA(
              <a className={styles.link} href={PCA_WIKIPEDIA_URL} target="_blank" rel="noreferrer">
                Wikipedia
              </a>
              ).
            </strong>
          </>
        ),
      },
    ],
    ko: [
      {
        title: '1) 텍스트 입력 → 벡터화',
        body: (
          <>
            사용자가 문장을 입력하면, 모델은 문장을 작은 조각(토큰)으로 나누고 각 토큰을 숫자 벡터(임베딩)로 변환합니다.
            <br />
            쉽게 말해, 글자를 <strong>컴퓨터가 이해할 수 있는 숫자</strong>로 바꾸는 과정입니다.
          </>
        ),
      },
      {
        title: '2) 현재까지의 토큰(벡터)을 모델에 전달',
        body: (
          <>
            지금까지 만들어진 토큰 벡터들을 모델에 보내면, 모델은 이것을 “문맥”으로 사용해서 다음에 올 내용을 결정합니다.
            <br />
            즉, <strong>현재까지의 문맥을 모델에 넘겨주는 단계</strong>입니다.
          </>
        ),
      },
      {
        title: '3) 다음 토큰 생성(한 단계씩)',
        body: (
          <>
            모델은 다음에 나올 토큰을 하나 고르고, 그 결과를 다시 문맥에 더합니다.
            <br />
            이 과정을 반복하면 문장이 <strong>토큰 단위로 한 칸씩</strong> 길어집니다.
          </>
        ),
      },
      {
        title: '4) 길이가 0인 벡터는 텍스트만 보일 수 있음',
        body: (
          <>
            가끔 어떤 토큰은 시작점과 끝점이 완전히 겹쳐서 <strong>벡터의 길이가 0</strong>이 되는 경우가 있습니다.
            <br />
            이때는 실제로 그릴 수 있는 화살표(방향선)가 없기 때문에, <strong>선 없이 토큰 글자만 공중에 떠 있는 것처럼 보일 수 있습니다.</strong>
          </>
        ),
      },
      {
        title: '5) 고차원 벡터를 3D로 시각화 (PCA)',
        body: (
          <>
            임베딩 벡터는 보통 매우 높은 차원(예: <strong>2048차원</strong>)이라 그대로 보면 직관적으로 이해하기 어렵습니다.
            <br />
            그래서 구조를 최대한 유지한 채 <strong>3차원</strong>으로 줄여 화면에 보여 줍니다. 이때 자주 쓰는 방법이{' '}
            <strong>
              PCA(
              <a className={styles.link} href={PCA_WIKIPEDIA_URL} target="_blank" rel="noreferrer">
                Wikipedia
              </a>
              )입니다.
            </strong>
          </>
        ),
      },
    ],
    ja: [
      {
        title: '1) テキスト入力 → ベクトル化',
        body: (
          <>
            文を入力すると、モデルは文を小さなかたまり（トークン）に分け、各トークンを数値ベクトル（埋め込み）に変換します。
            <br />
            かんたんに言うと、テキストを<strong>コンピュータが扱える数字</strong>に変えるイメージです。
          </>
        ),
      },
      {
        title: '2) これまでのトークン（ベクトル）をモデルへ送る',
        body: (
          <>
            これまでにできたトークンベクトルをモデルに送ると、モデルはそれを「文脈」として使い、次に何が来るかを考えます。
            <br />
            ここは、<strong>現在の文脈をモデルにわたすステップ</strong>です。
          </>
        ),
      },
      {
        title: '3) 次のトークンを生成（ステップごと）',
        body: (
          <>
            モデルは次のトークンを1つ選んで出力し、そのトークンをまた文脈にくわえます。
            <br />
            このくり返しによって、文が<strong>トークン単位で少しずつ</strong>伸びていきます。
          </>
        ),
      },
      {
        title: '4) 長さが 0 のベクトルの場合',
        body: (
          <>
            ときどき、あるトークンは始点と終点がまったく同じ位置になり、<strong>ベクトルの長さが 0</strong> になることがあります。
            <br />
            このときは実際に描ける矢印（向きの線）がないため、<strong>線のないテキストラベルだけが空間に浮かんで見える</strong>ことがあります。
          </>
        ),
      },
      {
        title: '5) 高次元ベクトルを3Dで可視化（PCA）',
        body: (
          <>
            埋め込みベクトルはとても高次元（例：<strong>2048次元</strong>）なので、そのままだと直感的にイメージしづらいです。
            <br />
            そこで構造をできるだけ保ったまま <strong>3D</strong> に圧縮して表示します。よく使われる手法が{' '}
            <strong>
              PCA(
              <a className={styles.link} href={PCA_WIKIPEDIA_URL} target="_blank" rel="noreferrer">
                Wikipedia
              </a>
              )です。
            </strong>
          </>
        ),
      },
    ],
    zh: [
      {
        title: '1) 输入文本 → 向量化',
        body: (
          <>
            当你输入一句话时，模型会把它切分成更小的片段（token），并把每个 token 转成数字向量（embedding）。
            <br />
            简单说，就是把文字变成<strong>计算机可以处理的数字</strong>。
          </>
        ),
      },
      {
        title: '2) 把当前的 token（向量）发送给模型',
        body: (
          <>
            把目前已有的 token 向量发送给模型后，模型会把它们当成“上下文”，用来判断接下来应该出现什么。
            <br />
            这个步骤就是<strong>把当前上下文交给模型</strong>。
          </>
        ),
      },
      {
        title: '3) 逐步生成下一个 token',
        body: (
          <>
            模型会选出下一个 token，把它输出出来，然后再把这个 token 加回上下文里。
            <br />
            重复这样做，句子就会<strong>一个 token 一个 token 地</strong>生成出来。
          </>
        ),
      },
      {
        title: '4) 向量长度为 0 时只显示文字',
        body: (
          <>
            有时某个 token 的起点和终点会完全重合，让<strong>向量的长度变成 0</strong>。
            <br />
            这时其实没有可以画出的箭头（方向线），所以<strong>画面上可能只会看到悬在空间中的文字标签，而看不到连着的线</strong>。
          </>
        ),
      },
      {
        title: '5) 用 PCA 把高维向量可视化成 3D',
        body: (
          <>
            这些向量通常维度很高（例如<strong>2048 维</strong>），直接看并不直观。
            <br />
            我们会在尽量保留结构的前提下，把它压缩到<strong>3D</strong>来展示。常用的方法之一是{' '}
            <strong>
              PCA(
              <a className={styles.link} href={PCA_WIKIPEDIA_URL} target="_blank" rel="noreferrer">
                Wikipedia
              </a>
              )。
            </strong>
          </>
        ),
      },
    ],
  };

  return dict[language];
};


