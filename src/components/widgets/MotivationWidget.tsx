import { useState, useEffect } from 'react';

const phrases = [
  'Каждый звонок — шаг к сделке. 📞',
  'Сегодня ты можешь побить свой рекорд. 🏆',
  'Сильные продавцы делают больше попыток. 💪',
  'Сделка начинается с первого контакта. 🤝',
  'Не бойся отказа — бойся бездействия. 🚀',
  'Твой следующий клиент уже ждёт звонка. ☎️',
  'Успех — это сумма маленьких усилий. ⭐',
  'Действуй сейчас, результат придёт. ⚡',
  'Каждый «нет» приближает тебя к «да». ✅',
  'Ты ближе к цели, чем думаешь. 🎯',
];

export default function MotivationWidget() {
  const [phrase, setPhrase] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * phrases.length));
  }, []);

  useEffect(() => {
    setPhrase(phrases[idx]);
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % phrases.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [idx]);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">💡 Мотивация</h3>
      <p className="text-lg font-medium text-foreground leading-relaxed italic">
        «{phrase}»
      </p>
    </div>
  );
}
