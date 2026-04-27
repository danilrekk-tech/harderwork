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
  // ====== Геймификация+ ======
  {
    id: 'quests', icon: <Map className="w-5 h-5" />, title: 'Квесты',
    description: 'Долгосрочные миссии с большими наградами',
    forRole: 'all',
    steps: [
      { title: 'Что это', content: 'Квесты — это многоэтапные цели, которые длятся от нескольких дней до недели. Каждый квест имеет метрику (выручка, счета, клиенты), целевое значение и щедрую XP-награду.' },
      { title: 'Как пройти', content: 'Откройте раздел «Квесты». Прогресс обновляется автоматически по мере выполнения действий. По завершении вы получите награду и уведомление.' },
      { title: 'Создание (Leader)', content: 'Руководитель может создавать собственные квесты в админ-панели: название, иконка, метрика, цель, длительность и награда XP.' },
    ],
  },
  {
    id: 'pet', icon: <Heart className="w-5 h-5" />, title: 'Виртуальный питомец',
    description: 'Заботьтесь о питомце — он растёт вместе с вами',
    forRole: 'manager',
    steps: [
      { title: 'Знакомство', content: 'У каждого менеджера есть питомец (по умолчанию — лис). У него есть уровень, опыт, шкалы голода и счастья.' },
      { title: 'Кормление', content: 'Кормите питомца, чтобы шкала голода не падала. Можно использовать XP для покупки еды.' },
      { title: 'Эволюция', content: 'По мере роста уровня питомец проходит несколько стадий эволюции, меняя внешний вид и характеристики.' },
    ],
  },
  {
    id: 'duels', icon: <Swords className="w-5 h-5" />, title: 'Дуэли 1-на-1',
    description: 'Бросьте вызов коллеге и сразитесь за XP',
    forRole: 'manager',
    steps: [
      { title: 'Вызов', content: 'Выберите соперника, метрику соревнования (выручка, счета, оплаты), цель и ставку XP. Соперник принимает или отклоняет.' },
      { title: 'Длительность', content: 'Стандартная дуэль идёт 24 часа. Прогресс обоих участников отображается в реальном времени.' },
      { title: 'Победа', content: 'Победитель забирает ставку XP обоих участников. Ничья — каждому возвращается своя ставка.' },
    ],
  },
  {
    id: 'leagues', icon: <Crown className="w-5 h-5" />, title: 'Лиги',
    description: 'Бронза → Серебро → Золото → Платина → Алмаз',
    forRole: 'manager',
    steps: [
      { title: 'Принцип', content: 'Все менеджеры распределяются по лигам. Каждая лига имеет свой порог очков. Лучшие в лиге повышаются, худшие — понижаются в конце сезона.' },
      { title: 'Сезон', content: 'Лиги обнуляются каждый сезон. Это даёт всем равные шансы и ощущение свежего старта.' },
    ],
  },
  {
    id: 'daily-reward', icon: <Gift className="w-5 h-5" />, title: 'Ежедневный бонус',
    description: 'Заходите каждый день за наградой',
    forRole: 'manager',
    steps: [
      { title: 'Получение', content: 'Раз в сутки забирайте бонус XP. Размер растёт с каждым днём подряд (стрик): 50, 75, 100, 150, 200, 300, 500 XP.' },
      { title: 'Стрик', content: 'Если пропустить день, стрик сбрасывается. Это сильный мотиватор не пропускать рабочие дни.' },
    ],
  },
  {
    id: 'fortune-wheel', icon: <Sparkles className="w-5 h-5" />, title: 'Колесо фортуны',
    description: 'Ежедневный спин с случайной наградой',
    forRole: 'manager',
    steps: [
      { title: 'Как крутить', content: 'Раз в день вы можете крутануть колесо. Награды: от 10 до 500 XP, бусты, скины, мистические коробки.' },
    ],
  },
  {
    id: 'mystery-box', icon: <Gift className="w-5 h-5" />, title: 'Мистические коробки',
    description: 'Сюрприз-награды за выполнение целей',
    forRole: 'manager',
    steps: [
      { title: 'Получение', content: 'Коробки выдаются за достижения, выполнение плана, серии активности. Открытие даёт случайную награду: XP, буст, кастомный скин или редкое достижение.' },
    ],
  },
  {
    id: 'season-pass', icon: <Crown className="w-5 h-5" />, title: 'Боевой пропуск (Season Pass)',
    description: 'Сезонный трек наград с бесплатной и премиум-веткой',
    forRole: 'manager',
    steps: [
      { title: 'Прогресс', content: 'Зарабатывайте XP сезона за любые действия. Каждые N XP открывают новый уровень (тир) с наградой.' },
      { title: 'Премиум', content: 'Премиум-ветка содержит эксклюзивные бусты, скины и крупные XP-бонусы.' },
    ],
  },
  // ====== AI и аналитика ======
  {
    id: 'ai-assistant', icon: <Bot className="w-5 h-5" />, title: 'AI-ассистент',
    description: 'Умный помощник по продажам в чате',
    forRole: 'manager',
    steps: [
      { title: 'Что умеет', content: 'Отвечает на вопросы по продажам, помогает писать сообщения клиентам, предлагает скрипты, разбирает возражения.' },
      { title: 'Контекст', content: 'Ассистент видит ваших клиентов и сделки, поэтому даёт ответы с учётом конкретной ситуации.' },
    ],
  },
  {
    id: 'ai-coach', icon: <Brain className="w-5 h-5" />, title: 'AI-коуч',
    description: 'Персональные советы по росту',
    forRole: 'manager',
    steps: [
      { title: 'Анализ', content: 'Коуч анализирует ваши метрики за последние недели и предлагает 2-3 конкретных шага для улучшения результата.' },
      { title: 'Регулярность', content: 'Получайте новые советы еженедельно. Отмечайте выполненные — коуч учитывает прогресс.' },
    ],
  },
  {
    id: 'ai-insights', icon: <Sparkles className="w-5 h-5" />, title: 'AI-инсайты',
    description: 'Автоматические подсказки и предупреждения',
    forRole: 'all',
    steps: [
      { title: 'Что показывает', content: 'Аномалии в воронке, клиенты-«висяки», прогноз отставания от плана, рекомендации по приоритетным действиям.' },
      { title: 'Приоритет', content: 'Инсайты ранжируются по важности. Самые срочные — красным, средние — жёлтым, советы — зелёным.' },
    ],
  },
  {
    id: 'lead-scoring', icon: <TrendingUp className="w-5 h-5" />, title: 'Скоринг лидов',
    description: 'AI оценивает каждого клиента по шкале 0-100',
    forRole: 'manager',
    steps: [
      { title: 'Оценка', content: 'AI учитывает температуру клиента, давность контакта, сумму сделки, стадию воронки и историю взаимодействий.' },
      { title: 'Рекомендация', content: 'Для каждого клиента — конкретное следующее действие: позвонить, отправить КП, договориться о встрече.' },
    ],
  },
  {
    id: 'forecast', icon: <BarChart3 className="w-5 h-5" />, title: 'Прогноз выручки',
    description: 'Что заработаете в этом и следующем месяце',
    forRole: 'all',
    steps: [
      { title: 'Принцип', content: 'Модель учитывает текущий темп, сезонность, средний чек, конверсию и активные сделки в воронке.' },
      { title: 'Достоверность', content: 'Каждый прогноз идёт с указанием уверенности (0-100%). Чем больше данных, тем точнее прогноз.' },
    ],
  },
  {
    id: 'voice-notes', icon: <Mic className="w-5 h-5" />, title: 'Голосовые заметки',
    description: 'Диктуйте — AI расшифрует и саммаризует',
    forRole: 'manager',
    steps: [
      { title: 'Запись', content: 'Нажмите «Записать», говорите. После остановки система превратит речь в текст и сделает краткое саммари.' },
      { title: 'Привязка к клиенту', content: 'Можно привязать заметку к карточке клиента — она сохранится в истории контактов.' },
    ],
  },
  {
    id: 'call-analyzer', icon: <Mic className="w-5 h-5" />, title: 'Анализатор звонков',
    description: 'Логирование звонков и работа над ошибками',
    forRole: 'manager',
    steps: [
      { title: 'Лог', content: 'После звонка отметьте длительность, исход (успех/неудача/нейтральный) и заметки. Накапливается история.' },
      { title: 'Аналитика', content: 'Видна конверсия звонков, средняя длительность, лучшие дни и часы для звонков.' },
    ],
  },
  // ====== Командная работа ======
  {
    id: 'chat', icon: <MessageCircle className="w-5 h-5" />, title: 'Командный чат',
    description: 'Общение по каналам с реакциями',
    forRole: 'all',
    steps: [
      { title: 'Каналы', content: 'Есть общий канал и тематические. Руководитель создаёт новые каналы.' },
      { title: 'Реакции', content: 'Реагируйте на сообщения эмодзи. Можно отвечать на конкретное сообщение (тред).' },
    ],
  },
  {
    id: 'kudos', icon: <ThumbsUp className="w-5 h-5" />, title: 'Кудос (благодарности)',
    description: 'Отправляйте коллегам публичную похвалу',
    forRole: 'all',
    steps: [
      { title: 'Отправка', content: 'Выберите коллегу, эмодзи и короткое сообщение. Получатель получает уведомление и +5 XP.' },
      { title: 'Лента', content: 'Все кудос видны в общей ленте — это укрепляет командный дух.' },
    ],
  },
  {
    id: 'ideas', icon: <Lightbulb className="w-5 h-5" />, title: 'Банк идей',
    description: 'Предлагайте улучшения и голосуйте',
    forRole: 'all',
    steps: [
      { title: 'Предложение', content: 'Опишите идею: название, категория, описание. Идея появляется в общем списке.' },
      { title: 'Голосование', content: 'Команда голосует за/против. Идеи с высоким рейтингом руководитель берёт в работу.' },
    ],
  },
  {
    id: 'polls', icon: <Vote className="w-5 h-5" />, title: 'Опросы',
    description: 'Быстрые голосования по командным решениям',
    forRole: 'all',
    steps: [
      { title: 'Создание (Leader)', content: 'Руководитель создаёт опрос: вопрос, варианты ответа, дата закрытия.' },
      { title: 'Голос', content: 'Менеджеры голосуют один раз. Результаты видны после закрытия.' },
    ],
  },
  {
    id: 'okr', icon: <Compass className="w-5 h-5" />, title: 'OKR (Цели и ключевые результаты)',
    description: 'Стратегические цели на квартал',
    forRole: 'all',
    steps: [
      { title: 'Структура', content: 'Цель (Objective) — амбициозное направление. Ключевые результаты (Key Results) — измеримые метрики прогресса.' },
      { title: 'Личные и командные', content: 'OKR могут быть персональные (своя цель) или командные (общая цель компании).' },
      { title: 'Прогресс', content: 'Обновляйте текущие значения KR — система пересчитывает общий прогресс цели.' },
    ],
  },
  {
    id: 'pomodoro', icon: <Coffee className="w-5 h-5" />, title: 'Pomodoro Pro',
    description: 'Циклы концентрации с короткими перерывами',
    forRole: 'manager',
    steps: [
      { title: 'Принцип', content: '25 минут фокуса → 5 минут перерыва. Каждые 4 цикла — длинный перерыв 15 минут.' },
      { title: 'Награда', content: 'За завершённый цикл — XP и +Discipline. История сессий доступна в аналитике.' },
    ],
  },
  // ====== Управление (Leader) ======
  {
    id: 'broadcasts', icon: <Send className="w-5 h-5" />, title: 'Массовые рассылки',
    description: 'Сообщения всем менеджерам или группе',
    forRole: 'leader',
    steps: [
      { title: 'Создание', content: 'Укажите заголовок, текст и аудиторию (все/группа/отдельные). Сообщение придёт уведомлением.' },
      { title: 'История', content: 'Все рассылки сохраняются с указанием количества получателей и автора.' },
    ],
  },
  {
    id: 'audit-log', icon: <ScrollText className="w-5 h-5" />, title: 'Аудит-лог',
    description: 'История всех важных действий руководителя',
    forRole: 'leader',
    steps: [
      { title: 'Что фиксируется', content: 'Изменения ролей, удаление менеджеров, штрафы, отзыв инвайтов, изменения настроек системы.' },
      { title: 'Поиск', content: 'Фильтр по действию, автору или типу сущности. Удобно для разбора инцидентов.' },
    ],
  },
  {
    id: 'admin-page', icon: <Shield className="w-5 h-5" />, title: 'Админ-панель',
    description: 'Все инструменты управления в одном месте',
    forRole: 'leader',
    steps: [
      { title: 'Вкладки', content: 'Менеджеры, инвайты, достижения, бусты, активности, конкурсы, статистика, настройки системы, аудит, разработка.' },
      { title: 'Настройки системы', content: 'Глобальные параметры: XP за действия, длительность сезона, лимиты бустов, расписания.' },
      { title: 'Раздел разработчика', content: 'Чек-лист проверок после миграций: первый пользователь = leader, последующие = manager, защита роутов, RLS.' },
    ],
  },
  {
    id: 'reports-export', icon: <ClipboardList className="w-5 h-5" />, title: 'Отчёты и экспорт',
    description: 'PDF/CSV отчёты по команде',
    forRole: 'leader',
    steps: [
      { title: 'Генерация', content: 'Выберите период и тип отчёта (выручка, активность, конверсия, дисциплина). Скачайте PDF или CSV.' },
    ],
  },
  {
    id: 'team-plan', icon: <Target className="w-5 h-5" />, title: 'План команды',
    description: 'Месячный план на всю команду',
    forRole: 'leader',
    steps: [
      { title: 'Установка', content: 'Задайте план команды на месяц: по выручке, счетам или клиентам. Все менеджеры видят общий прогресс.' },
      { title: 'KPI менеджеров', content: 'Установите индивидуальные KPI каждому менеджеру в карточке.' },
    ],
  },
  {
    id: 'one-on-one', icon: <Users className="w-5 h-5" />, title: '1-на-1 встречи',
    description: 'Заметки по личным встречам с менеджерами',
    forRole: 'leader',
    steps: [
      { title: 'Запись', content: 'Для каждого менеджера ведите дневник встреч: дата, темы, договорённости. Менеджер видит только свои заметки.' },
    ],
  },
  {
    id: 'automation', icon: <Zap className="w-5 h-5" />, title: 'Автоматизации',
    description: 'Триггер → действие без участия человека',
    forRole: 'leader',
    steps: [
      { title: 'Триггеры', content: 'Например: счёт не оплачен 3 дня, менеджер не активен сутки, выручка ниже плана.' },
      { title: 'Действия', content: 'Отправить уведомление, начислить штраф, выдать буст, поставить задачу.' },
    ],
  },
  {
    id: 'notifications-bell', icon: <Bell className="w-5 h-5" />, title: 'Колокольчик уведомлений',
    description: 'Все важные события в одном месте',
    forRole: 'all',
    steps: [
      { title: 'Что приходит', content: 'Кудос, ответы в чате, рассылки от руководителя, награды, дуэли, дедлайны квестов.' },
      { title: 'Управление', content: 'Отмечайте все как прочитанные одним кликом. Можно удалять отдельные уведомления.' },
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
    if (s.forRole === 'manager' && role === 'leader') return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      || s.steps.some(st => st.title.toLowerCase().includes(q) || st.content.toLowerCase().includes(q));
  });

  const allSections = filtered.filter(s => s.forRole === 'all');
  const managerSections = filtered.filter(s => s.forRole === 'manager');
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
        {allSections.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-foreground text-lg mt-4">📚 Основные функции</h2>
            {allSections.map(s => <GuideItem key={s.id} section={s} />)}
          </>
        )}
        {managerSections.length > 0 && (
          <>
            <h2 className="font-display font-semibold text-foreground text-lg mt-6">🎮 Для менеджера</h2>
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
