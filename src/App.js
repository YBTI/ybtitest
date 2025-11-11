import React, { useMemo, useState, useEffect } from "react";

// YBTI（Your Blooming Type Indicator）– Demo Web App（JS版）
// パステルカラー／4色区分／4or16モード選択／結果一覧／イラスト＋名言

// 4軸設定（背景色つき）
const AXES = [
  { key: "IE", left: "I（内的充足）", right: "E（外的体験）", color: "bg-pink-100" },
  { key: "RS", left: "R（関係重視）", right: "S（自立重視）", color: "bg-blue-100" },
  { key: "NF", left: "N（今を味わう）", right: "F（未来を描く）", color: "bg-green-100" },
  { key: "SC", left: "S（安定志向）", right: "C（変化志向）", color: "bg-yellow-100" },
];

// 年代選択肢
const AGE_BANDS = ["10代", "20代", "30代", "40代", "50代", "60代", "70代", "80代", "90代"];

// 設問プール
const QUESTION_POOL = [
  { id: "q1", axis: "IE", text: "一人で過ごす時間が豊かさを生む", reverse: false },
  { id: "q2", axis: "IE", text: "人と話すと元気が出る", reverse: true },
  { id: "q3", axis: "IE", text: "深い内省や日記を書くことで満たされる", reverse: false },
  { id: "q4", axis: "RS", text: "仲間と過ごす時間が幸せ", reverse: false },
  { id: "q5", axis: "RS", text: "自分で進める方が落ち着く", reverse: true },
  { id: "q6", axis: "NF", text: "今を楽しむことが大切", reverse: false },
  { id: "q7", axis: "NF", text: "将来を計画するのが好き", reverse: true },
  { id: "q8", axis: "SC", text: "安定した環境が安心", reverse: false },
  { id: "q9", axis: "SC", text: "変化にワクワクする", reverse: true },
  { id: "q10", axis: "SC", text: "予測可能な予定の方が落ち着く", reverse: false },
];

// PEANUTS名言（スヌーピーなど）
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

// タイプ定義（簡略）
const DESCRIPTIONS_4 = {
  "I-N": { name: "静けさを味わう人", summary: "内省×現在。小さな喜びを丁寧に。", img: "🍵" },
  "I-F": { name: "静かな設計者", summary: "内省×未来。静かな時間で構想を。", img: "🧩" },
  "E-N": { name: "祝祭のムードメーカー", summary: "外向×現在。今を楽しみ場を明るく。", img: "🎈" },
  "E-F": { name: "越境するフロントランナー", summary: "外向×未来。人とアイデアをつなぐ。", img: "🚩" },
};

function useLocal(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function QuestionCard({ q, value, onChange }) {
  const color = AXES.find((a) => a.key === q.axis)?.color || "bg-white";
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
    const delta = q.reverse ? -(v - 3) : v - 3;
    sums[q.axis] += delta;
  }
  const code = `${sums.IE >= 0 ? "I" : "E"}-${sums.NF >= 0 ? "N" : "F"}`;
  return { code, sums };
}

function ResultView({ answers, onReset, ageBand, gender, questions }) {
  const { code, sums } = useMemo(() => computeType(answers, questions), [answers, questions]);
  const desc = DESCRIPTIONS_4[code] || { name: "未知のタイプ", summary: "あなたの傾向を分析中です。", img: "🌈" };
  const quote = PEANUTS_QUOTES[Math.floor(Math.random() * PEANUTS_QUOTES.length)];

  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl">{desc.img}</div>
      <h2 className="text-2xl font-bold">{desc.name}</h2>
      <p className="opacity-70">{desc.summary}</p>
      <p className="text-sm opacity-70 mt-2">{ageBand} ｜ {gender}</p>

      <blockquote className="italic text-lg mt-4">“{quote.text}”</blockquote>
      <div className="text-sm opacity-70">— {quote.author}</div>

      <button onClick={onReset} className="mt-6 px-5 py-3 rounded-xl border">
        もう一度診断する
      </button>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useLocal("ybtiv1_step", "intro");
  const [answers, setAnswers] = useLocal("ybtiv1_answers", {});
  const [ageBand, setAgeBand] = useLocal("ybtiv1_ageBand", "");
  const [gender, setGender] = useLocal("ybtiv1_gender", "");

  const questions = QUESTION_POOL;
  const total = questions.length;
  const filled = Object.keys(answers).length;

  const start = () => {
    if (!ageBand || !gender) return alert("年代と性別を選択してください。");
    setStep("quiz");
  };
  const finish = () => {
    if (filled < total) return alert("すべての質問に回答してください。");
    setStep("result");
  };
  const resetAll = () => {
    setAnswers({});
    setStep("intro");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 text-gray-900">
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center">YBTI – ゆたかさ診断（デモ）</h1>

        {step === "intro" && (
          <div className="space-y-6">
            <div className="rounded-2xl p-6 bg-white shadow border">
              <h2 className="font-semibold mb-3">年代を選択</h2>
              <div className="flex flex-wrap gap-2">
                {AGE_BANDS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setAgeBand(b)}
                    className={`px-3 py-1 rounded-full border ${ageBand === b ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
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
                    className={`px-3 py-1 rounded-full border ${gender === g ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={start} className="px-5 py-3 rounded-xl w-full bg-black text-white">
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
                onChange={(v) => setAnswers({ ...answers, [q.id]: v })}
              />
            ))}
            <button
              onClick={finish}
              className={`px-5 py-3 rounded-xl w-full ${filled < total ? "bg-gray-300 text-gray-600" : "bg-black text-white"}`}
            >
              結果を見る
            </button>
          </div>
        )}

        {step === "result" && (
          <ResultView answers={answers} onReset={resetAll} ageBand={ageBand} gender={gender} questions={questions} />
        )}
      </div>
    </div>
  );
}
