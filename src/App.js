import React, { useMemo, useState, useEffect } from "react";

/**
 * YBTI (Your Blooming Type Indicator) – Demo Web App
 * 16タイプ診断のみ版
 * ・年代・性別選択
 * ・20問のゆたかさ診断（4軸×5問）
 * ・16タイプ結果表示（PNGアイコン）
 * ・任意参加のエンゲージメントチェック（12問）
 */

// 4軸（色は質問カード背景に適用）
const AXES = [
  { key: "IE", left: "I（内的充足）", right: "E（外的体験）", color: "bg-pink-100" },
  { key: "RS", left: "R（関係重視）", right: "S（自立重視）", color: "bg-blue-100" },
  { key: "NF", left: "N（今を味わう）", right: "F（未来を描く）", color: "bg-green-100" },
  { key: "SC", left: "S（安定志向）", right: "C（変化志向）", color: "bg-yellow-100" },
];

// 年代選択肢（10代〜90代）
const AGE_BANDS = ["10代","20代","30代","40代","50代","60代","70代","80代","90代"];

// 設問プール（各軸5問＝20問）
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

// 16タイプ（名称/要約/PNGアイコンパス）
const DESCRIPTIONS_16 = {
  "I-R-N-S": {
    name: "日常を慈しむ 穏やかな守り手",
    summary: "日常のささやかな幸せと、身近な人の安心を丁寧に守り育てる。地域の安心・安全という真のゆたかさを静かに育てていくタイプ。",
    img: "/type-icons/I-R-N-S.png",
  },
  "I-R-N-C": {
    name: "心おどる発見の収集家",
    summary: "身近な仲間と新しい趣味や変化を楽しみ、日常に彩りを加えることに喜びを感じ、一人ひとりの声に耳を澄ませながら、小さな工夫で暮らしを良くする「一歩先の発想」を重ねていく共創タイプ。",
    img: "/type-icons/I-R-N-C.png",
  },
  "I-R-F-S": {
    name: "家族の明日を想う誠実な計画家",
    summary: "家族や仲間の将来の安泰を願い、堅実な計画と備えで「揺るがない安心」をつくる。人と人とのつながりを大切にしつつ、将来の安心な暮らしを設計し、ゆたかな未来への道筋を描くタイプ。",
    img: "/type-icons/I-R-F-S.png",
  },
  "I-R-F-C": {
    name: "静かな変革の共創者",
    summary: "「私たちの未来はもっとこうなれる」と、仲間と共に新しい可能性や理想のライフスタイルを夢見るタイプ。未来志向で変化を恐れず、一歩先の選択肢を静かに提示しながら、人々の最良の選択を後押しするタイプ。",
    img: "/type-icons/I-R-F-C.png",
  },
  "I-S-N-S": {
    name: "ひとりの時間を愛する静かなる探求者",
    summary: "静かな環境で、自分の好きなことに没頭し、変わらない平穏な時間を何より愛する。自分のペースを守りつつ足元を整え、堅実な行動で地域の経済的・物質的なゆたかさを支えるタイプ。",
    img: "/type-icons/I-S-N-S.png",
  },
  "I-S-N-C": {
    name: "自分色に染める自由なクリエイター",
    summary: "ひとりの世界で新しい試みや創作に没頭し、自己変革やユニークな体験を楽しむ。静かな探究心で新しい知恵や仕組みを試し、デジタルなどの変化を地域のゆたかさにつなげていくタイプ。",
    img: "/type-icons/I-S-N-C.png",
  },
  "I-S-F-S": {
    name: "わが道を整える堅実な準備家",
    summary: "将来の資産や生活基盤をひとりで着々と築き上げ、盤石な未来を設計することに充実感を覚えるタイプ。長期的な視点でコツコツと準備し、人生100年時代の安心な暮らしを設計する、未来志向の職人タイプ。",
    img: "/type-icons/I-S-F-S.png",
  },
  "I-S-F-C": {
    name: "未踏の地を行く開拓者",
    summary: "誰もやったことのない新しい未来の形を、独自の視点と強い意志で切り拓こうとする。自分の足で未知の道を切りひらき、新しい働き方や生き方を模索しながら、次世代のゆたかさを形にするタイプ。",
    img: "/type-icons/I-S-F-C.png",
  },
  "E-R-N-S": {
    name: "みんなの和を保つ優しいサポーター",
    summary: "いつものメンバーで集まる安心感を愛し、地域のコミュニティや職場の和を明るく保つムードメーカー。身近な対話の場をつくり、人が集うコミュニティを温めながら、精神的なゆたかさを地域に広げるタイプ。",
    img: "/type-icons/E-R-N-S.png",
  },
  "E-R-N-C": {
    name: "新しい風を運ぶムードメーカー",
    summary: "新しいイベントや流行を仲間と体験し、「今この瞬間」の熱狂を共有することに生きがいを感じるタイプ。イベントや出会いを通じて新しいつながりを生み、「地域のゆたかさ」を一歩先へ更新していくタイプ。",
    img: "/type-icons/E-R-N-C.png",
  },
  "E-R-F-S": {
    name: "未来へ導くやさしい伴走者",
    summary: "組織やチームのリーダーとして、みんなを安全な未来へと導く責任感と包容力を持つタイプ。人と情報をつなぎ、将来のリスクとチャンスを見据えながら、安心して選べる未来への航路を示すタイプ。",
    img: "/type-icons/E-R-F-S.png",
  },
  "E-R-F-C": {
    name: "仲間と社会を変える熱きビジョナリー",
    summary: "「社会を良くしたい」というビジョンを掲げ、周りを巻き込みながら変革を起こしていくカリスマタイプ。多様な仲間と協働し、新しいビジネスや仕組みで地域課題を解決する、共創型の変革ドライバータイプ。",
    img: "/type-icons/E-R-F-C.png",
  },
  "E-S-N-S": {
    name: "確かな成果を出す実直なプロフェッショナル",
    summary: "日々の仕事やタスクを確実にこなし、自分の役割を全うすることで、揺るぎない実績を積み上げるタイプ。毎日の仕事や生活のなかで小さな改善を重ね、周りの人の「いま」を便利で快適にしていく実務タイプ。",
    img: "/type-icons/E-S-N-S.png",
  },
  "E-S-N-C": {
    name: "未知の世界を楽しむ行動派の冒険家",
    summary: "束縛を嫌い、新しい場所や刺激的な体験を求めて、フットワーク軽く飛び回ることに喜びを感じるタイプ。現場から新しい挑戦に踏み出し、デジタルやデータ活用で、地域ビジネスの生産性とゆたかさを高めるタイプ。",
    img: "/type-icons/E-S-N-C.png",
  },
  "E-S-F-S": {
    name: "着実にキャリアを築く努力家の戦略家",
    summary: "キャリアアップや社会的地位の確立を目指し、確実なルートで成功への階段を上っていくタイプ。長期の資産形成やキャリアを見通し、着実な計画で「そなえ」と「つかう」のバランスをデザインするタイプ。",
    img: "/type-icons/E-S-F-S.png",
  },
  "E-S-F-C": {
    name: "大きな壁に挑む不屈のチャレンジャー",
    summary: "リスクを恐れず、新規事業や大きなチャレンジに打って出て、自分の力で現状を打破する野心家タイプ。業種や地域の境界を越えて連携し、新しいサービスや価値を生み出して、地域の真のゆたかさを切り拓くタイプ。",
    img: "/type-icons/E-S-F-C.png",
  },
};

// ランダム名言（PEANUTS）
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

// ローカルストレージフック
function useLocal(key, initial) {
  const [state, set] = useState(() => {
    if (typeof window === "undefined") return initial;
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, set];
}

// 16タイプ用質問リスト生成（常に各軸5問＝20問）
function buildQuestions16() {
  const take = 5;
  const byAxis = { IE: [], RS: [], NF: [], SC: [] };
  for (const q of QUESTION_POOL) {
    const arr = byAxis[q.axis];
    if (arr.length < take) arr.push(q);
  }
  return AXES.flatMap((ax) => byAxis[ax.key]);
}

// 質問カード
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

// タイプ計算
function computeType(answers, questions) {
  const sums = { IE: 0, RS: 0, NF: 0, SC: 0 };
  for (const q of questions) {
    const v = answers[q.id];
    if (!v) continue;
    const delta = q.reverse ? -(v - 3) : v - 3; // 中央(3)
    sums[q.axis] += delta;
  }
  const code16 = AXES.map((ax) => (sums[ax.key] >= 0 ? ax.left[0] : ax.right[0])).join("-");
  return { sums, code16 };
}

// 軸バー（16タイプ用固定）
function AxisBar({ value }) {
  const range = 10; // ±10 目安
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

/* =========================
   エンゲージメント関連
   ========================= */

const ENGAGEMENT_ITEMS = [
  // Meaning / 理念一致
  { id: "e1", text: "会社や組織の理念が「何のためか」を理解している。", category: "meaning" },
  { id: "e2", text: "その理念は自分の大事にしたい価値観と重なる部分がある。", category: "meaning" },
  // Autonomy / 自律性
  { id: "e3", text: "自分の考えや工夫を仕事に反映できている。", category: "autonomy" },
  { id: "e4", text: "新しい挑戦や提案をしても良い雰囲気がある。", category: "autonomy" },
  // Competence / 成長感
  { id: "e5", text: "最近の仕事や活動の中で、自分の成長を実感できている。", category: "competence" },
  { id: "e6", text: "自分の頑張りや成果は、周りからちゃんと認識されている。", category: "competence" },
  // Relationship / 関係性
  { id: "e7", text: "困ったときに相談できる相手が職場やコミュニティにいる。", category: "relationship" },
  { id: "e8", text: "一緒に働く人たちと、信頼関係が築けていると感じる。", category: "relationship" },
  // Psychological Safety / 心理的安全性
  { id: "e9", text: "失敗や意見の違いを伝えても、不当に評価が下がる心配は少ない。", category: "safety" },
  { id: "e10", text: "改善提案や疑問を率直に伝えやすい雰囲気がある。", category: "safety" },
  // Future Willingness / 未来意欲
  { id: "e11", text: "この組織や活動と、これからも一緒に未来をつくっていきたい。", category: "future" },
  { id: "e12", text: "ここでの経験は、将来の自分のゆたかさにつながると感じる。", category: "future" },
];

function computeEngagementScore(answers) {
  const ids = ENGAGEMENT_ITEMS.map((q) => q.id);
  let total = 0;
  for (const id of ids) {
    const v = answers[id];
    if (v != null) total += v;
  }
  const max = ids.length * 5;
  const score = total;
  let label = "";
  let message = "";
  if (score >= 50) {
    label = "とても高いエンゲージメント";
    message = "理念と日々の行動がよく結びつき、未来に向けた前向きな力が強い状態です。";
  } else if (score >= 40) {
    label = "良好なエンゲージメント";
    message = "概ね良い状態です。強みを活かしつつ、気になる項目を1つだけ改善するとさらに安定します。";
  } else if (score >= 30) {
    label = "改善の余地あり";
    message = "一部の項目でストレスや違和感がたまっている可能性があります。気になる設問を振り返ってみましょう。";
  } else {
    label = "要ケアの状態かもしれません";
    message = "無理をしすぎていないか、環境や役割の見直し・対話の場が必要かもしれません。";
  }
  return { score, max, label, message };
}

/* =========================
   結果表示コンポーネント
   ========================= */

function ResultView({
  answers,
  onReset,
  ageBand,
  questions,
  gender,
  onStartEngagement,
  engagementScore,
}) {
  const { sums, code16 } = useMemo(
    () => computeType(answers, questions),
    [answers, questions]
  );
  const total = questions.length;
  const filled = Object.keys(answers).length;

  const desc16 = DESCRIPTIONS_16[code16] || { name: code16, summary: "あなたの傾向の要約です。", img: "" };
  const title = desc16.name;
  const summary = desc16.summary;
  const imgSrc = desc16.img;

  const quote = PEANUTS_QUOTES[Math.floor(Math.random() * PEANUTS_QUOTES.length)];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={title}
              className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-full bg-white shadow"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white shadow" />
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">
          {title}（16タイプ）
        </h2>
        <p className="text-sm opacity-70">
          回答 {filled}/{total}
          {ageBand ? ` ｜ 年代: ${ageBand}` : ""}
          {gender ? ` ｜ 性別: ${gender}` : ""}
        </p>
        <p className="opacity-80 mt-2">{summary}</p>
      </div>

      {/* 名言カード */}
      <div className="rounded-2xl p-5 bg-white shadow border text-center">
        <blockquote className="italic text-lg">“{quote.text}”</blockquote>
        <div className="mt-2 text-sm opacity-70">— {quote.author}</div>
      </div>

      {/* 軸バー（4軸すべて表示） */}
      <div className="grid md:grid-cols-2 gap-4">
        {AXES.map((ax) => (
          <div
            key={ax.key}
            className={`rounded-2xl p-5 shadow border ${ax.color}`}
          >
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

      {/* 他タイプの簡易カード一覧 */}
      <div className="rounded-2xl p-5 bg-white/70 border">
        <h3 className="font-semibold mb-3">他のタイプを見る</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(DESCRIPTIONS_16).map(([k, v]) => (
            <div
              key={k}
              className="rounded-2xl p-3 bg-white border shadow-sm flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden flex items-center justify-center">
                <img
                  src={v.img}
                  alt={v.name}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{v.name}</h4>
                <p className="text-xs opacity-70">{v.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* エンゲージメント関連 */}
      <div className="rounded-2xl p-5 bg-white border shadow-sm space-y-3">
        <h3 className="font-semibold">今のエンゲージメントも見てみる</h3>
        <p className="text-sm opacity-80">
          仕事や活動への「前向きさ」「つながり感」「未来への意欲」を、12問で簡単にチェックできます（1分程度）。
        </p>
        {engagementScore != null && (
          <p className="text-sm">
            前回のエンゲージメントスコア：
            <span className="font-semibold">{engagementScore}</span> / 60
          </p>
        )}
        {onStartEngagement && (
          <button
            onClick={onStartEngagement}
            className="px-4 py-2 rounded-xl border bg-black text-white text-sm md:text-base"
          >
            今のエンゲージメントをチェックする
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onReset} className="px-5 py-3 rounded-xl border">
          もう一度診断する
        </button>
      </div>
    </div>
  );
}

/* =========================
   エンゲージメント質問UI
   ========================= */

function EngagementQuestionCard({ q, value, onChange }) {
  return (
    <div className="rounded-2xl p-4 md:p-5 shadow border bg-white">
      <p className="text-base md:text-lg mb-3">{q.text}</p>
      <div className="flex items-center justify-between text-xs md:text-sm">
        <span className="opacity-70">まったくそう思わない</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full border ${
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

function EngagementSurvey({ answers, onChange, onFinish, onBack }) {
  const total = ENGAGEMENT_ITEMS.length;
  const filled = ENGAGEMENT_ITEMS.filter((q) => answers[q.id] != null).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 bg-white shadow border">
        <h2 className="text-xl md:text-2xl font-bold mb-2">エンゲージメントチェック</h2>
        <p className="text-sm opacity-80">
          今の仕事や活動との「つながり感」「やりがい」「未来への意欲」を確認してみましょう。
          全{total}問（約1分）です。
        </p>
        <p className="text-xs mt-1 opacity-60">回答状況：{filled}/{total}</p>
      </div>

      {ENGAGEMENT_ITEMS.map((q) => (
        <EngagementQuestionCard
          key={q.id}
          q={q}
          value={answers[q.id]}
          onChange={(v) => onChange(q.id, v)}
        />
      ))}

      <div className="flex flex-col gap-3">
        <button
          onClick={onFinish}
          className={`px-5 py-3 rounded-xl w-full ${
            filled < total ? "bg-gray-300 text-gray-600" : "bg-black text-white"
          }`}
        >
          エンゲージメント結果を見る
        </button>
        <button onClick={onBack} className="px-5 py-3 rounded-xl w-full border bg-white">
          診断結果画面に戻る
        </button>
      </div>
    </div>
  );
}

function EngagementResultView({
  ybtiTitle,
  ageBand,
  gender,
  questions,
  answers,
  engagementAnswers,
  onBackToResult,
}) {
  const { score, max, label, message } = useMemo(
    () => computeEngagementScore(engagementAnswers),
    [engagementAnswers]
  );
  const { sums } = useMemo(() => computeType(answers, questions), [answers, questions]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 bg-white shadow border text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">エンゲージメント結果</h2>
        <p className="text-sm opacity-70">
          {ageBand ? `年代: ${ageBand} ｜ ` : ""}
          {gender ? `性別: ${gender} ｜ ` : ""}
          YBTIタイプ: {ybtiTitle}（16タイプ）
        </p>
        <div className="mt-4 text-5xl font-bold">{score}</div>
        <p className="text-sm opacity-70 mb-2">/ {max}</p>
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-sm opacity-80 max-w-xl mx-auto">{message}</p>
      </div>

      <div className="rounded-2xl p-5 bg-white shadow border">
        <h3 className="font-semibold mb-3 text-center">YBTIの傾向 × エンゲージメント</h3>
        <p className="text-xs opacity-70 mb-3 text-center">
          「あなたはどんな未来観を持ちやすいか」と「今どれくらい前向きに関われているか」のセットで、ゆたかさの現在地を見てみましょう。
        </p>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {AXES.map((ax) => (
            <div key={ax.key} className="rounded-2xl p-3 border bg-gray-50">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">
                  {ax.left} ↔ {ax.right}
                </span>
                <span className="text-xs opacity-60">{ax.key}</span>
              </div>
              <AxisBar value={sums[ax.key] || 0} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onBackToResult}
          className="px-5 py-3 rounded-xl w-full border bg-white"
        >
          YBTIの結果画面に戻る
        </button>
      </div>
    </div>
  );
}

/* =========================
   メイン App コンポーネント
   ========================= */

export default function App() {
  const [step, setStep] = useLocal("ybtiv1_step", "intro");
  const [answers, setAnswers] = useLocal("ybtiv1_answers", {});
  const [ageBand, setAgeBand] = useLocal("ybtiv1_ageBand", "");
  const [gender, setGender] = useLocal("ybtiv1_gender", "");
  const [engagementAnswers, setEngagementAnswers] = useLocal(
    "ybtiv1_engagementAnswers",
    {}
  );
  const [engagementScore, setEngagementScore] = useLocal(
    "ybtiv1_engagementScore",
    null
  );

  const questions = useMemo(() => buildQuestions16(), []);
  const total = questions.length; // 20問
  const filled = questions.filter((q) => answers[q.id] != null).length;

  const setAnswer = (id, v) => setAnswers({ ...answers, [id]: v });
  const setEngagementAnswer = (id, v) =>
    setEngagementAnswers({ ...engagementAnswers, [id]: v });

  const start = () => {
    if (!ageBand) return alert("年代を選択してください。");
    if (!gender) return alert("性別を選択してください。");
    setStep("quiz");
  };
  const finish = () => {
    if (filled < total) return alert("未回答があります。");
    setStep("result");
  };
  const resetAll = () => {
    setAnswers({});
    setEngagementAnswers({});
    setEngagementScore(null);
    setStep("intro");
  };

  const { code16 } = useMemo(
    () => computeType(answers, questions),
    [answers, questions]
  );
  const desc16 = DESCRIPTIONS_16[code16];
  const ybtiTitle = desc16?.name || code16;

  const handleFinishEngagement = () => {
    const filledE = ENGAGEMENT_ITEMS.filter((q) => engagementAnswers[q.id] != null).length;
    if (filledE < ENGAGEMENT_ITEMS.length) {
      alert("未回答の設問があります。");
      return;
    }
    const { score } = computeEngagementScore(engagementAnswers);
    setEngagementScore(score);
    setStep("engagementResult");
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-300 to-white text-gray-900">
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          YBTI – ゆたかさ診断
        </h1>

{/* 🔥 トップページ（intro）だけ説明文表示 */}
{step === "intro" && (
  <div className="text-center text-gray-700 space-y-2 max-w-xl mx-auto">
    <p className="text-lg md:text-xl font-semibold">
      あなたが“ゆたかさ”を感じるタイプを診断します。
    </p>
    <p className="text-sm md:text-base opacity-80 leading-relaxed">
      何を大切にすると、自分らしい”ゆたかさ”が育つのか。<br />
      質問に答えるだけで、あなたの価値観が診断できます。
    </p>
    <p className="text-xs opacity-60">― 所要時間：約3分 ―</p>
  </div>
)}

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
              診断をはじめる（全20問）
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
            onStartEngagement={() => setStep("engagement")}
            engagementScore={engagementScore}
          />
        )}

        {step === "engagement" && (
          <EngagementSurvey
            answers={engagementAnswers}
            onChange={setEngagementAnswer}
            onFinish={handleFinishEngagement}
            onBack={() => setStep("result")}
          />
        )}

        {step === "engagementResult" && (
          <EngagementResultView
            ybtiTitle={ybtiTitle}
            ageBand={ageBand}
            gender={gender}
            questions={questions}
            answers={answers}
            engagementAnswers={engagementAnswers}
            onBackToResult={() => setStep("result")}
          />
        )}
      </div>
    </div>
  );
}