import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Pencil, Edit3 } from "lucide-react";

const STORAGE_KEY = "random-question-app:v1";

function saveToStorage(questions) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ questions })); } catch (_) {}
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.questions)) return parsed.questions;
  } catch (_) {}
  return [];
}
function parseInputToQuestions(text) {
  return text.split(/\r?\n|,/).map(s=>s.trim()).filter(s=>s.length>0);
}
function shuffle(arr) {
  const a=[...arr]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;
}

export default function App() {
  const [mode, setMode] = useState("input");
  const [questions, setQuestions] = useState(loadFromStorage());
  const [text, setText] = useState(questions.join("\n"));
  const [stack, setStack] = useState([]);
  const [current, setCurrent] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef(null);

  useEffect(()=>{ saveToStorage(questions); },[questions]);
  const startGame = () => { const pool=shuffle(questions); setStack(pool); setCurrent(null); setFlipped(false); setMode("draw"); };
  const backToInput = () => { setMode("input"); setFlipped(false); setCurrent(null); };
  const pickOne = () => {
    let pool=[...stack]; if(pool.length===0){ pool=shuffle(questions); }
    if(pool.length===0) return;
    const next=pool[0]; setStack(pool.slice(1));
    setFlipped(true); setTimeout(()=>setCurrent(next),150);
  };
  const redrawViaCardTap = () => { setFlipped(false); setTimeout(()=>{ pickOne(); },180); };

  const Header = () => (
    <div className="w-full flex items-center justify-between gap-2">
      <div className="text-xl font-semibold tracking-tight">랜덤 질문 카드</div>
      {mode === "draw" && (
        <button onClick={backToInput}
          className="inline-flex items-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium bg-white/70 backdrop-blur shadow hover:shadow-md border border-zinc-200 active:scale-[0.98]">
          <Edit3 className="w-4 h-4" /> 질문 입력
        </button>
      )}
    </div>
  );

  const EmptyHint = () => (
    <div className="text-center text-zinc-500 text-sm">
      한 줄에 하나씩 질문을 입력하세요. 예)
      <div className="mt-2 inline-flex flex-col items-center gap-1 text-left bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-600">
        <span>오늘 가장 재미있었던 일은?</span>
        <span>지금 가장 먹고 싶은 음식은?</span>
        <span>최근 본 영화 중 추천은?</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-zinc-50 to-zinc-100 text-zinc-900">
      <div className="mx-auto max-w-md px-4 pt-5 pb-24">
        <Header />
        {mode === "input" && (
          <section className="mt-6 space-y-4">
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-4">
              <div className="text-sm text-zinc-600 mb-2">
                질문을 여러 개 입력하고 <span className="font-medium text-zinc-900">시작</span> 버튼을 누르세요. (한 줄당 하나)
              </div>
              <textarea
                value={text}
                onChange={(e)=>setText(e.target.value)}
                placeholder={"오늘 가장 재미있었던 일은?\n지금 가장 먹고 싶은 음식은?\n최근 본 영화 중 추천은?"}
                className="w-full h-56 resize-y rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-300 p-3 text-base leading-6"
              />
              <div className="mt-3">
                <button
                  onClick={()=>{
                    const parsed = parseInputToQuestions(text);
                    if(parsed.length===0){ alert("질문을 하나 이상 입력해주세요."); return; }
                    setQuestions(parsed); startGame();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold bg-black text-white shadow active:scale-[0.98]">
                  <Shuffle className="w-5 h-5" /> 시작하기
                </button>
              </div>
            </div>
            {questions.length===0 ? <EmptyHint/> : (
              <div className="text-xs text-zinc-500 text-center">최근 저장된 질문 {questions.length}개가 있습니다. (자동 저장)</div>
            )}
          </section>
        )}

        {mode === "draw" && (
          <section className="mt-8 flex flex-col items-center">
            <div className="relative w-full max-w-[22rem] aspect-[3/4]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[86%] h-[88%] bg-white/70 border border-zinc-200 rounded-3xl shadow-md rotate-[-4deg] translate-x-[-6px]" />
                <div className="absolute w-[86%] h-[88%] bg-white/80 border border-zinc-200 rounded-3xl shadow-md rotate-[6deg] translate-x-[8px] translate-y-[6px]" />
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={flipped ? "front" : "back"}
                  ref={cardRef}
                  initial={{ rotateY: 180, opacity: 0, y: 6 }}
                  animate={{ rotateY: 0, opacity: 1, y: 0 }}
                  exit={{ rotateY: -180, opacity: 0, y: -4 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18, duration: 0.45 }}
                  className="absolute inset-0 m-auto w-[88%] h-[90%] [transform-style:preserve-3d]"
                >
                  <button
                    onClick={()=>{ if(!flipped){ pickOne(); } else { redrawViaCardTap(); } }}
                    className="group relative w-full h-full rounded-3xl bg-white border border-zinc-200 shadow-xl focus:outline-none active:scale-[0.998]"
                    aria-label={flipped ? "질문 다시 뽑기" : "카드 선택"}
                    title={flipped ? "다시 뽑으려면 탭하세요" : "탭하여 질문 확인"}
                  >
                    {!flipped ? (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-5xl">🎴</div>
                          <div className="text-zinc-700 font-semibold tracking-tight">카드를 선택하세요</div>
                          <div className="text-xs text-zinc-500">탭하여 질문 확인</div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 p-5">
                        <div className="h-full w-full rounded-2xl bg-gradient-to-b from-zinc-50 to-white border border-zinc-100 grid place-items-center px-4">
                          <p className="text-center text-lg leading-7 font-semibold text-zinc-900 whitespace-pre-wrap">
                            {current}
                          </p>
                        </div>
                      </div>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 w-full flex flex-col gap-3">
              <button
                onClick={backToInput}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold bg-white border border-zinc-200 shadow-sm active:scale-[0.98]">
                <Pencil className="w-5 h-5" /> 질문 입력
              </button>
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              남은 질문: {Math.max(stack.length + (current ? 1 : 0), 0)} / {questions.length}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
