// useWebSocket.ts — Рефакторинг живого коду #2
// В реальному проєкті тут new WebSocket(url). У preview-демо
// емулюємо потік повідомлень таймером, щоб демо працювало без бекенду.

import { useEffect, useState } from "react";

export function useWebSocket(_url: string) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setMessages((prev) => [...prev, `подія #${n}`].slice(-5));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return messages;
}
