import React, { useMemo, useState, useEffect } from "react";

// 4軸（色は質問カード背景に適用）
const AXES = [
  { key: "IE", left: "I（内的充足）", right: "E（外的体験）", color: "bg-pink-100" },
  { key: "RS", left: "R（関係重視）", right: "S（自立重視）", color: "bg-blue-100" },
  { key: "NF", left: "N（今を味わう）", right: "F（未来を描く）", color: "bg-green-100" },
  { key: "SC", left: "S（安定志向）", right: "C（変化志向）", color: "bg-yellow-100" },
];

// 年代選択肢（10代〜90代）
const AGE_BANDS = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "80代", "90代"];

// 設問プール（各軸5問＝最大20問）
const QUESTION_POOL = [
  // IE
  { id: "q1", axis: "IE", text: "一人で過ごす時間が豊かさを生む", reverse: false },
  { id: "q2", axis: "IE", text: "人と話すと元気が出る", reverse: true },
  { id: "q3", axis: "IE", text: "深い内省や日記を書くことで満たされる", reverse: false },
  { id: "q13", axis: "IE", text: "初対面の人と話すとエネルギーが湧く", reverse: true },
  { id: "q14", axis: "IE", text: "静かなカフェや図書館が性に合う", reverse: false },
  // RS
  { id: "q4", axis: "RS", text: "仲間と過ごす時間が幸せ", reverse: false },
  { id: "q5", axis: "RS", text: "自分で進める方が落ち着く", reverse: true },
  { id: "q6", axis: "RS", text: "コミュニティで協力し合う経験に価値を感じる", reverse: false },
  { id: "q15", axis: "RS", text: "人に頼るより自分でやり切る方が心地よい", reverse: true },
  { id: "q16", axis: "RS", text: "仲間と達成を分かち合えると幸せを強く感じる", reverse: false },
  // NF
  { id: "q7", axis: "NF", text: "今を楽しむことが大切", reverse: false },
  { id: "q8", axis: "NF", text: "将来を計画するのが好き", reverse: true },
  { id: "q9", axis: "NF", text: "今日の小さな喜びが豊かさを左右する", reverse: false },
  { id: "q17", axis: "NF", text: "5年後の自分を具体的に思い描くことが多い", reverse: true },
  { id: "q18", axis: "NF", text: "丁寧な食事や休息が明日の活力になる", reverse: false },
  // SC
  { id: "q10", axis: "SC", text: "安定した環境が安心", reverse: false },
  { id: "q11", axis: "SC", text: "変化にワクワクする", reverse: true },
  { id: "q12", axis: "SC", text: "予測可能な予定の方が落ち着く", reverse: false },
  { id: "q19", axis: "SC", text: "未知の環境に入ると刺激的で楽しい", reverse: true },
  { id: "q20", axis: "SC", text: "安定した基盤がないと落ち着かない", reverse: false },
];

// 名言（ランダム）— PEANUTS（スヌーピー他）
const PEANUTS_QUOTES = [
  { text: "失敗したっていいじゃないか。次があるさ。", author: "チャーリー・ブラウン" },
  { text: "ときどき立ち止まって、空を見上げるんだ。", author: "スヌーピー" },
  { text: "優しさはいつだって正解よ。", author: "サリー" },
  { text: "ブランケットがあるから、ぼくは強くなれる。", author: "ライナス" },
  { text: "自分に正直でいるのは、いちばんの勇気。", author: "ルーシー" },
  { text: "小さな一歩が、いちばんむずかしい。", author: "ペパーミント・パティ" },
  { text: "言葉は少なくても、気持ちは届く。", author: "ウッドストック" },
  { text: "きょうの笑顔は、あしたの元気。", author: "スヌーピー" },
];

// 16タイプ（簡易版の名称/要約/イラスト）
const DESCRIPTIONS_16 = {
  "I-R-N-S": { name: "静穏の庭を耕す人", summary: "内面×関係×今×安定を重んじるタイプ。", img: "🌿" },
  "I-R-N-C": { name: "静寂に風を招く人", summary: "内省と関係性の両立。今を味わい、ときに変化。", img: "🍃" },
  "I-R-F-S": { name: "灯りを囲む設計者", summary: "関係性を大切に未来を描く堅実派。", img: "🕯️" },
  "I-R-F-C": { name: "静かな変革の共創者", summary: "内省×関係×未来×変化で小さく実験。", img: "🧪" },
  "I-S-N-S": { name: "自分軸を育む守人", summary: "自立×今×安定。ルーティンで充足。", img: "🧘" },
  "I-S-N-C": { name: "静かに跳ぶ探究者", summary: "一人で深く探究。時に新風で拡張。", img: "🪄" },
  "I-S-F-S": { name: "青写真の職人", summary: "安定を土台に未来を着実に形に。", img: "🎨" },
  "I-S-F-C": { name: "孤高のトレイルランナー", summary: "自分の足で未来を切り開く。", img: "🥾" },
  "E-R-N-S": { name: "縁側のホスト", summary: "外向×関係×今×安定。場を温める達人。", img: "☕" },
  "E-R-N-C": { name: "祝祭のキュレーター", summary: "今を祝うムードメーカー。", img: "🎉" },
  "E-R-F-S": { name: "灯台の航海士", summary: "人をつなぎ未来の方向を示す。", img: "🗺️" },
  "E-R-F-C": { name: "変革のコンダクター", summary: "共創で新しい流れを生む。", img: "🎺" },
  "E-S-N-S": { name: "日常のアスリート", summary: "外向×自立×今×安定。日々を走る。", img: "🏃" },
  "E-S-N-C": { name: "冒険する実務家", summary: "現場で試し改善で前進。", img: "🧭" },
  "E-S-F-S": { name: "計画駆動の先行者", summary: "外向×自立×未来×安定。", img: "📅" },
  "E-S-F-C": { name: "越境するパイオニア", summary: "未踏を切り拓く推進力。", img: "🚀" },
};

// localStorage に状態を保存するカスタムフック
function useLocal(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const v = window.localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState];
}

// 16パターン前提で各軸5問を採用
function buildQuestions() {
  const take = 5;
  const byAxis = { IE: [], RS: [], NF: [], SC: [] };
  for (const q of QUESTION_POOL) {
    const arr = byAxis[q.axis];
    if (arr.length < take) arr.push(q);
  }
  return AXES.flatMap((ax) => byAxis[ax.key]);
}

function QuestionCard({ q, value, onChange }) {
  const color = AXES.find((a) => a.key === q.axis)?.color ?? "bg-white";
  return (
    <div className={`rounded-2xl p-4 md:p-6 shadow border ${color}`}>
      <p className="text-lg md:text-xl mb-3">{q.text}</p>
      <div className="flex items-center justify-between text-sm md:text-base">
        <span className="opacity-70">まったくそう思わない</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full border ${
                value === n ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="opacity-70">とてもそう思う</span>
      </div>
    </div>
  );
}

function computeType(answers, questions) {
  const sums = { IE: 0, RS: 0, NF: 0, SC: 0 };
  for (const q of questions) {
    const v = answers[q.id];
    if (!v) continue;
    const delta = q.reverse ? -(v - 3) : v - 3; // 中央(3)からの差
    sums[q.axis] += delta;
  }

  const parts = AXES.map((ax) => (sums[ax.key] >= 0 ? ax.left[0] : ax.right[0]));
  const code16 = parts.join("-");

  return { sums, code16 };
}

function AxisBar({ value }) {
  const range = 10; // 16タイプ用のスケール（±10程度）
  const pct = Math.max(0, Math.min(100, Math.round(((value + range) / (range * 2)) * 100)));
  return (
    <div>
      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs mt-1 opacity-70">
        <span>左寄り</span>
        <span>右寄り</span>
      </div>
    </div>
  );
}

function ResultView({ answers, onReset, ageBand, questions, gender, richnessScore }) {
  const { code16, sums } = useMemo(
    () => computeType(answers, questions),
    [answers, questions]
  );
  const total = questions.length;
  const filled = Object.keys(answers).length;

  const desc16 = DESCRIPTIONS_16[code16];
  const title = desc16?.name || code16;
  const summary = desc16?.summary || "あなたの傾向の要約です。";
  const img = desc16?.img || "🌈";

  const quote = PEANUTS_QUOTES[Math.floor(Math.random() * PEANUTS_QUOTES.length)];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-3">{img}</div>
        <h2 className="text-2xl md:text-3xl font-bold">
          {title}（16パターン）
        </h2>
        <p className="text-sm opacity-70">
          回答 {filled}/{total}
          {ageBand ? ` ｜ 年代: ${ageBand}` : ""}
          {gender ? ` ｜ 性別: ${gender}` : ""}
        </p>
        <p className="opacity-80 mt-2">{summary}</p>
      </div>

      {/* あなたの今のゆたかさ点数 */}
      {typeof richnessScore === "number" && (
        <div className="rounded-2xl p-5 bg-white shadow border">
          <h3 className="font-semibold mb-2">あなたの今のゆたかさ点数</h3>
          <p className="text-sm opacity-70 mb-2">
            0〜100点のうち、今の感覚でつけた「ゆたかさ」の自己評価です。
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black"
                  style={{ width: `${Math.max(0, Math.min(100, richnessScore))}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right font-bold text-lg">{richnessScore}点</div>
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-70">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      )}

      {/* 名言カード */}
      <div className="rounded-2xl p-5 bg-white shadow border text-center">
        <blockquote className="italic text-lg">“{quote.text}”</blockquote>
        <div className="mt-2 text-sm opacity-70">— {quote.author}</div>
      </div>

      {/* 各軸バー（4軸すべて表示） */}
      <div className="grid md:grid-cols-2 gap-4">
        {AXES.map((ax) => (
          <div key={ax.key} className={`rounded-2xl p-5 shadow border ${ax.color}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">
                {ax.left} ↔ {ax.right}
              </h4>
              <span className="text-xs opacity-60">{ax.key}</span>
            </div>
            <AxisBar value={sums[ax.key] || 0} />
          </div>
        ))}
      </div>

      {/* 他タイプの簡易カード一覧（16タイプ全部） */}
      <div className="rounded-2xl p-5 bg-white/70 border">
        <h3 className="font-semibold mb-3">他のタイプを見る</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(DESCRIPTIONS_16).map(([k, v]) => (
            <div
              key={k}
              className="rounded-2xl p-3 bg-white border shadow-sm flex items-center gap-3"
            >
              <span className="text-2xl">{v.img}</span>
              <div>
                <h4 className="font-semibold">{v.name}</h4>
                <p className="text-xs opacity-70">{v.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onReset} className="px-5 py-3 rounded-xl border">
          もう一度診断する
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useLocal("ybtiv1_step", "intro"); // "intro" | "quiz" | "result"
  const [answers, setAnswers] = useLocal("ybtiv1_answers", {});
  const [ageBand, setAgeBand] = useLocal("ybtiv1_ageBand", "");
  const [gender, setGender] = useLocal("ybtiv1_gender", "");
  const [richnessScore, setRichnessScore] = useLocal("ybtiv1_richnessScore", 50); // 0〜100

  const questions = useMemo(() => buildQuestions(), []);
  const total = questions.length; // 20問
  const filled = questions.filter((q) => answers[q.id] != null).length;

  const setAnswer = (id, v) => setAnswers({ ...answers, [id]: v });

  const start = () => {
    if (!ageBand) {
      alert("年代を選択してください。");
      return;
    }
    if (!gender) {
      alert("性別を選択してください。");
      return;
    }
    setStep("quiz");
  };

  const finish = () => {
    if (filled < total) {
      alert("未回答があります。");
      return;
    }
    setStep("result");
  };

  const resetAll = () => {
    setAnswers({});
    setStep("intro");
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-300 to-white text-gray-900">
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          YBTI – ゆたかさ診断
        </h1>

        {step === "intro" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6 bg-white shadow border">
              <h2 className="font-semibold mb-3">年代を選択</h2>
              <div className="flex flex-wrap gap-2">
                {AGE_BANDS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setAgeBand(b)}
                    className={`px-3 py-1 rounded-full border ${
                      ageBand === b ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-white shadow border">
              <h2 className="font-semibold mb-3">性別を選択</h2>
              <div className="flex flex-wrap gap-2">
                {["男", "女", "その他"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-3 py-1 rounded-full border ${
                      gender === g ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {!gender && (
                <p className="text-xs mt-2 opacity-60">
                  ※はじめる前に性別を選んでください。
                </p>
              )}
            </div>

            <button
              onClick={start}
              className={`px-5 py-3 rounded-xl w-full ${
                ageBand && gender ? "bg-black text-white" : "bg-gray-300 text-gray-600"
              }`}
            >
              診断をはじめる
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div className="space-y-6">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                value={answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}

            {/* ゆたかさ点数スライダー */}
            <div className="rounded-2xl p-6 bg-white shadow border">
              <h2 className="font-semibold mb-3">あなたの今のゆたかさ点数</h2>
              <p className="text-sm opacity-70 mb-4">
                直感的に、今の自分の「ゆたかさ」を 0〜100点で教えてください。（10点刻み）
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs opacity-70 w-6 text-left">0</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={richnessScore}
                  onChange={(e) => setRichnessScore(Number(e.target.value))}
                  className="flex-1 accent-black"
                />
                <span className="text-xs opacity-70 w-10 text-right">100</span>
              </div>
              <div className="text-right mt-2 text-sm font-semibold">
                現在：<span className="text-lg">{richnessScore}</span> 点
              </div>
            </div>

            <button
              onClick={finish}
              className={`px-5 py-3 rounded-xl w-full ${
                filled < total ? "bg-gray-300 text-gray-600" : "bg-black text-white"
              }`}
            >
              結果を見る
            </button>
          </div>
        )}

        {step === "result" && (
          <ResultView
            answers={answers}
            onReset={resetAll}
            ageBand={ageBand}
            questions={questions}
            gender={gender}
            richnessScore={richnessScore}
          />
        )}
      </div>
    </div>
  );
}