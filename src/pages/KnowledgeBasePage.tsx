import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Search, BookOpen, Zap, Trophy, Target, Users, BarChart3, ShoppingBag, Calendar, Timer, Flame, Star, Shield, Map, Heart, Swords, Crown, Gift, Sparkles, Brain, MessageCircle, ThumbsUp, Lightbulb, Vote, Compass, Mic, Send, ScrollText, Bot, TrendingUp, ClipboardList, Coffee, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  steps: { title: string; content: string }[];
  forRole: 'all' | 'manager' | 'leader';
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'quick-actions', icon: <Zap className="w-5 h-5" />, title: 'Быстрые действия',
    description: 'Фиксация активности за 1-2 секунды',
    forRole: 'all',
    steps: [
      { title: 'Обработка клиента', content: 'Нажмите кнопку «+ Клиент» на Dashboard. Клиент будет зафиксирован мгновенно без ввода данных. Это увеличит счётчик обработанных клиентов и принесёт 25 XP.' },
      { title: 'Выставление счёта', content: 'Нажмите «+ Счёт», укажите сумму и подтвердите. Счёт появится в разделе «Счета» и принесёт 50 XP.' },
      { title: 'Отметка оплаты', content: 'Нажмите «Оплата», выберите неоплаченный счёт. Статус сменится на «Оплачен», вы получите 100 XP.' },
    ],
  },
  {
    id: 'xp-system', icon: <Star className="w-5 h-5" />, title: 'Система XP и уровней',
    description: 'Зарабатывайте опыт за каждое действие',
    forRole: 'all',
    steps: [
      { title: 'Начисление XP', content: 'Обработка клиента — 25 XP, выставление счёта — 50 XP, получение оплаты — 100 XP. Бонусы за выполнение плана, достижения и конкурсы.' },
      { title: 'Множители XP', content: 'Комбо (действия подряд) — до +100%. Momentum (серия активности) — x1.5 при максимуме. Фокус-сессия — +25%. Навыки — до +50% по категориям.' },
      { title: 'Повышение уровня', content: 'XP копится для повышения уровня. Каждый уровень требует больше XP (x1.3). При повышении вы получаете очко навыков.' },
    ],
  },
  {
    id: 'combo-momentum', icon: <Flame className="w-5 h-5" />, title: 'Комбо и Momentum',
    description: 'Множители за высокий темп работы',
    forRole: 'all',
    steps: [
      { title: 'Комбо', content: 'Выполняйте действия в течение 30 секунд друг за другом. Каждое следующее действие увеличивает множитель на +10%, максимум x2.0 при комбо x10+.' },
      { title: 'Sales Momentum', content: 'Шкала активности заполняется при каждом действии (+10). При 100% активируется режим x1.5 XP на 3 минуты. Шкала убывает со временем без активности.' },
    ],
  },
  {
    id: 'plan', icon: <Target className="w-5 h-5" />, title: 'Планы продаж',
    description: 'Многоуровневые цели: Минимум → Норма → Челлендж',
    forRole: 'all',
    steps: [
      { title: 'Настройка плана', content: 'В Настройках задайте план по сумме или количеству счетов. Многоуровневые цели настраиваются отдельно для счетов и оплат.' },
      { title: 'Три уровня', content: 'Минимум — обязательный план. Норма — хороший результат. Челлендж — максимальный уровень с бонусным XP.' },
      { title: 'Награды за план', content: 'Выполнение плана приносит достижение и 500 XP. Перевыполнение на 150% — редкое достижение и 1000 XP.' },
    ],
  },
  {
    id: 'achievements', icon: <Trophy className="w-5 h-5" />, title: 'Достижения и коллекции',
    description: '30+ достижений в 5 коллекциях',
    forRole: 'all',
    steps: [
      { title: 'Получение', content: 'Достижения разблокируются автоматически при выполнении условий: количество счетов, оплат, клиентов, серия дней, сумма выручки и т.д.' },
      { title: 'Коллекции', content: '5 коллекций: Счётовод, Кассир, Нетворкер, Миллионер, На огне. Собрав все достижения коллекции, вы получите бонусные 1000-5000 XP.' },
      { title: 'Почти достигнутые', content: 'Виджет «Почти достигнуто» показывает цели, до которых осталось немного. Мощный мотивационный триггер.' },
    ],
  },
  {
    id: 'skills', icon: <Zap className="w-5 h-5" />, title: 'Дерево навыков',
    description: 'Стратегическая прокачка профиля',
    forRole: 'all',
    steps: [
      { title: 'Очки навыков', content: 'При повышении уровня вы получаете 1 очко навыков. Распределяйте их между тремя направлениями.' },
      { title: 'Навыки', content: 'Закрытие (оплаты +5% XP/ур.), Обработка (клиенты +5% XP/ур.), Планирование (счета +5% XP/ур.). Максимум 10 уровней каждый.' },
    ],
  },
  {
    id: 'daily-tasks', icon: <Target className="w-5 h-5" />, title: 'Ежедневные задачи',
    description: 'Мини-цели на каждый день',
    forRole: 'all',
    steps: [
      { title: 'Генерация', content: 'Каждый день система создаёт 3 задачи: обработать 5 клиентов (50 XP), выставить 3 счёта (75 XP), получить 2 оплаты (100 XP).' },
      { title: 'Выполнение', content: 'Прогресс задач обновляется автоматически при быстрых действиях. Выполнение задачи приносит дополнительный XP.' },
    ],
  },
  {
    id: 'focus', icon: <Timer className="w-5 h-5" />, title: 'Фокус-сессия',
    description: 'Режим концентрации с бонусом XP',
    forRole: 'all',
    steps: [
      { title: 'Запуск', content: 'Активируйте виджет «Фокус-сессия» на Dashboard. Выберите длительность и запустите таймер.' },
      { title: 'Бонусы', content: 'Во время сессии все действия получают +25% XP. По завершении вы получите бонус за количество выполненных действий.' },
    ],
  },
  {
    id: 'shop', icon: <ShoppingBag className="w-5 h-5" />, title: 'Магазин бустов',
    description: 'Тратьте XP на приятные бонусы',
    forRole: 'all',
    steps: [
      { title: 'Ассортимент', content: 'Кофе-брейк (100 XP), Музыка на час (50 XP), Поздний старт (200 XP), Ранний уход (300 XP), XP Буст x2 (250 XP) и другие.' },
      { title: 'Покупка', content: 'Перейдите в «Магазин», выберите буст и нажмите «Купить». XP будут списаны из баланса.' },
    ],
  },
  {
    id: 'calendar', icon: <Calendar className="w-5 h-5" />, title: 'Календарь и напоминания',
    description: 'Планирование звонков с учётом часовых поясов',
    forRole: 'all',
    steps: [
      { title: 'Добавление напоминания', content: 'Укажите клиента, время в его часовом поясе, причину звонка и сумму. Система автоматически пересчитает в ваше местное время.' },
      { title: 'Уведомления', content: 'Система показывает количество клиентов на перезвон и визуально отображает загруженность календаря.' },
    ],
  },
  {
    id: 'leaderboard', icon: <BarChart3 className="w-5 h-5" />, title: 'Лидерборд и сезоны',
    description: 'Соревнование между менеджерами',
    forRole: 'all',
    steps: [
      { title: 'Рейтинг', content: 'Менеджеры ранжируются по XP, выручке, количеству счетов и оплат. Лидерборд обновляется в реальном времени.' },
      { title: 'Сезоны', content: 'Каждый месяц — новый сезон. Рейтинг обнуляется, лучшие получают награды. Новые менеджеры получают равные шансы.' },
    ],
  },
  {
    id: 'records', icon: <Trophy className="w-5 h-5" />, title: 'Личные рекорды',
    description: 'Побивайте свои же рекорды',
    forRole: 'all',
    steps: [
      { title: 'Отслеживание', content: 'Система фиксирует максимумы за день: счетов, оплат, клиентов, выручки. При побитии рекорда вы получаете уведомление.' },
    ],
  },
  {
    id: 'heatmap', icon: <Flame className="w-5 h-5" />, title: 'Карта активности',
    description: 'Визуализация рабочей активности как в GitHub',
    forRole: 'all',
    steps: [
      { title: 'Что показывает', content: 'Каждый день окрашен по уровню активности. Зелёные клетки — активные дни, серые — без активности. Помогает видеть паттерны работы.' },
    ],
  },
  // Leader-only sections
  {
    id: 'admin-managers', icon: <Users className="w-5 h-5" />, title: 'Управление менеджерами',
    description: 'Добавление, блокировка, просмотр команды',
    forRole: 'leader',
    steps: [
      { title: 'Приглашение', content: 'В разделе «Настройки» → «Приглашения» создайте инвайт-ссылку. Ссылка действует 7 дней. Менеджер регистрируется по ней и автоматически получает роль «менеджер».' },
      { title: 'Блокировка', content: 'В админ-панели → «Менеджеры» можно заблокировать/разблокировать пользователя. Заблокированный менеджер не может войти в систему.' },
      { title: 'Просмотр статистики', content: 'Карточка каждого менеджера показывает уровень, XP, выручку, количество счетов и индекс дисциплины.' },
    ],
  },
  {
    id: 'admin-analytics', icon: <BarChart3 className="w-5 h-5" />, title: 'Аналитика для руководителя',
    description: 'Метрики команды, прогнозы, lost revenue',
    forRole: 'leader',
    steps: [
      { title: 'Индекс дисциплины', content: 'Показатель стабильности работы менеджера (0-100). Основан на регулярности действий, выполнении задач и планов. 80-100 — отличная дисциплина.' },
      { title: 'Конверсия', content: 'Процент счетов, которые были оплачены. Показывает эффективность каждого менеджера в закрытии сделок.' },
      { title: 'Lost Revenue Detector', content: 'Анализирует неоплаченные счета: сумма потенциально потерянной выручки и время с момента выставления.' },
      { title: 'Прогноз выполнения плана', content: 'На основе текущего темпа работы система прогнозирует процент выполнения плана к концу месяца.' },
    ],
  },
  {
    id: 'admin-contests', icon: <Trophy className="w-5 h-5" />, title: 'Конкурсы и соревнования',
    description: 'Создание индивидуальных и командных конкурсов',
    forRole: 'leader',
    steps: [
      { title: 'Создание конкурса', content: 'Укажите название, метрику (выручка/счета/клиенты), цель, приз и сроки. Конкурс может быть индивидуальным или командным.' },
      { title: 'Командные соревнования', content: 'Распределите менеджеров по командам. Команды соревнуются по суммарным показателям.' },
      { title: 'Бонусные активности', content: 'Создавайте ежедневные, еженедельные или ежемесячные активности с настраиваемыми призами и наградами XP.' },
    ],
  },
  {
    id: 'admin-gamification', icon: <Shield className="w-5 h-5" />, title: 'Управление геймификацией',
    description: 'Настройка достижений и бустов',
    forRole: 'leader',
    steps: [
      { title: 'Кастомные достижения', content: 'Создавайте собственные достижения с условиями разблокировки и наградами XP. Они появятся у всех менеджеров.' },
      { title: 'Кастомные бусты', content: 'Добавляйте новые товары в магазин бустов. Укажите название, описание, стоимость в XP и эффект.' },
    ],
  },
];

function GuideItem({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="widget-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{section.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground">{section.title}</h3>
          <p className="text-xs text-muted-foreground">{section.description}</p>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 pl-12">
              {section.steps.map((step, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-primary/30 border-2 border-background" />
                  <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { role } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = GUIDE_SECTIONS.filter(s => {
    if (s.forRole === 'leader' && role !== 'leader') return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      || s.steps.some(st => st.title.toLowerCase().includes(q) || st.content.toLowerCase().includes(q));
  });

  const managerSections = filtered.filter(s => s.forRole === 'all');
  const leaderSections = filtered.filter(s => s.forRole === 'leader');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">База знаний</h1>
          <p className="text-sm text-muted-foreground">Интерактивный гайд по всем функциям системы</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по функциям..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {managerSections.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-foreground text-lg mt-4">📚 Основные функции</h2>
            {managerSections.map(s => <GuideItem key={s.id} section={s} />)}
          </>
        )}
        {leaderSections.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-foreground text-lg mt-6">🛡️ Функции руководителя</h2>
            {leaderSections.map(s => <GuideItem key={s.id} section={s} />)}
          </>
        )}
        {filtered.length === 0 && (
          <div className="widget-card text-center py-8 text-muted-foreground">
            Ничего не найдено по запросу «{search}»
          </div>
        )}
      </div>
    </div>
  );
}
