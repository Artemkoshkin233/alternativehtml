const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#080604');
  tg.setBackgroundColor('#080604');
  tg.enableClosingConfirmation();
}
const haptic = (type='light') => tg?.HapticFeedback?.impactOccurred(type);
const hapticN = (type='success') => tg?.HapticFeedback?.notificationOccurred(type);

const SCENARIOS = {
  classic:  {em:'🏛️',nm:'Классика',     ds:'Стандартное начало для новичков',  s:75,r:80,m:70},
  hard:     {em:'💀',nm:'Тяжело',        ds:'Для опытных стратегов',             s:50,r:55,m:45},
  empire:   {em:'👑',nm:'Империя',       ds:'Начните правителем великой державы',s:90,r:90,m:90},
  nomad:    {em:'🏕️',nm:'Кочевники',    ds:'Сила в движении, не в стенах',      s:60,r:90,m:40},
  merchant: {em:'💼',nm:'Торговцы',      ds:'Золото решает всё',                 s:65,r:60,m:95},
};

const AGES = [
  {id:'ancient',     nm:'Древность',       em:'🏺',from:1 },
  {id:'medieval',    nm:'Средневековье',    em:'⚔️',from:15},
  {id:'renaissance', nm:'Возрождение',      em:'🎨',from:30},
  {id:'industrial',  nm:'Индустриальная',   em:'⚙️',from:50},
  {id:'modern',      nm:'Современность',    em:'🌐',from:75},
];

const TECHNOLOGIES = [
  {id:'farming',    nm:'Земледелие',       em:'🌾',ds:'Улучшенные методы обработки земли',  age:'ancient',   cm:10,cr:5,  bonus:{s:0,r:2,m:0}, req:[]},
  {id:'masonry',    nm:'Каменное зодчество',em:'🏰',ds:'Прочные стены и укрепления',         age:'ancient',   cm:15,cr:10, bonus:{s:2,r:0,m:0}, req:[]},
  {id:'writing',    nm:'Письменность',     em:'📜',ds:'Запись законов и торговых договоров', age:'ancient',   cm:10,cr:0,  bonus:{s:1,r:0,m:1}, req:[]},
  {id:'trade_routes',nm:'Торговые пути',   em:'🛤️',ds:'Организованная сеть торговли',       age:'ancient',   cm:20,cr:5,  bonus:{s:0,r:1,m:2}, req:[]},
  {id:'feudalism',  nm:'Феодализм',        em:'🏯',ds:'Система вассалитета укрепляет власть',age:'medieval',  cm:25,cr:10, bonus:{s:3,r:0,m:0}, req:['masonry']},
  {id:'guilds',     nm:'Гильдии',          em:'⚒️',ds:'Ремесленные объединения',             age:'medieval',  cm:20,cr:5,  bonus:{s:1,r:1,m:2}, req:['trade_routes']},
  {id:'medicine',   nm:'Медицина',         em:'💊',ds:'Защита от болезней',                  age:'medieval',  cm:20,cr:10, bonus:{s:2,r:1,m:0}, req:['writing']},
  {id:'cavalry',    nm:'Конница',          em:'🐎',ds:'Мобильные военные отряды',            age:'medieval',  cm:30,cr:15, bonus:{s:2,r:0,m:1}, req:[]},
  {id:'printing',   nm:'Книгопечатание',   em:'📖',ds:'Распространение знаний',              age:'renaissance',cm:30,cr:5, bonus:{s:2,r:0,m:2}, req:['writing']},
  {id:'navigation', nm:'Навигация',        em:'🧭',ds:'Морские торговые маршруты',           age:'renaissance',cm:35,cr:10,bonus:{s:0,r:2,m:3}, req:['trade_routes']},
  {id:'banking',    nm:'Банковское дело',  em:'🏦',ds:'Кредиты и финансовые инструменты',    age:'renaissance',cm:40,cr:0, bonus:{s:0,r:0,m:4}, req:['guilds']},
  {id:'steam',      nm:'Паровой двигатель',em:'⚙️',ds:'Механизация производства',           age:'industrial', cm:50,cr:20,bonus:{s:0,r:4,m:3}, req:['guilds']},
  {id:'railways',   nm:'Железные дороги', em:'🚂',ds:'Быстрая переброска товаров и войск',   age:'industrial', cm:60,cr:20,bonus:{s:2,r:2,m:3}, req:['steam']},
  {id:'electricity',nm:'Электричество',   em:'⚡',ds:'Энергия для всей страны',              age:'modern',     cm:70,cr:15,bonus:{s:2,r:3,m:4}, req:['steam']},
  {id:'democracy',  nm:'Демократия',      em:'🗳️',ds:'Народное управление',                 age:'modern',     cm:50,cr:5, bonus:{s:5,r:0,m:2}, req:['printing']},
];

const NEIGHBORS = [
  {id:'nordland', nm:'Нордланд', em:'🏔️', power:60},
  {id:'aurantia', nm:'Аурантия', em:'🌅', power:70},
  {id:'veloria',  nm:'Велория',  em:'🌲', power:55},
  {id:'imperium', nm:'Имперум',  em:'🦅', power:90},
  {id:'desertis', nm:'Дезертис', em:'🏜️', power:50},
];

const ACHIEVEMENTS = [
  {id:'ruler_5',      em:'🥉',nm:'Первые шаги',        ds:'5 лет у власти',             check:g=>g.year>=5},
  {id:'ruler_15',     em:'🥈',nm:'Опытный правитель',   ds:'15 лет у власти',            check:g=>g.year>=15},
  {id:'ruler_30',     em:'🥇',nm:'Великий государь',    ds:'30 лет у власти',            check:g=>g.year>=30},
  {id:'ruler_50',     em:'👑',nm:'Легенда',              ds:'50 лет у власти',            check:g=>g.year>=50},
  {id:'ruler_100',    em:'🌟',nm:'Бессмертная слава',    ds:'100 лет у власти',           check:g=>g.year>=100, secret:true},
  {id:'max_stability',em:'🏛️',nm:'Железный порядок',   ds:'Стабильность 100',           check:g=>g.s>=100},
  {id:'max_resources',em:'🌾',nm:'Богатые закрома',      ds:'Ресурсы 100',                check:g=>g.r>=100},
  {id:'max_money',    em:'💰',nm:'Золотая казна',        ds:'Казна 100',                  check:g=>g.m>=100},
  {id:'all_max',      em:'✨',nm:'Золотой век',           ds:'Все показатели 80+',         check:g=>g.s>=80&&g.r>=80&&g.m>=80},
  {id:'survivor_10',  em:'😰',nm:'На краю пропасти',    ds:'Выжить с показателем ≤10',   check:g=>g.s<=10||g.r<=10||g.m<=10},
  {id:'comeback',     em:'🔥',nm:'Феникс',               ds:'Поднять показ. с ≤15 до 60+',check:g=>g._comeback},
  {id:'pacifist',     em:'🕊️',nm:'Голубь мира',         ds:'10 ходов без силовых решений',check:g=>g._peaceTurns>=10},
  {id:'iron_fist',    em:'⚔️',nm:'Железный кулак',      ds:'5 силовых решений подряд',   check:g=>g._forceTurns>=5},
  {id:'diplomat',     em:'🤝',nm:'Великий дипломат',    ds:'Заключить 3 союза',          check:g=>g.alliancesMade>=3},
  {id:'spendthrift',  em:'🎊',nm:'Транжира',              ds:'Потратить 200+ за партию',   check:g=>g.totalSpent>=200},
  {id:'first_game',   em:'🎮',nm:'Первое правление',     ds:'Завершить первую партию',    check:(g,p)=>p.totalGames>=1},
  {id:'three_games',  em:'🎯',nm:'Ветеран',               ds:'Сыграть 3 партии',           check:(g,p)=>p.totalGames>=3},
  {id:'ten_games',    em:'🏆',nm:'Чемпион',               ds:'Сыграть 10 партий',          check:(g,p)=>p.totalGames>=10},
  {id:'all_scenarios',em:'🗺️',nm:'Исследователь',       ds:'Все 5 сценариев',            check:(g,p)=>p.scenarios?.length>=5, secret:true},
  {id:'buyer',        em:'⭐',nm:'Меценат',               ds:'Купить в лавке',             check:(g,p)=>p.hasPurchase},
  {id:'first_tech',   em:'🔬',nm:'Первооткрыватель',     ds:'Исследовать технологию',     check:g=>g.techs?.length>=1},
  {id:'tech_master',  em:'🧪',nm:'Мастер науки',         ds:'Исследовать 5 технологий',   check:g=>g.techs?.length>=5},
  {id:'modern_age',   em:'🚀',nm:'В будущее!',           ds:'Достичь Современности',      check:g=>getAge(g.year).id==='modern', secret:true},
  {id:'warlord',      em:'⚔️',nm:'Повелитель войны',    ds:'Выиграть 3 войны',           check:g=>g.warsWon>=3},
  {id:'peacemaker',   em:'☮️',nm:'Миротворец',           ds:'Заключить 3 союза',          check:g=>g.alliancesMade>=3},
  {id:'betrayer',     em:'🗡️',nm:'Предатель',           ds:'Нарушить союз',              check:g=>g._betrayed, secret:true},
  {id:'disaster_surv',em:'🌋',nm:'Выжил в катастрофе',  ds:'Пережить стихийное бедствие',check:g=>g._disastersSurvived>=1},
];

const COURT = [
  {av:'🧙',nm:'Советник Аристарх',  ph:['«Государь, взвесьте каждое слово.»','«Семь раз отмерь.»','«История любит мудрых.»']},
  {av:'😰',nm:'Трус Феофан',        ph:['«Может, лучше не рисковать?»','«Я бы воздержался, государь…»','«Всё может кончиться плохо!»']},
  {av:'🦊',nm:'Хитрец Бенедикт',    ph:['«Всегда есть скрытая выгода.»','«Ключ в деталях, государь.»','«Деньги не пахнут.»']},
  {av:'⚔️',nm:'Воевода Радомир',    ph:['«Мечи острые — мир прочный!»','«Враги уважают только силу.»','«Удар первым — дело чести!»']},
  {av:'🗺️',nm:'Стратег Велимир',    ph:['«Смотрите на три хода вперёд.»','«Карта войны — это карта победы.»','«Перемога за нами!»']},
  {av:'🤡',nm:'Балагур Тимоша',     ph:['«А может, просто монетку?»','«В каждой шутке — доля правды!»','«Народ любит хлеба и зрелищ.»']},
  {av:'🃏',nm:'Мудрый Прошка',      ph:['«Правда прячется в смехе.»','«Дурак видит то, что мудрый скрывает.»','«Всё суета!»']},
];

const EVENTS = [
  {id:'drought',     t:'crisis',      ti:'☀️ Засуха',               tx:'Три месяца без дождей. Поля горят, скот погибает. Советники в растерянности.',
   ch:[{tx:'🌊 Открыть резервы зерна',        fx:{s:-5,r:-15,m:-10},rs:'Запасы спасли народ. Стабильность удержана.'},
       {tx:'🙏 Объявить молебны',              fx:{s:+8,r:-20,m:0},  rs:'Народная молитва объединила людей. Дождь пришёл.'},
       {tx:'💰 Купить зерно у соседей',        fx:{s:+5,r:+10,m:-20},rs:'Торговля спасла ситуацию.'},
       {tx:'😶 Ждать и надеяться',             fx:{s:-15,r:-25,m:0}, rs:'Голод ударил по всем провинциям.'}]},
  {id:'plague',      t:'crisis',      ti:'☣️ Мор',                  tx:'Болезнь распространяется из торгового квартала. Лекари требуют немедленного карантина.',
   ch:[{tx:'🏥 Жёсткий карантин',              fx:{s:-10,r:-5,m:-15},rs:'Болезнь остановлена, экономика страдает.'},
       {tx:'💊 Нанять лучших лекарей',         fx:{s:+5,r:0,m:-20},  rs:'Лекари создали снадобье. Народ благодарен.'},
       {tx:'🔥 Сжечь заражённый квартал',      fx:{s:-20,r:0,m:-5},  rs:'Радикально, но эффективно. Народ в ужасе.'},
       {tx:'😶 Не вмешиваться',                fx:{s:-25,r:-15,m:0}, rs:'Болезнь выкосила тысячи.'}]},
  {id:'flood',       t:'crisis',      ti:'🌊 Наводнение',            tx:'Река вышла из берегов. Нижний город затоплен, порты разрушены.',
   ch:[{tx:'⛏️ Построить дамбу немедленно',    fx:{s:+10,r:-10,m:-25},rs:'Дамба защитит город навсегда.'},
       {tx:'🏘️ Переселить пострадавших',       fx:{s:-5,r:-15,m:-15}, rs:'Переселение прошло болезненно.'},
       {tx:'🤝 Принять помощь союзников',      fx:{s:+15,r:+5,m:-10}, rs:'Союзники помогли быстрее, чем ожидали.'},
       {tx:'😶 Предоставить судьбе',            fx:{s:-20,r:-20,m:0},  rs:'Народ не забудет безразличия правителя.'}]},
  {id:'rebellion',   t:'crisis',      ti:'⚔️ Восстание',            tx:'Недовольные провинции подняли мятеж под знаменем справедливости.',
   ch:[{tx:'🤝 Переговоры и реформы',          fx:{s:+5,r:0,m:-20},  rs:'Мятежники успокоились. Реформы одобрены.'},
       {tx:'⚔️ Подавить военной силой',        fx:{s:-10,r:-20,m:-15},rs:'Мятеж подавлен жестоко. Но враги затаились.'},
       {tx:'💰 Подкупить лидеров',             fx:{s:0,r:0,m:-30},   rs:'Золото решило всё, как всегда.'},
       {tx:'👑 Уступить требованиям народа',   fx:{s:-15,r:+5,m:+10},rs:'Власть ослаблена, но народ доволен.'}]},
  {id:'noble_revolt',t:'crisis',      ti:'👑 Мятеж знати',          tx:'Крупнейшие лорды объединились. Они требуют ограничить власть правителя. За ними — треть армии.',
   ch:[{tx:'📜 Подписать Хартию вольностей',   fx:{s:-5,r:0,m:-10},  rs:'Власть ограничена, гражданская война предотвращена.'},
       {tx:'⚔️ Разгромить мятежников',         fx:{s:+10,r:-20,m:-20},rs:'Лорды сломлены, но затаили злобу.'},
       {tx:'🤝 Расколоть союз лордов',         fx:{s:+5,r:-5,m:-15}, rs:'Хитрость победила силу.'},
       {tx:'🗡️ Тайно устранить зачинщиков',    fx:{s:+15,r:0,m:-10}, rs:'Тёмная работа. Никаких улик.'}], minYear:10},
  {id:'trade',       t:'opportunity', ti:'🚢 Торговый договор',     tx:'Купцы предлагают выгодный договор с дальними землями. Риски минимальны.',
   ch:[{tx:'✅ Подписать немедленно',           fx:{s:+5,r:+10,m:+20},rs:'Торговля принесла богатства.'},
       {tx:'💰 Торговаться жёстко',            fx:{s:0,r:+5,m:+30},  rs:'Жёсткие переговоры — двойная прибыль.'},
       {tx:'🔍 Изучить год — проверить',       fx:{s:+10,r:+5,m:+10},rs:'Осторожность принесла умеренный доход.'},
       {tx:'🚫 Отказать — опасно',             fx:{s:+5,r:0,m:0},    rs:'Купцы ушли к соседям.'}]},
  {id:'festival',    t:'opportunity', ti:'🎉 Великий праздник',     tx:'Астрологи объявили счастливый год. Народ жаждет торжества.',
   ch:[{tx:'🎊 Грандиозный пир три дня',       fx:{s:+25,r:-10,m:-20},rs:'Народ ликует. Правитель обожаем.'},
       {tx:'🎭 Скромное городское торжество',  fx:{s:+10,r:-5,m:-8},  rs:'Достойный праздник. Всем приятно.'},
       {tx:'💰 Пусть сами оплачивают',         fx:{s:-5,r:0,m:+10},   rs:'Скупость не порок. Но народ ворчит.'},
       {tx:'📖 Направить деньги в науку',      fx:{s:0,r:+5,m:-15},   rs:'Учёные благодарны. Народ разочарован.'}]},
  {id:'war',         t:'crisis',      ti:'⚔️ Нападение соседей',   tx:'Соседний правитель объявил войну. Армия ждёт у ворот. Решайте быстро!',
   ch:[{tx:'⚔️ Встретить в чистом поле',      fx:{s:+15,r:-20,m:-25},rs:'Победа! Враг отступил в панике.'},
       {tx:'🏰 Закрыться в крепостях',         fx:{s:-5,r:-10,m:-15}, rs:'Оборона выдержала. Враг ушёл.'},
       {tx:'🕊️ Предложить переговоры',         fx:{s:-10,r:0,m:-20},  rs:'Мир куплен дорогой ценой.'},
       {tx:'🤝 Призвать союзников на помощь',  fx:{s:+10,r:-5,m:-15}, rs:'Совместная победа скрепила союз.'}]},
  {id:'harvest',     t:'opportunity', ti:'🌾 Небывалый урожай',    tx:'Природа щедра этим годом. Закрома ломятся от зерна. Какое решение мудрее?',
   ch:[{tx:'📦 Создать стратегические запасы', fx:{s:+5,r:+25,m:+5},  rs:'Мудрое решение. Запасы на годы вперёд.'},
       {tx:'🎊 Раздать народу бесплатно',      fx:{s:+20,r:+10,m:0},  rs:'Народ счастлив. Правитель любим.'},
       {tx:'💰 Продать соседним государствам', fx:{s:0,r:+10,m:+25},  rs:'Торговля принесла золото.'},
       {tx:'⚗️ Вложить излишки в науку',       fx:{s:+5,r:+10,m:-10}, rs:'Учёные сделают открытия.'}]},
  {id:'spy',         t:'crisis',      ti:'🕵️ Шпион при дворе',    tx:'Тайная стража донесла: среди советников — лазутчик вражеского двора.',
   ch:[{tx:'🔍 Тихое расследование',           fx:{s:+10,r:0,m:-10},  rs:'Шпион пойман без лишнего шума.'},
       {tx:'👁️ Двойная игра с врагом',         fx:{s:+5,r:0,m:-5},    rs:'Хитрость обернулась победой.'},
       {tx:'🗡️ Публичная казнь предателя',     fx:{s:-5,r:0,m:0},     rs:'Показательно. Двор напуган.'},
       {tx:'😶 Делать вид, что не знаем',      fx:{s:-10,r:0,m:+5},   rs:'Информация утеряна. Опасно.'}]},
  {id:'monument',    t:'event',       ti:'🏛️ Великий монумент',   tx:'Архитекторы предлагают возвести памятник, который прославит вас в веках.',
   ch:[{tx:'🏗️ Строить — памятник нужен!',    fx:{s:+15,r:-10,m:-30},rs:'Монумент возведён. Летописцы в восторге.'},
       {tx:'🌾 Лучше дороги и мосты',          fx:{s:+5,r:+10,m:-20}, rs:'Практичный выбор. Народ доволен.'},
       {tx:'🏥 Школы и больницы важнее',       fx:{s:+10,r:+5,m:-25}, rs:'Мудрое вложение в будущее.'},
       {tx:'💰 Казне нужны деньги',            fx:{s:-5,r:0,m:+5},    rs:'Скромность — не добродетель правителя.'}]},
  {id:'carnival',    t:'event',       ti:'🎪 Странствующий карнавал',tx:'Невиданный карнавал из дальних земель. Акробаты, звери, фокусники. Народ ликует.',
   ch:[{tx:'🎉 Пригласить на постоянную ярмарку',fx:{s:+15,r:+5,m:+10},rs:'Ярмарка привлекла купцов и туристов.'},
       {tx:'💰 Взять высокую пошлину',         fx:{s:+5,r:0,m:+20},   rs:'Карнавал уехал обиженным, но золото осталось.'},
       {tx:'🦁 Купить зверей для зверинца',    fx:{s:+10,r:0,m:-20},  rs:'Королевский зверинец — гордость столицы!'},
       {tx:'🚫 Прогнать — разврат',            fx:{s:-10,r:0,m:0},    rs:'Народ расстроен. Карнавал уехал к соседям.'}]},
  {id:'ancient_ruins',t:'opportunity',ti:'🏺 Древние руины',       tx:'Строители нашли руины цивилизации! Золото, артефакты, надписи на неизвестном языке.',
   ch:[{tx:'🔬 Научные раскопки',              fx:{s:+5,r:+5,m:+15},  rs:'Учёные расшифровали тексты. Бесценно!'},
       {tx:'💎 Выгрести золото быстро',        fx:{s:0,r:0,m:+30},    rs:'Богатство добыто. История потеряна.'},
       {tx:'🏛️ Создать музей',                fx:{s:+10,r:0,m:-15},  rs:'Музей стал достопримечательностью.'},
       {tx:'⛪ Объявить священным местом',      fx:{s:+15,r:0,m:+5},   rs:'Паломники несут золото в святилище.'}]},
  {id:'silk_road',   t:'opportunity', ti:'🛤️ Великий торговый путь',tx:'Купцы предлагают проложить через страну великий торговый путь. Это изменит всё.',
   ch:[{tx:'✅ Открыть путь',                  fx:{s:+5,r:+10,m:+30}, rs:'Великий путь принёс небывалое процветание!'},
       {tx:'🏯 Построить укреплённые посты',   fx:{s:+10,r:-10,m:+25},rs:'Посты обеспечили безопасность и доход.'},
       {tx:'💰 Высокие пошлины',               fx:{s:0,r:0,m:+20},    rs:'Купцы платят, но ищут обходные пути.'},
       {tx:'🚫 Закрыть границы',               fx:{s:+5,r:0,m:-10},   rs:'Путь пошёл через соседей.'}], minYear:10},
  {id:'philosopher', t:'event',       ti:'🧙 Великий мыслитель',   tx:'Прославленный философ просит аудиенции. Его идеи революционны — мудрец или еретик?',
   ch:[{tx:'📜 Пригласить в советники',        fx:{s:+5,r:0,m:-10},   rs:'Мудрые советы улучшили управление.'},
       {tx:'🏛️ Основать академию',            fx:{s:+5,r:-5,m:-20},  rs:'Академия привлекла лучшие умы!'},
       {tx:'📖 Издать его труды',              fx:{s:+10,r:0,m:-15},  rs:'Книги разошлись по всей стране.'},
       {tx:'⚠️ Выслать — опасные идеи',        fx:{s:+5,r:0,m:0},     rs:'Мыслитель уехал к соседям.'}], minYear:10},
  {id:'water_dispute',t:'event',      ti:'💧 Спор о воде',         tx:'Провинции спорят из-за реки. Фермеры перекрывают воду. Дело идёт к кровопролитию.',
   ch:[{tx:'⚖️ Ввести закон о воде',           fx:{s:+15,r:+5,m:-15}, rs:'Новый закон урегулировал конфликт.'},
       {tx:'🏗️ Система каналов для всех',      fx:{s:+10,r:+10,m:-25},rs:'Инженерное решение удовлетворило всех.'},
       {tx:'💪 Воду — тому, кто больше платит',fx:{s:-10,r:+5,m:+15}, rs:'Богатые рады. Бедные в ярости.'},
       {tx:'😶 Пусть сами разберутся',         fx:{s:-15,r:-10,m:0},  rs:'Конфликт перерос в кровную месть.'}]},
  {id:'census',      t:'event',       ti:'📊 Перепись населения',  tx:'Чиновники предлагают провести первую перепись. Это поможет улучшить сбор налогов.',
   ch:[{tx:'✅ Полная перепись',                fx:{s:+5,r:-5,m:+15},  rs:'Перепись выявила скрытые доходы.'},
       {tx:'📋 Только военный учёт',           fx:{s:+5,r:0,m:+5},    rs:'Армия усилилась. Налоги возросли умеренно.'},
       {tx:'🙅 Народ против — отменить',       fx:{s:+10,r:0,m:-5},   rs:'Народ доволен, что правитель слушает.'},
       {tx:'🤫 Тайно через купцов',            fx:{s:0,r:0,m:+10},    rs:'Данные получены. Никто не заметил.'}]},
  {id:'artists',     t:'event',       ti:'🎨 Меценатство',         tx:'Лучшие художники, скульпторы и поэты просят королевского покровительства.',
   ch:[{tx:'🏛️ Создать Академию искусств',    fx:{s:+15,r:0,m:-25},  rs:'Академия прославила державу!'},
       {tx:'🖼️ Заказать грандиозную фреску',   fx:{s:+10,r:-5,m:-20}, rs:'Фреска украсила тронный зал навеки.'},
       {tx:'💰 Небольшая субсидия',            fx:{s:+5,r:0,m:-10},   rs:'Умеренная поддержка. Искусство растёт.'},
       {tx:'❌ Искусство подождёт',             fx:{s:-5,r:+5,m:+5},   rs:'Художники уехали к другим дворам.'}]},
];

const DISASTERS = [
  {id:'earthquake', nm:'🌍 Землетрясение',  sv:'major',
   tx:'Земля содрогнулась. Города разрушены. Тысячи под завалами. Дороги непроходимы.',
   ch:[{tx:'🏗️ Немедленная спасательная операция',fx:{s:+10,r:-25,m:-20},rs:'Тысячи спасены. Народ благодарен.'},
       {tx:'⛪ Дни скорби и молитв',                fx:{s:+5,r:-10,m:-5},  rs:'Молитвы объединили народ.'},
       {tx:'🏦 Взять кредит на восстановление',     fx:{s:+15,r:-10,m:+10},rs:'Долг давит, но город восстанавливается.'},
       {tx:'😶 Армия поддерживает порядок',         fx:{s:-5,r:-15,m:-10}, rs:'Порядок есть, но спасатели запаздывают.'}]},
  {id:'volcano',    nm:'🌋 Извержение вулкана',sv:'catastrophic',
   tx:'Вулкан проснулся. Пепел накрыл три провинции. Урожай уничтожен. Беженцы заполнили столицу.',
   ch:[{tx:'🏕️ Эвакуация провинций',              fx:{s:+5,r:-20,m:-25}, rs:'Сотни тысяч переселены.'},
       {tx:'🌾 Импортировать продовольствие срочно',fx:{s:+10,r:+10,m:-35},rs:'Голод предотвращён. Казна истощена.'},
       {tx:'🔥 Объявить земли проклятыми',          fx:{s:-20,r:-15,m:0},  rs:'Суеверие посеяло панику.'},
       {tx:'⚗️ Послать учёных изучить явление',     fx:{s:0,r:-5,m:-15},   rs:'Учёные предсказали следующее извержение!'}]},
  {id:'plague_great',nm:'💀 Великий мор',   sv:'catastrophic',
   tx:'Чудовищная эпидемия охватила государство. Болезнь убивает за три дня. Умирают целые деревни.',
   ch:[{tx:'🏥 Жёсткий карантин — закрыть всё',    fx:{s:-10,r:-20,m:-25},rs:'Суровые меры остановили болезнь.'},
       {tx:'💰 Огромная награда за лекарство',      fx:{s:+5,r:-5,m:-40},  rs:'Лекарство найдено! Чудо!'},
       {tx:'🔥 Сжигать тела и заражённые дома',     fx:{s:-20,r:0,m:0},    rs:'Радикально, но эффективно.'},
       {tx:'🙏 Уповать на волю богов',               fx:{s:-30,r:-25,m:-10},rs:'Болезнь выкосила треть населения.'}]},
  {id:'hurricane',  nm:'🌀 Ураган',         sv:'major',
   tx:'С моря пришёл разрушительный ураган. Порты уничтожены, флот потоплен. Города в руинах.',
   ch:[{tx:'⛵ Восстановить флот и порты',           fx:{s:+5,r:-15,m:-30}, rs:'Торговля восстановлена.'},
       {tx:'🛤️ Переориентироваться на сухопутное',  fx:{s:0,r:+5,m:-10},   rs:'Новые торговые пути открыты.'},
       {tx:'🤝 Попросить помощи у союзников',        fx:{s:+10,r:+5,m:-15}, rs:'Союзники прислали корабли.'},
       {tx:'😶 Ждать',                               fx:{s:-15,r:-10,m:0},  rs:'Купцы разорились. Народ голодает.'}]},
  {id:'locust',     nm:'🦗 Нашествие саранчи',sv:'moderate',
   tx:'Тучи саранчи затмили солнце. За три дня уничтожен весь урожай пяти провинций.',
   ch:[{tx:'🔥 Сжечь поля и перепахать',            fx:{s:-5,r:-20,m:-10}, rs:'Саранча уничтожена. Новый урожай посеян.'},
       {tx:'💰 Закупить зерно из резервов',          fx:{s:+10,r:+5,m:-20}, rs:'Голод предотвращён. Запасы мудро использованы.'},
       {tx:'🐔 Выпустить птиц — поедят саранчу',    fx:{s:+5,r:-5,m:-5},   rs:'Народная мудрость сработала!'},
       {tx:'🚫 Чрезвычайное нормирование',           fx:{s:-10,r:-10,m:+5}, rs:'Нормирование вызвало недовольство.'}]},
  {id:'blizzard',   nm:'❄️ Великая стужа',  sv:'major',
   tx:'Небывалые морозы сковали государство. Реки замёрзли, скот гибнет. Бедняки замерзают.',
   ch:[{tx:'🪵 Открыть королевские дровяные склады', fx:{s:+20,r:-15,m:-10},rs:'Народ тепл. Правитель в народной любви.'},
       {tx:'💰 Субсидии беднякам',                   fx:{s:+10,r:-5,m:-20}, rs:'Деньги помогли. Богачи недовольны.'},
       {tx:'🏰 Открыть казармы как убежища',         fx:{s:+15,r:-10,m:-5}, rs:'Армия помогла народу.'},
       {tx:'😶 Каждый выживает сам',                 fx:{s:-25,r:-10,m:+5}, rs:'Тысячи погибли. Народ не простит.'}]},
  {id:'meteor',     nm:'☄️ Падение метеорита',sv:'moderate',
   tx:'С неба упал огненный камень! Разрушил небольшой город. Народ в панике — знамение богов?',
   ch:[{tx:'🔭 Послать учёных изучить',              fx:{s:+5,r:+10,m:-10}, rs:'Найдены редкие металлы. Научный прорыв!'},
       {tx:'⛪ Объявить место священным',             fx:{s:+20,r:0,m:+10},  rs:'Паломники несут золото в святилище.'},
       {tx:'⚔️ Переплавить в оружие',                fx:{s:+10,r:+15,m:+5}, rs:'Метеоритная сталь прочнее обычной!'},
       {tx:'😱 Объявить о конце света',              fx:{s:-25,r:-5,m:-5},  rs:'Паника охватила государство.'}]},
];

const BONUS_EVENTS = [
  {tx:'☀️ Удачный год — плодородие',   s:+5,r:+8,m:0},
  {tx:'💨 Торговые ветры благоволят',  s:0, r:0, m:+10},
  {tx:'🌿 Целебные травы найдены',     s:+7,r:+5,m:0},
  {tx:'🎶 Заезжий бард прославил вас', s:+5,r:0, m:+5},
  {tx:'💡 Изобретение облегчило труд', s:0, r:+8,m:+3},
  {tx:'🦅 Добрый знак — орёл над троном',s:+6,r:0,m:0},
  {tx:'⚗️ Алхимик нашёл золото',       s:0, r:+3,m:+12},
];

const DEF_STATE = () => ({
  rulerName:'', scenario:'classic', year:1,
  s:75, r:80, m:70,
  techs:[], alliances:[], wars:[],
  warsWon:0, alliancesMade:0, betrayals:0,
  totalSpent:0, history:[], usedEvents:[],
  lastDisasterYear:0,
  _forceTurns:0, _peaceTurns:0, _comeback:false, _betrayed:false,
  _disastersSurvived:0,
  activeNewspaper:null,
});

const DEF_PROFILE = () => ({
  totalGames:0, record:0, scenarios:[],
  achievements:[], hasPurchase:false,
  hintActive:false, extraLives:0, premium:false, vip:false,
});

let gs = loadState('civ_gs') || DEF_STATE();
let profile = loadState('civ_prof') || DEF_PROFILE();
let curScreen = 'game';
let selScenario = 'classic';
let pendingConfirm = null;

function loadState(k) {
  try { const d=localStorage.getItem(k); return d?JSON.parse(d):null; } catch(e){ return null; }
}
function save() {
  try {
    localStorage.setItem('civ_gs',   JSON.stringify(gs));
    localStorage.setItem('civ_prof', JSON.stringify(profile));
  } catch(e){}
}

function getAge(year) {
  let cur = AGES[0];
  for (const a of AGES) { if (year >= a.from) cur = a; }
  return cur;
}
function clamp(v) { return Math.max(0, Math.min(100, v)); }
function getAgeIdx(id) { return AGES.findIndex(a=>a.id===id); }
function curAgeIdx() { return getAgeIdx(getAge(gs.year).id); }

function getPassiveBonus() {
  let s=0,r=0,m=0;
  for (const tid of gs.techs) {
    const t = TECHNOLOGIES.find(x=>x.id===tid);
    if (t) { s+=t.bonus.s; r+=t.bonus.r; m+=t.bonus.m; }
  }
  s += gs.alliances.length;
  return {s,r,m};
}

function getAvailableTechs() {
  const ageIdx = curAgeIdx();
  return TECHNOLOGIES.filter(t => {
    if (gs.techs.includes(t.id)) return false;
    if (getAgeIdx(t.age) > ageIdx) return false;
    if (t.req.some(r => !gs.techs.includes(r))) return false;
    return true;
  });
}

function getPlayerPower() {
  let base = 50;
  base += gs.techs.filter(t=>['cavalry','steam','railways'].includes(t)).length * 10;
  base += gs.warsWon * 5;
  base += gs.alliances.length * 8;
  base = clamp(base);
  return base;
}

function pickEvent() {
  const yr = gs.year;
  const avail = EVENTS.filter(e => {
    if ((e.minYear||1) > yr) return false;
    return !gs.usedEvents.includes(e.id);
  });
  const pool = avail.length ? avail : EVENTS.filter(e=>(e.minYear||1)<=yr);
  if (!pool.length) return EVENTS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickDisaster() {
  if (gs.year - gs.lastDisasterYear < 3) return null;
  if (gs.year < 5) return null;
  const roll = Math.random();
  if (roll > 0.08) return null;
  return DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
}

function generateNewspaper() {
  const age = getAge(gs.year);
  let headline;
  if (gs.s < 25)          headline = 'СМУТА ОХВАТИЛА ДЕРЖАВУ!';
  else if (gs.s>85&&gs.r>85&&gs.m>85) headline = `ЗОЛОТОЙ ВЕК ${gs.rulerName.toUpperCase()}А!`;
  else if (gs.warsWon>0)  headline = 'АРМИЯ ОДЕРЖАЛА ПОБЕДУ!';
  else if (gs.m < 25)     headline = 'КАЗНА ПУСТА — ЧТО ДЕЛАТЬ?';
  else if (gs.r < 25)     headline = 'ГОЛОД СТУЧИТСЯ В ВОРОТА';
  else if (gs.techs.length>=5) headline = 'НАУКА ПРОЦВЕТАЕТ В ДЕРЖАВЕ';
  else                    headline = `ХРОНИКА ПРАВЛЕНИЯ ${gs.rulerName.toUpperCase()}А`;

  const cols = [
    {em:'🧐',nm:'Магистр Феликс',  tx: gs.s>60 ? 'Изучив летописи, отмечу: правление оказалось достойным.' : 'Летописи помнят смутные времена. Этот год — из них.'},
    {em:'🎭',nm:'Бард Тимофей',    tx: gs.m>60 ? `О, ${gs.rulerName}! Звёзды благоволят твоей казне!` : 'Тучи сгущаются над троном, но певцы всё равно поют.'},
    {em:'💼',nm:'Купец Ян Денарий', tx: gs.m>50 ? 'По моим счетам, торговля идёт хорошо.' : 'Цифры не лгут: нужны перемены в торговой политике.'},
    {em:'✝️',nm:'Монах Амвросий',   tx: gs.s>60 ? 'Бог хранит эту державу.' : 'Господь испытывает нас, но не оставит.'},
  ];
  const col = cols[Math.floor(Math.random()*cols.length)];

  const last5 = gs.history.slice(-5);
  const trends = [];
  const ts = last5.reduce((a,h)=>a+(h.fx?.s||0),0);
  const tr = last5.reduce((a,h)=>a+(h.fx?.r||0),0);
  const tm = last5.reduce((a,h)=>a+(h.fx?.m||0),0);
  if (ts>5) trends.push('📈 Стабильность росла');
  else if (ts<-5) trends.push('📉 Стабильность падала');
  if (tr>5) trends.push('📈 Ресурсы прибавились');
  else if (tr<-5) trends.push('📉 Ресурсы истощались');
  if (tm>5) trends.push('📈 Казна пополнялась');
  else if (tm<-5) trends.push('📉 Казна скудела');

  return {headline, age, col, trends, stats:{s:gs.s,r:gs.r,m:gs.m}, year:gs.year};
}

const G = {};

G.nav = function(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(`s-${id}`).classList.add('active');
  document.getElementById(`nb-${id}`)?.classList.add('active');
  curScreen = id;
  document.getElementById('sw').scrollTo(0,0);

  if (id==='game')  G.renderGame();
  if (id==='tech')  G.renderTech();
  if (id==='war')   G.renderWar();
  if (id==='chron') G.renderChron();
  if (id==='prof')  G.renderProf();
  if (id==='new')   G.renderNew();

  haptic('light');
};

G.renderNew = function() {
  const grid = document.getElementById('sc-grid');
  grid.innerHTML = '';
  const barColors = [
    'linear-gradient(90deg,#7a1515,#c03030)',
    'linear-gradient(90deg,#144425,#228844)',
    'linear-gradient(90deg,#3a2a0a,#c8923a)',
  ];
  Object.entries(SCENARIOS).forEach(([id,sc])=>{
    const d = document.createElement('div');
    d.className = `sc-card${id===selScenario?' sel':''}`;
    d.onclick = () => {
      selScenario = id;
      document.querySelectorAll('.sc-card').forEach((c,i)=>{
        c.classList.toggle('sel', Object.keys(SCENARIOS)[i]===id);
      });
      haptic('light');
    };
    const bars = [['🏛 Стаб.',sc.s],['🌾 Рес.',sc.r],['💰 Казна',sc.m]].map(([l,v],i)=>`
      <div class="sc-bar-row">
        <span class="sc-bar-lbl">${l}</span>
        <div class="sc-bar-track"><div class="sc-bar-fill" style="width:${v}%;background:${barColors[i]}"></div></div>
      </div>`).join('');
    d.innerHTML = `
      <div class="sc-top">
        <span class="sc-em">${sc.em}</span>
        <div><div class="sc-nm">${sc.nm}</div><div class="sc-ds">${sc.ds}</div></div>
      </div>
      <div class="sc-bars">${bars}</div>`;
    grid.appendChild(d);
  });
};

G.startGame = function() {
  const nm = document.getElementById('ruler-inp').value.trim();
  if (!nm) { toast('Введите имя правителя!'); return; }
  const sc = SCENARIOS[selScenario];

  profile.totalGames++;
  if (!profile.scenarios?.includes(selScenario)) {
    profile.scenarios = [...(profile.scenarios||[]), selScenario];
  }
  save();

  gs = DEF_STATE();
  gs.rulerName = nm;
  gs.scenario  = selScenario;
  gs.s = sc.s; gs.r = sc.r; gs.m = sc.m;
  save();

  hapticN('success');
  toast(`Да здравствует ${nm}! 👑`);
  G.nav('game');
};

G.renderGame = function() {
  if (!gs.rulerName) { return; }
  const age = getAge(gs.year);

  document.getElementById('g-ruler').textContent = gs.rulerName;
  document.getElementById('g-age-sub').textContent = age.nm;
  document.getElementById('g-crest').textContent = age.em;
  document.getElementById('g-year').textContent  = gs.year;
  document.getElementById('g-age-em').textContent = age.em;
  document.getElementById('g-age-nm').textContent  = age.nm;

  G.updateStats();
  G.updateBonusTicker();

  const disaster = pickDisaster();
  if (disaster) {
    gs.lastDisasterYear = gs.year;
    G.renderDisaster(disaster);
  } else {
    const ev = pickEvent();
    G.renderEvent(ev);
  }
};

G.updateStats = function(animate=true) {
  const dur = animate ? '.65s' : '0s';
  [['s','sf-s','sv-s'],['r','sf-r','sv-r'],['m','sf-m','sv-m']].forEach(([k,bid,vid])=>{
    const bar = document.getElementById(bid);
    const val = document.getElementById(vid);
    if(bar){ bar.style.transition=`width ${dur} cubic-bezier(.23,1,.32,1)`; bar.style.width=`${gs[k]}%`; }
    if(val) val.textContent = gs[k];
  });
};

G.updateBonusTicker = function() {
  const bonus = getPassiveBonus();
  const ticker = document.getElementById('bonus-ticker');
  const chips  = document.getElementById('bonus-chips');
  const parts = [];
  if(bonus.s>0) parts.push(`<span class="bchip bchip-pos">🏛 Стабильность</span>`);
  if(bonus.r>0) parts.push(`<span class="bchip bchip-pos">🌾 Ресурсы</span>`);
  if(bonus.m>0) parts.push(`<span class="bchip bchip-pos">💰 Казна</span>`);
  if(parts.length){ chips.innerHTML=parts.join(''); ticker.classList.remove('hidden'); }
  else { ticker.classList.add('hidden'); }
};

G.renderEvent = function(ev) {
  const card = document.getElementById('ev-card');
  card.className = `ev-card ev-${ev.t}`;

  const tags = {crisis:'⚠️ Кризис', opportunity:'✨ Возможность', event:'📜 Событие'};
  document.getElementById('ev-tag').textContent   = tags[ev.t]||'📜 Событие';
  document.getElementById('ev-title').textContent = ev.ti;
  document.getElementById('ev-text').textContent  = ev.tx;

  const ch = COURT[Math.floor(Math.random()*COURT.length)];
  document.getElementById('ev-court-ava').textContent = ch.av;
  document.getElementById('ev-court-txt').textContent = ch.ph[Math.floor(Math.random()*ch.ph.length)];
  document.getElementById('ev-court-nm').textContent  = ch.nm;

  const hintEl = document.getElementById('hint-reveal');
  hintEl.classList.toggle('hidden', !profile.hintActive);

  G.renderChoices(ev.ch, (ch) => G.makeChoice(ev, ch));
};

G.renderDisaster = function(dis) {
  const card = document.getElementById('ev-card');
  card.className = 'ev-card ev-disaster';

  const sevLabel = {minor:'⚡ Малое бедствие', moderate:'🔶 Бедствие', major:'🔴 Крупное бедствие', catastrophic:'💀 КАТАСТРОФА'};
  document.getElementById('ev-tag').textContent   = sevLabel[dis.sv]||'🔶 Бедствие';
  document.getElementById('ev-title').textContent = dis.nm;
  document.getElementById('ev-text').textContent  = dis.tx;

  const ch = COURT[Math.floor(Math.random()*COURT.length)];
  document.getElementById('ev-court-ava').textContent = ch.av;
  document.getElementById('ev-court-txt').textContent = '«Государь, это стихийное бедствие! Нужно действовать немедленно!»';
  document.getElementById('ev-court-nm').textContent  = ch.nm;
  document.getElementById('hint-reveal').classList.add('hidden');

  G.renderChoices(dis.ch, (ch)=> G.makeDisasterChoice(dis, ch));
};

G.renderChoices = function(choices, onPick) {
  const container = document.getElementById('choices');
  container.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'ch-btn';

    btn.innerHTML = `<span class="ch-text">${ch.tx}</span>`;
    btn.addEventListener('click', () => onPick(ch));
    container.appendChild(btn);
  });
};

G.makeChoice = function(ev, choice) {
  haptic('medium');
  gs.usedEvents.push(ev.id);
  G.applyEffects(ev, choice);
};

G.makeDisasterChoice = function(dis, choice) {
  haptic('heavy');
  gs._disastersSurvived++;
  G.applyEffects(dis, choice, true);
};

G.applyEffects = function(ev, choice, isDisaster=false) {
  const fx = choice.fx||{};
  const prevS=gs.s, prevR=gs.r, prevM=gs.m;

  const bonus = getPassiveBonus();

  gs.s = clamp(gs.s + (fx.s||0) + bonus.s);
  gs.r = clamp(gs.r + (fx.r||0) + bonus.r);
  gs.m = clamp(gs.m + (fx.m||0) + bonus.m);

  const spent = Math.abs(Math.min(0, fx.m||0));
  gs.totalSpent += spent;

  const txt = (choice.tx||'').toLowerCase();
  const isForce = txt.includes('силой')||txt.includes('подавить')||txt.includes('армию')||txt.includes('казн')||txt.includes('сжечь');
  const isPeace = txt.includes('перегово')||txt.includes('дипломат')||txt.includes('союзник')||txt.includes('мир');
  if(isForce){ gs._forceTurns=(gs._forceTurns||0)+1; gs._peaceTurns=0; }
  else if(isPeace){ gs._peaceTurns=(gs._peaceTurns||0)+1; gs._forceTurns=0; }
  else { gs._peaceTurns=(gs._peaceTurns||0)+1; gs._forceTurns=0; }

  if ((prevS<=15||prevR<=15||prevM<=15) && (gs.s>=60||gs.r>=60||gs.m>=60)) gs._comeback=true;

  gs.history.push({year:gs.year, ti:ev.ti||ev.nm, tx:choice.tx, rs:choice.rs, fx:{s:fx.s||0,r:fx.r||0,m:fx.m||0}});

  let bonusEv = null;
  if (gs.year % 5 === 0 && gs.year > 1) {
    bonusEv = BONUS_EVENTS[Math.floor(Math.random()*BONUS_EVENTS.length)];
    gs.s = clamp(gs.s+bonusEv.s); gs.r = clamp(gs.r+bonusEv.r); gs.m = clamp(gs.m+bonusEv.m);
  }

  gs.year++;

  const agePrev = getAge(gs.year - 1);
  const ageNow  = getAge(gs.year);
  if (ageNow.id !== agePrev.id) {
    const ab = document.getElementById('age-banner');
    document.getElementById('age-banner-name').textContent = `${ageNow.em} ${ageNow.nm}`;
    ab.classList.remove('hidden');
    setTimeout(()=>ab.classList.add('hidden'), 5000);
  }

  const npTeaser = document.getElementById('np-teaser');
  if (gs.year > 1 && (gs.year-1) % 10 === 0) {
    gs.activeNewspaper = generateNewspaper();
    document.getElementById('np-teaser-headline').textContent = gs.activeNewspaper.headline;
    npTeaser.classList.remove('hidden');
  } else {
    npTeaser.classList.add('hidden');
  }

  G.checkAchievements();
  save();

  G.updateStats(true);
  document.getElementById('g-year').textContent = gs.year;
  const ag = getAge(gs.year);
  document.getElementById('g-age-em').textContent = ag.em;
  document.getElementById('g-age-nm').textContent  = ag.nm;
  document.getElementById('g-age-sub').textContent = ag.nm;
  document.getElementById('g-crest').textContent   = ag.em;
  G.updateBonusTicker();

  G.showResult(choice.rs||'', fx, bonusEv);

  if (gs.s<=0 || gs.r<=0 || gs.m<=0) {
    setTimeout(()=>{ document.getElementById('res-bg').classList.add('hidden'); G.showGameOver(); }, 2500);
  }
};

G.showResult = function(text, fx, bonusEv) {
  const bg = document.getElementById('res-bg');
  document.getElementById('res-text').textContent = text;

  const impacts = [];
  if ((fx.s||0) > 0)  impacts.push(`<span class="res-icon-pos">🏛 Стабильность укрепилась</span>`);
  if ((fx.s||0) < 0)  impacts.push(`<span class="res-icon-neg">🏛 Стабильность пошатнулась</span>`);
  if ((fx.r||0) > 0)  impacts.push(`<span class="res-icon-pos">🌾 Ресурсы пополнились</span>`);
  if ((fx.r||0) < 0)  impacts.push(`<span class="res-icon-neg">🌾 Ресурсы истощились</span>`);
  if ((fx.m||0) > 0)  impacts.push(`<span class="res-icon-pos">💰 Казна пополнилась</span>`);
  if ((fx.m||0) < 0)  impacts.push(`<span class="res-icon-neg">💰 Казна поредела</span>`);
  let html = impacts.length ? `<div class="res-impacts">${impacts.join('')}</div>` : '';
  if (bonusEv) html += `<div class="res-bonus-ev">✨ ${bonusEv.tx}</div>`;
  document.getElementById('res-deltas').innerHTML = html;
  bg.classList.remove('hidden');
};

G.closeResult = function() {
  document.getElementById('res-bg').classList.add('hidden');
  haptic('light');
  if (gs.s>0 && gs.r>0 && gs.m>0) {
    const disaster = pickDisaster();
    if (disaster) { gs.lastDisasterYear=gs.year; G.renderDisaster(disaster); }
    else { G.renderEvent(pickEvent()); }
  }
};

G.showGameOver = function() {
  hapticN('error');
  if (gs.year > profile.record) { profile.record = gs.year; save(); }
  profile.totalGames = (profile.totalGames||0);
  save();

  document.getElementById('go-ico').textContent   = gs.s<=0?'⚔️':(gs.r<=0?'🌾':'💸');
  document.getElementById('go-ruler').textContent = gs.rulerName;
  document.getElementById('go-years').textContent = gs.year;
  const reason = gs.s<=0?'Восстание смело вашу власть. Народ больше не верит правителю.'
                :gs.r<=0?'Голод опустошил государство. Закрома пусты.'
                :'Казна иссякла. Армия разбежалась. Держава рухнула.';
  document.getElementById('go-reason').textContent = reason;

  const stats = `<div class="go-stat"><span class="icon">🏛</span><span class="val">${gs.s}</span></div>
    <div class="go-stat"><span class="icon">🌾</span><span class="val">${gs.r}</span></div>
    <div class="go-stat"><span class="icon">💰</span><span class="val">${gs.m}</span></div>`;
  document.getElementById('go-stats').innerHTML = stats;
  document.getElementById('go-screen').classList.remove('hidden');
};

G.goNewGame = function() {
  document.getElementById('go-screen').classList.add('hidden');
  G.nav('new');
};

G.goShare = function() {
  const text = `⚔️ ${gs.rulerName} правил ${gs.year} лет!\n🏛 ${gs.s} | 🌾 ${gs.r} | 💰 ${gs.m}\nСимулятор Цивилизации v6.0 — попробуй и ты!`;
  if (tg?.switchInlineQuery) tg.switchInlineQuery(text);
  else if (navigator.share) navigator.share({text});
  else { navigator.clipboard?.writeText(text); toast('Скопировано!'); }
};

G.openNewspaper = function() {
  if (!gs.activeNewspaper) return;
  const np = gs.activeNewspaper;
  const trends = np.trends.length ? np.trends.map(t=>`<li>${t}</li>`).join('') : '<li>Показатели стабильны</li>';
  const html = `
    <div class="np-paper-head">
      <div class="np-masthead">⚜ Государственный Вестник ⚜</div>
      <div class="np-title">${np.headline}</div>
      <div class="np-date">Год ${np.year} · Эпоха ${np.age.nm}</div>
    </div>
    <div class="np-divider"></div>
    <div class="np-section">
      <div class="np-section-title">Состояние державы</div>
      <div class="np-stat-bars">
        <div class="np-bar-row"><span class="np-bar-lbl">🏛 Стаб.</span><div class="np-bar-track"><div class="np-bar-fill sf-s" style="width:${np.stats.s}%"></div></div><span class="np-bar-val">${np.stats.s}</span></div>
        <div class="np-bar-row"><span class="np-bar-lbl">🌾 Рес.</span><div class="np-bar-track"><div class="np-bar-fill sf-r" style="width:${np.stats.r}%"></div></div><span class="np-bar-val">${np.stats.r}</span></div>
        <div class="np-bar-row"><span class="np-bar-lbl">💰 Казна</span><div class="np-bar-track"><div class="np-bar-fill sf-m" style="width:${np.stats.m}%"></div></div><span class="np-bar-val">${np.stats.m}</span></div>
      </div>
    </div>
    <div class="np-divider"></div>
    <div class="np-section">
      <div class="np-section-title">Тренды периода</div>
      <div class="np-section-body"><ul style="list-style:none;display:flex;flex-direction:column;gap:4px">${trends}</ul></div>
    </div>
    <div class="np-divider"></div>
    <div class="np-columnist">
      <div class="np-col-em">${np.col.em}</div>
      <div><div class="np-col-nm">${np.col.nm}</div><div class="np-col-txt">${np.col.tx}</div></div>
    </div>`;
  document.getElementById('np-content').innerHTML = html;
  document.getElementById('np-modal').classList.remove('hidden');
  haptic('light');
};

G.closeNewspaper = function() {
  document.getElementById('np-modal').classList.add('hidden');
};

openNewspaper = G.openNewspaper;

G.renderTech = function() {
  if (!gs.rulerName) {
    document.getElementById('tech-tree-wrap').innerHTML = '<div style="padding:20px 14px;color:var(--parch-dim);font-style:italic;text-align:center">Начните игру, чтобы исследовать технологии</div>';
    return;
  }
  document.getElementById('tech-sub').textContent = `Исследовано: ${gs.techs.length} / ${TECHNOLOGIES.length}`;
  const avail = getAvailableTechs();
  const wrap = document.getElementById('tech-tree-wrap');
  wrap.innerHTML = '';

  const ageOrder = AGES.map(a=>a.id);
  ageOrder.forEach(ageId => {
    const ageTechs = TECHNOLOGIES.filter(t=>t.age===ageId);
    if (!ageTechs.length) return;
    const age = AGES.find(a=>a.id===ageId);
    const epochDiv = document.createElement('div');
    epochDiv.className = 'tech-epoch';
    const grid = document.createElement('div');
    grid.className = 'tech-grid';

    ageTechs.forEach(t => {
      const isResearched = gs.techs.includes(t.id);
      const isAvail = avail.some(a=>a.id===t.id);
      const card = document.createElement('div');
      card.className = `tech-card${isResearched?' researched':isAvail?' available':' locked'}`;
      const bChips = [
        t.bonus.s>0?`<span class="fx-chip fx-pos">🏛 Стабильность</span>`:'',
        t.bonus.r>0?`<span class="fx-chip fx-pos">🌾 Ресурсы</span>`:'',
        t.bonus.m>0?`<span class="fx-chip fx-pos">💰 Казна</span>`:'',
      ].filter(Boolean).join('');
      card.innerHTML = `
        <div class="tech-em">${t.em}</div>
        <div class="tech-nm">${t.nm}</div>
        <div class="tech-ds">${t.ds}</div>
        <div class="tech-bonus-chips">${bChips||'<span style="font-size:11px;color:var(--parch-dim)">нет бонуса</span>'}</div>
        ${isResearched?'':isAvail?`<div class="tech-cost">💰${t.cm} 🌾${t.cr}</div>`:'<div style="font-size:10px;color:var(--parch-dim);font-style:italic">🔒 Нужны предпосылки</div>'}`;
      if (isAvail) {
        card.onclick = () => G.confirmResearch(t);
      }
      grid.appendChild(card);
    });
    epochDiv.innerHTML = `<div class="tech-epoch-lbl">${age.em} ${age.nm}</div>`;
    epochDiv.appendChild(grid);
    wrap.appendChild(epochDiv);
  });
};

G.confirmResearch = function(tech) {
  G.showConfirm(
    `🔬 ${tech.em} ${tech.nm}`,
    `Стоимость: 💰 ${tech.cm} · 🌾 ${tech.cr}\n\nПассивный бонус каждый ход:\n🏛 +${tech.bonus.s} 🌾 +${tech.bonus.r} 💰 +${tech.bonus.m}`,
    () => G.researchTech(tech)
  );
};

G.researchTech = function(tech) {
  if (gs.m < tech.cm) { toast('Недостаточно средств в казне!'); return; }
  if (gs.r < tech.cr) { toast('Недостаточно ресурсов!'); return; }
  gs.m = clamp(gs.m - tech.cm);
  gs.r = clamp(gs.r - tech.cr);
  gs.techs.push(tech.id);
  save();
  hapticN('success');
  toast(`✅ ${tech.nm} исследована!`);
  G.updateStats(true);
  G.renderTech();
};

G.renderWar = function() {
  if (!gs.rulerName) {
    document.getElementById('neighbors-wrap').innerHTML = '<div style="padding:20px 14px;color:var(--parch-dim);font-style:italic;text-align:center">Начните игру, чтобы взаимодействовать с соседями</div>';
    return;
  }
  const power = getPlayerPower();
  document.getElementById('war-power-fill').style.width = `${power}%`;
  document.getElementById('war-power-val').textContent  = power;
  document.getElementById('war-alliances-info').textContent = `Активных союзов: ${gs.alliances.length} · Побед: ${gs.warsWon}`;

  const wrap = document.getElementById('neighbors-wrap');
  wrap.innerHTML = '';
  NEIGHBORS.forEach(nb => {
    const isAlly = gs.alliances.includes(nb.id);
    const isWar  = gs.wars?.includes(nb.id);
    const status = isAlly?'ally':isWar?'war':'neutral';
    const statusTxt = isAlly?'🤝 Союзник':isWar?'⚔️ Война':'— Нейтральный';

    const card = document.createElement('div');
    card.className = 'neighbor-card';
    card.innerHTML = `
      <div class="nb-head">
        <div class="nb-em">${nb.em}</div>
        <div class="nb-info">
          <div class="nb-nm">${nb.nm}</div>
          <div class="nb-pw">Военная мощь: ${nb.power}</div>
        </div>
        <div class="nb-status nb-${status}">${statusTxt}</div>
      </div>
      <div class="pw-bar-wrap">
        <div class="pw-bar-lbl">Баланс сил</div>
        <div class="pw-bar-track">
          <div class="pw-bar-us"    style="width:${Math.min(power/(power+nb.power)*100,95)}%"></div>
          <div class="pw-bar-them"  style="width:${Math.min(nb.power/(power+nb.power)*100,95)}%"></div>
        </div>
      </div>`;
    const btns = document.createElement('div');
    btns.className = 'nb-btns';
    if (!isAlly && !isWar) {
      btns.innerHTML = `
        <button class="nb-btn nb-ally-btn" onclick="G.doAlliance('${nb.id}','${nb.nm}')">🤝 Союз</button>
        <button class="nb-btn nb-war-btn"  onclick="G.doWar('${nb.id}','${nb.nm}',${nb.power})">⚔️ Война</button>`;
    } else if (isAlly) {
      btns.innerHTML = `
        <button class="nb-btn nb-war-btn"  onclick="G.breakAlliance('${nb.id}','${nb.nm}')">🗡️ Разорвать союз</button>
        <button class="nb-btn nb-btn-disabled">✓ Союзник</button>`;
    } else {
      btns.innerHTML = `
        <button class="nb-btn nb-ally-btn" onclick="G.makePeace('${nb.id}','${nb.nm}')">🕊️ Заключить мир</button>
        <button class="nb-btn nb-btn-disabled">⚔️ В состоянии войны</button>`;
    }
    card.appendChild(btns);
    wrap.appendChild(card);
  });
};

G.doAlliance = function(id, nm) {
  G.showConfirm(`🤝 Союз с ${nm}`,
    `Заключить оборонительный союз?\nАльянс даст +1 к стабильности каждый ход.`,
    () => {
      if (!gs.alliances) gs.alliances=[];
      gs.alliances.push(id); gs.alliancesMade++;
      save(); hapticN('success'); toast(`🤝 Союз с ${nm} заключён!`); G.renderWar();
    });
};

G.breakAlliance = function(id, nm) {
  G.showConfirm(`🗡️ Разорвать союз с ${nm}`, `Это ухудшит отношения и снизит стабильность на -10.`,
    () => {
      gs.alliances = gs.alliances.filter(a=>a!==id);
      gs._betrayed = true; gs.s = clamp(gs.s-10);
      save(); haptic('heavy'); toast(`Союз с ${nm} разорван.`); G.renderWar(); G.updateStats();
    });
};

G.doWar = function(id, nm, enemyPower) {
  const myPower = getPlayerPower();
  const winChance = Math.round(myPower / (myPower + enemyPower) * 100);
  G.showConfirm(`⚔️ Война с ${nm}`,
    `Ваша мощь: ${myPower} vs Их мощь: ${enemyPower}\nШанс победы: ~${winChance}%\n\nПобеда: +20🏛 -15🌾 -15💰\nПоражение: -25🏛 -20🌾 -20💰`,
    () => {
      if (!gs.wars) gs.wars=[];
      const win = Math.random()*100 < winChance;
      if (win) {
        gs.warsWon++; gs.s=clamp(gs.s+20); gs.r=clamp(gs.r-15); gs.m=clamp(gs.m-15);
        hapticN('success'); toast(`⚔️ Победа над ${nm}!`);
      } else {
        gs.s=clamp(gs.s-25); gs.r=clamp(gs.r-20); gs.m=clamp(gs.m-20);
        haptic('heavy'); toast(`💀 Поражение от ${nm}!`);
      }
      save(); G.renderWar(); G.updateStats();
    });
};

G.makePeace = function(id, nm) {
  G.showConfirm(`🕊️ Мир с ${nm}`, `Заключить мирный договор?\nСтоимость: -15 казны.`,
    () => {
      gs.wars = (gs.wars||[]).filter(w=>w!==id);
      gs.m = clamp(gs.m-15);
      save(); toast(`🕊️ Мир с ${nm} заключён.`); G.renderWar(); G.updateStats();
    });
};

G.renderChron = function() {
  document.getElementById('chron-ruler-sub').textContent = gs.rulerName ? `${gs.rulerName} · Год ${gs.year}` : '—';
  const wrap = document.getElementById('chronicle-wrap');
  wrap.innerHTML = '';
  if (!gs.history || !gs.history.length) {
    wrap.innerHTML = '<div style="padding:20px 14px;color:var(--parch-dim);font-style:italic;text-align:center">История пуста. Начните игру.</div>';
    return;
  }

  const startDiv = document.createElement('div');
  startDiv.className = 'chronicle-entry';
  startDiv.innerHTML = `<div class="chron-year">📅 Год 1</div><div class="chron-text">Начало правления <strong>${gs.rulerName}</strong> — сценарий «${SCENARIOS[gs.scenario]?.nm}»</div>`;
  wrap.appendChild(startDiv);

  let lastAge = AGES[0].id;
  const seenAges = new Set([lastAge]);
  gs.history.forEach(h => {
    const age = getAge(h.year||1);
    if (!seenAges.has(age.id)) {
      seenAges.add(age.id);
      const d = document.createElement('div');
      d.className = 'chronicle-entry';
      d.style.borderLeftColor = 'var(--gold)';
      d.innerHTML = `<div class="chron-year">🌅 Год ${h.year}</div><div class="chron-text">Наступила эпоха <strong>${age.em} ${age.nm}</strong></div>`;
      wrap.appendChild(d);
    }
  });

  const recent = gs.history.slice(-15).reverse();
  recent.forEach(h => {
    const d = document.createElement('div');
    d.className = 'chronicle-entry';
    d.innerHTML = `
      <div class="chron-year">📌 Год ${h.year||'?'} · ${h.ti||'Событие'}</div>
      <div class="chron-text">${h.tx||''}</div>
      <div class="chron-result">→ ${h.rs||''}</div>`;
    wrap.appendChild(d);
  });

  if (gs.techs.length) {
    const d = document.createElement('div');
    d.className = 'chronicle-entry';
    d.style.borderLeftColor = 'var(--sapphire-ll)';
    const techList = gs.techs.map(tid=>{
      const t = TECHNOLOGIES.find(x=>x.id===tid);
      return t ? `${t.em} ${t.nm}` : tid;
    }).join(' · ');
    d.innerHTML = `<div class="chron-year">🔬 Технологии</div><div class="chron-text">${techList}</div>`;
    wrap.appendChild(d);
  }

  const cur = document.createElement('div');
  cur.className = 'chronicle-entry';
  cur.style.borderLeftColor = 'var(--gold-l)';
  const ag = getAge(gs.year);
  cur.innerHTML = `<div class="chron-year">⚡ Сейчас — Год ${gs.year}</div><div class="chron-text">${ag.em} ${ag.nm} · 🏛 ${gs.s} · 🌾 ${gs.r} · 💰 ${gs.m}</div>`;
  wrap.appendChild(cur);
};

G.renderProf = function() {
  document.getElementById('prof-ruler').textContent = gs.rulerName||'Нет активной игры';
  document.getElementById('pr-yr').textContent  = gs.rulerName ? gs.year : '—';
  document.getElementById('pr-rec').textContent = profile.record||0;
  document.getElementById('pr-gm').textContent  = profile.totalGames||0;
  document.getElementById('pr-ac').textContent  = (profile.achievements||[]).length;
  document.getElementById('ach-count').textContent = (profile.achievements||[]).length;

  const milestones = [5,15,30,50,100];
  const next = milestones.find(m=>gs.year<m)||100;
  const prev = milestones[milestones.indexOf(next)-1]||0;
  const pct  = prev >= next ? 100 : Math.round((gs.year-prev)/(next-prev)*100);
  document.getElementById('ms-lbl').textContent  = `До ${next} лет`;
  document.getElementById('ms-val').textContent  = `${gs.year}/${next}`;
  document.getElementById('ms-fill').style.width = `${pct}%`;

  const style = G.analyzeStyle();
  document.getElementById('sb-em').textContent    = style.em;
  document.getElementById('sb-title').textContent = style.title;
  document.getElementById('sb-desc').textContent  = style.desc;

  const grid = document.getElementById('ach-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const unlocked = (profile.achievements||[]).includes(a.id);
    const div = document.createElement('div');
    div.className = `ach-item ${unlocked?'unl':'lck'}`;
    div.textContent = a.em;
    div.onclick = () => toast(`${a.nm}: ${a.ds}`);
    grid.appendChild(div);
  });
};

G.analyzeStyle = function() {
  const h = gs.history||[];
  if (h.length<3) return {em:'⚖️',title:'Мудрый Правитель',desc:'Баланс во всём'};
  let f=0,p=0,t=0,b=0;
  h.forEach(e=>{
    const c=(e.tx||'').toLowerCase();
    if(c.includes('силой')||c.includes('подавить')||c.includes('армию')||c.includes('казн')) f++;
    if(c.includes('перегово')||c.includes('дипломат')||c.includes('союзник')) p++;
    if(c.includes('купить')||c.includes('продать')||c.includes('торг')||c.includes('золото')) t++;
    if(c.includes('строить')||c.includes('создать')||c.includes('основ')) b++;
  });
  const mx=Math.max(f,p,t,b);
  if(!mx) return {em:'⚖️',title:'Мудрый Правитель',desc:'Баланс во всём'};
  if(f>=mx) return {em:'⚔️',title:'Железный Кулак',   desc:'Решаете проблемы силой'};
  if(p>=mx) return {em:'🕊️',title:'Великий Дипломат',  desc:'Переговоры — ваша сила'};
  if(t>=mx) return {em:'💰',title:'Торговый Гений',    desc:'Золото решает всё'};
  return          {em:'🏗️',title:'Великий Строитель', desc:'Строите великую державу'};
};

G.checkAchievements = function() {
  if (!profile.achievements) profile.achievements = [];
  const unlocked = profile.achievements;
  ACHIEVEMENTS.forEach(a => {
    if (unlocked.includes(a.id)) return;
    let earn = false;
    try { earn = a.check(gs, profile); } catch(e){}
    if (earn) {
      unlocked.push(a.id);
      toast(`🎖️ Достижение: ${a.nm}`);
    }
  });
  save();
};

G.buy = function(type) {
  if (tg?.openInvoice) {
    const urls = {life:'extra_life', premium:'premium', hint:'hint', vip:'vip'};
    tg.openInvoice(`https://yourbot.example.com/invoice/${urls[type]}`);
  } else {
    const names = {life:'Дополнительная жизнь',premium:'Премиум-режим',hint:'Подсказка советника',vip:'VIP-статус'};
    toast(`${names[type]}: откройте в Telegram`);
  }
};

G.showConfirm = function(title, desc, onOk) {
  document.getElementById('conf-title').textContent = title;
  document.getElementById('conf-desc').textContent  = desc.replace(/\n/g,'\n');
  document.getElementById('conf-desc').style.whiteSpace = 'pre-line';
  pendingConfirm = onOk;
  document.getElementById('conf-bg').classList.remove('hidden');
  document.getElementById('conf-ok-btn').onclick = () => { G.closeConfirm(); onOk(); };
};

G.closeConfirm = function() {
  document.getElementById('conf-bg').classList.add('hidden');
  pendingConfirm = null;
};

let toastT = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(()=>el.classList.remove('show'), 2600);
}

if (tg) {
  tg.onEvent('backButtonClicked', () => {
    if (!document.getElementById('np-modal').classList.contains('hidden'))  { G.closeNewspaper(); return; }
    if (!document.getElementById('conf-bg').classList.contains('hidden'))   { G.closeConfirm(); return; }
    if (!document.getElementById('res-bg').classList.contains('hidden'))    { G.closeResult(); return; }
    if (!document.getElementById('go-screen').classList.contains('hidden')) { G.goNewGame(); return; }
    if (curScreen !== 'game') { G.nav('game'); } else { tg.close(); }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  G.renderNew();
  if (gs.rulerName) {
    G.nav('game');
  } else {
    G.nav('new');
  }
});