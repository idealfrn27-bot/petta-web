'use client';

import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { siteConfig } from '../site-config';

const productViews = [
  { id: 'side', number: '02', label: '侧面', meta: 'SIDE', image: '/images/v5/product-system/petta-side-balanced-v4.png', alt: 'PETTA 宠物项圈侧面概念视图' },
  { id: 'front', number: '01', label: '正面', meta: 'FRONT', image: '/images/v5/product-system/petta-front-balanced-v4.png', alt: 'PETTA 宠物项圈正面概念视图' },
  { id: 'rear', number: '03', label: '贴肤面', meta: 'PET-FACING', image: '/images/v5/product-system/petta-pet-facing-balanced-v6.png', alt: 'PETTA 宠物项圈贴肤面与候选传感窗概念视图' },
] as const;

const logicSteps = [
  { number: '01', label: 'SENSE', title: '持续感知', copy: '面向24小时AI智能照护，探索双电池热插拔与连续供电，尽量减少换电时的感知中断，持续记录活动、休息等状态，为理解全天变化提供依据。', image: '/images/v5/logic/logic-sense-system-v2.png', alt: '暖色居家环境中的 PETTA 概念项圈背部感知系统近景，展示密封感知区域与低轮廓编织结构' },
  { number: '02', label: 'NOTICE', title: '注意变化', copy: '尝试从长期日常节奏中找到与平时不同、值得继续留意的变化，而不是依赖一次孤立的数据。', image: '/images/v5/logic/logic-notice-golden-walk-v1.webp', staticImage: '/images/v5/logic/logic-notice-golden-poster-v1.webp', alt: '金毛犬佩戴 PETTA 概念项圈，在明亮温暖的家中自然走动' },
  { number: '03', label: 'EXPLAIN', title: '解释提醒', copy: '把复杂信息转成清楚的状态说明与观察提示，让主人知道下一步可以继续确认什么。', image: '/images/v5/logic/logic-explain-phone-diary-static-v3.png', alt: '宠物主人在暖色居家空间中用手机查看宠物日记，金毛犬在背景中休息' },
];

const companionFeatures = [
  { id: 'baseline', icon: 'pulse', title: '随时看见它的日常', copy: '持续整理活动、休息与其他候选状态，让你不在身边时，也能快速了解它今天过得怎么样。' },
  { id: 'trend', icon: 'sun', title: '读懂宠物的生活节奏', copy: '从每只宠物独有的日常习惯出发，逐步建立个体基线，不再只用一次数据或通用平均值判断状态。' },
  { id: 'explain', icon: 'target', title: '值得留意的变化，及时告诉你', copy: '当活动与休息节奏出现异常变化时，PETTA 会通过清晰的状态提醒，帮助你及时确认它的近况。' },
  { id: 'diary', icon: 'diary', title: '让宠物日记替它说给你听', copy: '把复杂的候选状态信息整理成宠物口吻的日常近况，让原本难懂的数据也能被轻松理解。' },
  { id: 'wear', icon: 'modules', title: '为长期陪伴保留舒适与个性', copy: '探索更适合日常佩戴的低轮廓结构与可替换创意外观，让长期陪伴兼顾舒适、审美与独特表达。' },
] as const;

const diaryScenes = [
  {
    id: 'today', number: '01', label: '今日状态 · 宠物日记',
    title: '今天过得怎么样，一眼就懂',
    titleLines: ['今天过得怎么样，', '一眼就懂'],
    copy: '查看活动与休息状态，用一篇宠物日记，了解你不在身边时，它的一天。',
    facts: ['今日状态', '宠物日记'],
    image: '/images/v5/diary-panels-v2/01-today-diary-clean-v3.png',
    alt: 'PETTA 今日状态与宠物日记未来交互概念图，展示佩戴概念项圈的犬只、今日状态卡片与宠物口吻日记',
  },
  {
    id: 'context', number: '02', label: '一周趋势 · 观察提示',
    title: '它的小变化，值得多一点留意',
    titleLines: ['它的小变化，', '值得多一点留意'],
    copy: '对比近七天的活动与休息，发现与平时不同的变化，知道接下来该关注什么。',
    facts: ['一周趋势', '观察提示'],
    image: '/images/v5/diary-panels-v2/02-weekly-observation.png',
    alt: 'PETTA 近七天趋势与观察建议未来交互概念图，展示宠物主人陪伴犬只、趋势曲线与观察提示',
  },
  {
    id: 'alerts', number: '03', label: '每周回顾 · 行为确认 · 提醒记录',
    title: '多一点日常记录，更懂它一点',
    titleLines: ['多一点日常记录，', '更懂它一点'],
    copy: '回顾一周变化，补充吃饭、饮水与玩耍记录，再查看提醒，把数据与它的日常联系起来。',
    facts: ['每周回顾', '行为确认', '提醒记录'],
    image: '/images/v5/diary-panels-v2/03-ui-overview-golden-v2.png',
    alt: 'PETTA 三套未来交互界面组合图，依次展示一周回顾、行为确认与提醒记录',
  },
];

const visionStories = [
  { number: '01', label: '经常出差 · 区域经理', title: '“一出差就是一周。最难受的不是看不见它，而是不知道它今天到底好不好。”', copy: '希望离家时能看到一句清楚的近况，不必反复盯着屏幕，也不用把每次安静都想成意外。', image: '/images/v5/vision/frequent-traveler-interview-v2.png', alt: 'AI 生成的区域经理在机场休息区接受模拟访谈' },
  { number: '02', label: '都市上班族', title: '“它自己在家的时候，我总怕突然出点什么事。下班路上只想快一点回去。”', copy: '想知道它今天是不是和平常一样，也希望真正有变化时，得到克制而容易理解的说明。', image: '/images/v5/vision/urban-worker-interview-v2.png', alt: 'AI 生成的都市上班族在城市咖啡馆接受模拟访谈' },
  { number: '03', label: '年轻情侣', title: '“我们都在上班。等到它明显不舒服才发现，常常已经分不清是情绪还是健康问题。”', copy: '两个人都不在家时，希望有人替他们留意日常节奏，但任何提示仍需要现场观察与专业判断。', image: '/images/v5/vision/young-couple-interview-v2.png', alt: 'AI 生成的年轻情侣在家中接受模拟访谈' },
  { number: '04', label: '大学生', title: '“我不在家，爸妈只会看它吃没吃饭。真有变化没人看得懂，也怕一生病就拖成大问题。”', copy: '希望家人能先看懂简单的状态说明，在需要时早点确认情况，而不是等问题变得明显才开始着急。', image: '/images/v5/vision/student-interview-v2.png', alt: 'AI 生成的大学生在校园学习空间接受模拟访谈' },
];

const diyOptions = [
  { src: '/images/v5/diy-masterworks-transparent-v6/03-confetti-loop-v4-cutout.png', label: '彩点漫游', series: 'seasons', seriesLabel: '四季漫游', season: 'SPRING / 春', copy: '带着抒情抽象的轻快与自由，让它的好奇心多一点春意，陪你把寻常散步走出新鲜趣味。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/05-cloud-sky-v5-cutout.png', label: '云上散步', series: 'seasons', seriesLabel: '四季漫游', season: 'SUMMER / 夏', copy: '带着马格利特式的超现实浪漫，让它天马行空的小个性，陪你把日常散步变成夏日奇遇。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/01-still-life-fruit-v5-cutout.png', label: '丰收果园', series: 'seasons', seriesLabel: '四季漫游', season: 'AUTUMN / 秋', copy: '延续塞尚后印象派的丰盈与暖意，衬出它亲切而踏实的气质，让每一次靠近都有家的温度。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/04-ink-landscape-v2-cutout.png', label: '流墨山影', series: 'seasons', seriesLabel: '四季漫游', season: 'WINTER / 冬', copy: '水墨留白的从容，衬出它安静而独立的气质。冬日里，一起慢慢走，也是一种温暖的默契。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/01-starry-nocturne-v2-cutout.png', label: '星夜旋律', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 01', copy: '梵高式后印象派的热烈，衬出它鲜活而热情的个性，让与你相伴的每个夜晚，都多一点浪漫。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/02-metaphysical-plaza-v5-cutout.png', label: '日落广场', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 02', copy: '形而上绘画的静谧，留给它一点独特的小世界，也留给你们一份不必时时热闹的陪伴。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/03-chromatic-architecture-v2-cutout.png', label: '色块秩序', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 03', copy: '蒙德里安式几何抽象的鲜明与利落，让它自有主张的个性被看见，也与你的审美恰好合拍。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/03-melting-time-v5-cutout.png', label: '柔软时刻', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 04', copy: '达利式超现实主义的奇想，让时间也变得柔软。和它多待一会儿，让陪伴暂时没有日程。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/04-quiet-bottles-v5-cutout.png', label: '静物之间', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 05', copy: '莫兰迪式静物美学的温柔与克制，衬出它低调耐看的气质，让安静相伴，也成为心动的日常。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/05-chromatic-gesture-v2-cutout.png', label: '跃动色迹', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 06', copy: '抽象表现主义的自由与奔放，为它不拘一格的个性喝彩，陪你跑出日常，尽兴玩在一起。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/06-yellow-black-optical-v5-cutout.png', label: '黄黑幻律', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 07', copy: '草间弥生式波点的大胆与趣味，衬出它活泼又古灵精怪的一面，让每次出门都有快乐的同频。' },
  { src: '/images/v5/diy-masterworks-transparent-v6/07-gold-mosaic-embrace-v5-cutout.png', label: '金色拥抱', series: 'art', seriesLabel: '艺术灵感', season: 'ART INSPIRED / 08', copy: '克里姆特装饰美学的华丽与温情，让它成为你身边耀眼的小主角，也让每次拥抱多一点仪式感。' },
];

const diySeries = [
  { id: 'seasons', label: '四季漫游', meta: 'FOUR SEASONS', start: 0 },
  { id: 'art', label: '艺术灵感', meta: 'ART INSPIRED', start: 4 },
];

function RevealText({ children, className = '' }: { children: string; className?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const letters = useMemo(() => Array.from(children), [children]);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.32 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className={`v5-reveal ${visible ? 'is-visible' : ''} ${className}`} aria-label={children}>
    {letters.map((letter, index) => <span aria-hidden="true" className="v5-reveal-letter" key={`${letter}-${index}`} style={{ '--letter-index': index } as CSSProperties}>{letter === ' ' ? '\u00a0' : letter}</span>)}
  </span>;
}

function SectionTitle({ lines }: { lines: string[] }) {
  return <>{lines.map((line) => <span className="v5-title-line" key={line}><RevealText>{line}</RevealText></span>)}</>;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <img className={`v5-brand-logo ${compact ? 'is-compact' : ''}`} src="/images/v5/petta-logo-mark-v1.png" alt="PETTA" />;
}

function CompanionIcon({ name }: { name: (typeof companionFeatures)[number]['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'pulse') return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M24 40S8 31.2 8 19.5C8 13.7 12.2 10 17.2 10c3.2 0 5.6 1.8 6.8 4.1C25.2 11.8 27.6 10 30.8 10c5 0 9.2 3.7 9.2 9.5C40 31.2 24 40 24 40Z" /><path {...common} d="M14 24h6l2.4-4.5 4 9 2.6-4.5h5" /></svg>;
  if (name === 'sun') return <svg viewBox="0 0 48 48" aria-hidden="true"><rect {...common} x="7" y="9" width="34" height="30" rx="6" /><path {...common} d="m13 31 7-7 6 5 9-11" /></svg>;
  if (name === 'target') return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M10 12.5h28a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H23l-9 5v-5h-4a4 4 0 0 1-4-4v-15a4 4 0 0 1 4-4Z" /><path {...common} d="M17 24h.1M24 24h.1M31 24h.1" /></svg>;
  if (name === 'diary') return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M11 8h25a4 4 0 0 1 4 4v28H15a4 4 0 0 1-4-4V8Z" /><path {...common} d="M15 8v32M21 17h12M21 24h12M21 31h8" /></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path {...common} d="M8 11v13.5L25.5 42 42 25.5 24.5 8H11a3 3 0 0 0-3 3Z" /><circle {...common} cx="17" cy="17" r="3" /></svg>;
}

export default function V5Preview() {
  const [petMotion, setPetMotion] = useState<'dog' | 'cat' | null>(null);
  const dogMotionRef = useRef<HTMLVideoElement>(null);
  const catMotionRef = useRef<HTMLVideoElement>(null);
  const [heroHeader, setHeroHeader] = useState(true);
  const [activeProductView, setActiveProductView] = useState(1);
  const [logic, setLogic] = useState(0);
  const [logicProgress, setLogicProgress] = useState(0);
  const [vision, setVision] = useState(0);
  const [visionFocused, setVisionFocused] = useState(false);
  const [visionVisible, setVisionVisible] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [activeCompanion, setActiveCompanion] = useState(0);
  const [diyIntroProgress, setDiyIntroProgress] = useState(0);
  const [diy, setDiy] = useState(0);
  const [diyProgress, setDiyProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [interview, setInterview] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [productVisible, setProductVisible] = useState(false);
  const productSectionRef = useRef<HTMLElement>(null);
  const productTrackRef = useRef<HTMLDivElement>(null);
  const productMotionRef = useRef({ hover: false, focus: false, pausedUntil: 0 });
  const logicRef = useRef<HTMLElement>(null);
  const diyIntroRef = useRef<HTMLElement>(null);
  const diyRef = useRef<HTMLElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const visionSectionRef = useRef<HTMLElement>(null);
  const validationRef = useRef<HTMLElement>(null);
  const companionFeatureRefs = useRef<Array<HTMLElement | null>>([]);
  const visionProgrammaticRef = useRef(false);
  const visionSettleTimerRef = useRef<number | null>(null);

  const selectVision = useCallback((index: number) => {
    const next = ((index % visionStories.length) + visionStories.length) % visionStories.length;
    setVision(next);
    const track = visionRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-vision-index="${next}"]`);
    if (track && card) {
      visionProgrammaticRef.current = true;
      if (visionSettleTimerRef.current !== null) window.clearTimeout(visionSettleTimerRef.current);
      const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      visionSettleTimerRef.current = window.setTimeout(() => {
        visionProgrammaticRef.current = false;
        setVision(next);
      }, reduceMotion ? 0 : 700);
    }
  }, [reduceMotion]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const videos = [
      { id: 'dog', node: dogMotionRef.current },
      { id: 'cat', node: catMotionRef.current },
    ] as const;
    videos.forEach(({ id, node }) => {
      if (!node) return;
      if (petMotion === id && !reduceMotion) {
        node.currentTime = 0;
        void node.play().catch(() => undefined);
      } else {
        node.pause();
        node.currentTime = 0;
      }
    });
  }, [petMotion, reduceMotion]);

  useEffect(() => {
    const section = visionSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisionVisible(entry.isIntersecting), { threshold: 0.45 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = productSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setProductVisible(entry.isIntersecting), { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!productVisible) return;
    selectProductView(activeProductView);
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      const motion = productMotionRef.current;
      if (!motion.focus && !motion.hover && performance.now() > motion.pausedUntil) {
        setActiveProductView((current) => {
          const next = (current + 1) % productViews.length;
          const track = productTrackRef.current;
          const card = track?.querySelector<HTMLElement>(`[data-product-view="${next}"]`);
          if (track && card) {
            const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
            track.scrollTo({ left, behavior: 'smooth' });
          }
          return next;
        });
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [productVisible, reduceMotion]);

  useEffect(() => {
    const section = validationRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setValidationVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.28 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const diary = document.querySelector<HTMLElement>('.v5-diary');
    if (!diary || reduceMotion) return;
    const panels = Array.from(diary.querySelectorAll<HTMLElement>('.v5-diary-panel'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '-10% 0px -14% 0px', threshold: 0.16 });

    diary.classList.add('is-reveal-ready');
    const frame = window.requestAnimationFrame(() => panels.forEach((panel) => observer.observe(panel)));

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      diary.classList.remove('is-reveal-ready');
      panels.forEach((panel) => panel.classList.remove('is-visible'));
    };
  }, [reduceMotion]);

  useEffect(() => {
    const items = companionFeatureRefs.current.filter((item): item is HTMLElement => Boolean(item));
    if (!items.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.featureIndex);
      if (Number.isFinite(index)) setActiveCompanion(index);
    }, { rootMargin: '-34% 0px -34% 0px', threshold: [0, 0.2, 0.5, 0.8] });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visionVisible || visionFocused || reduceMotion) return;
    const timer = window.setTimeout(() => selectVision(vision + 1), 3000);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, selectVision, vision, visionFocused, visionVisible]);

  useEffect(() => () => {
    if (visionSettleTimerRef.current !== null) window.clearTimeout(visionSettleTimerRef.current);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setHeroHeader(window.scrollY < window.innerHeight * 0.82);
        const logicSection = logicRef.current;
        if (logicSection) {
          const rect = logicSection.getBoundingClientRect();
          const distance = Math.max(1, rect.height - window.innerHeight);
          const nextProgress = Math.min(1, Math.max(0, -rect.top / distance));
          setLogicProgress(nextProgress);
          setLogic(Math.min(logicSteps.length - 1, Math.round(nextProgress * (logicSteps.length - 1))));
        }
        const diyIntroSection = diyIntroRef.current;
        if (diyIntroSection) {
          const rect = diyIntroSection.getBoundingClientRect();
          const distance = Math.max(1, rect.height - window.innerHeight);
          setDiyIntroProgress(Math.min(1, Math.max(0, -rect.top / distance)));
        }
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  function selectProductView(index: number) {
    const next = Math.min(productViews.length - 1, Math.max(0, index));
    const track = productTrackRef.current;
    const card = track?.querySelector<HTMLElement>(`[data-product-view="${next}"]`);
    productMotionRef.current.pausedUntil = performance.now() + 3200;
    setActiveProductView(next);
    if (!track || !card) return;
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function syncProductView() {
    const track = productTrackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-product-view]'));
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card) => {
      const nextDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (nextDistance < distance) { nearest = Number(card.dataset.productView ?? 0); distance = nextDistance; }
    });
    setActiveProductView(nearest);
  }

  function scrollToLogicStep(index: number) {
    const section = logicRef.current;
    if (!section) return;
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const stepProgress = index / Math.max(1, logicSteps.length - 1);
    window.scrollTo({ top: section.offsetTop + distance * stepProgress, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function selectDiy(index: number) {
    const next = Math.min(diyOptions.length - 1, Math.max(0, index));
    setDiy(next);
    setDiyProgress(next);
  }

  function submitWaitlist(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubmitted(true); }

  const diyCaptionReveal = reduceMotion ? 1 : Math.max(0, Math.min(1, 1 - Math.abs(diyProgress - diy) / 0.3));
  const diyIntroReveal = reduceMotion ? 1 : Math.min(1, Math.max(0, (diyIntroProgress - 0.16) / 0.48));
  const diyIntroExit = reduceMotion ? 0 : Math.min(1, Math.max(0, (diyIntroProgress - 0.78) / 0.22));
  const diyIntroStyle = {
    '--diy-intro-title-y': `${-diyIntroProgress * 13}vh`,
    '--diy-intro-title-opacity': 1 - diyIntroExit * 0.42,
    '--diy-intro-stage-y': `${(1 - diyIntroReveal) * 16 - diyIntroExit * 5}vh`,
    '--diy-intro-stage-opacity': diyIntroReveal * (1 - diyIntroExit * 0.2),
  } as CSSProperties;

  function syncVisionFromScroll() {
    const track = visionRef.current;
    if (!track || visionProgrammaticRef.current) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-vision-index]'));
    let nearest = 0;
    let distance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const nextDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (nextDistance < distance) { nearest = index; distance = nextDistance; }
    });
    setVision(nearest);
  }

  return <main className="v5-site">
    <header className={`v5-header ${heroHeader ? 'is-hero' : ''}`}>
      <nav className="v5-nav-primary" aria-label="主导航"><a href="#product">产品</a><a href="#logic">工作逻辑</a><a href="#diary">宠物日记</a><a href="#diy">DIY</a></nav>
      <a className="v5-brand v5-header-brand" href="#top" aria-label={`返回 ${siteConfig.brand} 首页`}><BrandMark /></a>
      <div className="v5-nav-secondary"><a className="v5-nav-action" href="#waitlist">加入 WAITLIST</a><a className="v5-menu-dots" href="#cocreate" aria-label="前往 PETTA 共创路线">{Array.from({ length: 9 }).map((_, index) => <span aria-hidden="true" key={index} />)}</a></div>
    </header>

    <section className="v5-hero" id="top">
      <div className="v5-hero-copy">
        <h1><RevealText>陪它</RevealText><br /><RevealText>更好关注宠物健康</RevealText></h1>
        <p className="v5-lead">AI宠物健康预警项圈，持续记录日常节奏，帮助你更早留意值得关注的变化。</p>
        <div className="v5-actions"><a className="v5-button" href="#product">认识 PETTA <span aria-hidden="true">↘</span></a><a className="v5-text-link" href="#waitlist">加入首批 Waitlist</a></div>
      </div>
      <div className="v5-hero-media">
        <span className="v5-sr-only">橘猫和灵缇犬佩戴 PETTA 概念项圈；猫用安全与适配仍待验证</span>
        <img className="v5-hero-image" src="/images/v5/hero-pets-head-safe-v2.png" alt="" fetchPriority="high" decoding="sync" aria-hidden="true" />
        <video ref={dogMotionRef} className={`v5-hero-motion-layer v5-dog-motion-layer ${petMotion === 'dog' && !reduceMotion ? 'is-active' : ''}`} src="/images/v5/hero-dog-tilt.webm" muted loop playsInline preload="metadata" aria-hidden="true" />
        <video ref={catMotionRef} className={`v5-hero-motion-layer v5-cat-motion-layer ${petMotion === 'cat' && !reduceMotion ? 'is-active' : ''}`} src="/images/v5/hero-cat-reach.webm" muted loop playsInline preload="metadata" aria-hidden="true" />
        <button className="v5-hotspot v5-dog-hotspot" type="button" onPointerEnter={() => setPetMotion('dog')} onPointerLeave={() => setPetMotion(null)} onFocus={() => setPetMotion('dog')} onBlur={() => setPetMotion(null)} onClick={() => setPetMotion('dog')} aria-label="让狗狗在当前画面中轻轻歪头" />
        <button className="v5-hotspot v5-cat-hotspot" type="button" onPointerEnter={() => setPetMotion('cat')} onPointerLeave={() => setPetMotion(null)} onFocus={() => setPetMotion('cat')} onBlur={() => setPetMotion(null)} onClick={() => setPetMotion('cat')} aria-label="让猫咪的爪子在当前画面中向前伸" />
        <span className="v5-hero-index">01 / FIRST CONTACT</span>
      </div>
    </section>

    <section className="v5-statement" id="story"><h2><SectionTitle lines={['它不需要成为屏幕。', '它只需要自然地陪在身边。']} /></h2></section>

    <section className="v5-product-system" id="product" aria-labelledby="product-system-title" ref={productSectionRef}>
      <div className="v5-product-system-heading">
        <p className="v5-kicker"><span /> PETTA PET COLLAR</p>
        <h2 id="product-system-title"><RevealText>PETTA 宠物项圈</RevealText></h2>
        <p>PETTA 正在探索从每只宠物自己的日常出发 让值得留意的变化拥有可以理解的参照</p>
      </div>

      <div
        className="v5-product-track"
        ref={productTrackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="PETTA 宠物项圈三个概念视图 点击任意图片或使用左右方向键切换"
        tabIndex={0}
        onScroll={syncProductView}
        onPointerEnter={() => { productMotionRef.current.hover = true; }}
        onPointerLeave={() => { productMotionRef.current.hover = false; productMotionRef.current.pausedUntil = performance.now() + 1200; }}
        onFocusCapture={() => { productMotionRef.current.focus = true; }}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { productMotionRef.current.focus = false; productMotionRef.current.pausedUntil = performance.now() + 1200; } }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); selectProductView(activeProductView + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); selectProductView(activeProductView - 1); }
        }}
      >
        {productViews.map((view, index) => <button
            type="button"
            className={`v5-product-view ${activeProductView === index ? 'is-active' : ''}`}
            data-product-view={index}
            aria-label={`显示${view.label}概念视图`}
            aria-pressed={activeProductView === index}
            onClick={() => selectProductView(index)}
            key={view.id}
          >
            <div className="v5-product-view-media">
              <img src={view.image} alt={view.alt} width="1600" height="900" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          </button>)}
      </div>

      <div className="v5-product-dots" role="tablist" aria-label="选择产品概念视图">
        {productViews.map((view, index) => <button
          type="button"
          role="tab"
          aria-label={`查看${view.label}概念视图`}
          aria-selected={activeProductView === index}
          onClick={() => selectProductView(index)}
          key={view.id}
        />)}
      </div>

      <div className="v5-product-benefits" aria-label="PETTA 宠物项圈设计方向">
        <article>
          <span>01</span>
          <h3>降低项圈存在感</h3>
          <p><span>柔和曲率与细密织物</span><span>搭配可调节项圈结构</span></p>
        </article>
        <article>
          <span>02</span>
          <h3>日常适配</h3>
          <p><span>外观上盖、硬件核心</span><span>贴肤区域与项圈带彼此分层</span><span>更换外观轻而易举</span></p>
        </article>
        <article>
          <span>03</span>
          <h3>APP 联动</h3>
          <p><span>把复杂变化转译为</span><span>容易理解的说明</span></p>
        </article>
      </div>

    </section>

    <section className="v5-logic" id="logic" ref={logicRef} aria-labelledby="logic-title">
      <div className="v5-logic-sticky">
        <div className="v5-logic-backgrounds" aria-hidden="true">{logicSteps.map((step, index) => {
          const segmentCenter = index / Math.max(1, logicSteps.length - 1);
          const shift = (logicProgress - segmentCenter) * -3;
          const backgroundImage = reduceMotion && 'staticImage' in step ? step.staticImage : step.image;
          return <figure className={logic === index ? 'is-active' : ''} key={`${step.image}-${logic === index}`}>
            {index === 1 && !reduceMotion && logic === index ? <video
              src="/images/v5/logic/logic-notice-golden-video-v1.mp4"
              poster="/images/v5/logic/logic-notice-golden-poster-v1.webp"
              autoPlay muted loop playsInline preload="metadata"
              style={{ transform: `translate3d(0, ${shift}%, 0) scale(1.07)` }}
            /> : <img src={index === 1 ? '/images/v5/logic/logic-notice-golden-poster-v1.webp' : backgroundImage} alt="" style={{ transform: index === 2 ? 'scale(1.07)' : `translate3d(0, ${shift}%, 0) scale(1.07)` }} />}
          </figure>;
        })}</div>
        <div className="v5-logic-scrim" aria-hidden="true" />
        <div className="v5-logic-layout">
          <div className="v5-logic-copy" key={logicSteps[logic].label} aria-live="polite">
            <p className="v5-kicker"><span /> SENSE · NOTICE · EXPLAIN</p>
            <p className="v5-logic-step-meta">{logicSteps[logic].number} / 03 · {logicSteps[logic].label}</p>
            <h2 id="logic-title">{logicSteps[logic].title}</h2>
            <p>{logicSteps[logic].copy}</p>
            <span className="v5-logic-scroll-hint">SCROLL TO FOLLOW THE STORY</span>
          </div>
          <div className="v5-logic-index" role="tablist" aria-label="PETTA 工作逻辑">{logicSteps.map((step, index) => <button key={step.label} type="button" role="tab" aria-selected={logic === index} aria-controls="logic-title" onClick={() => scrollToLogicStep(index)}><span aria-hidden="true" /><strong>{step.title}</strong><small>{step.number}</small></button>)}</div>
        </div>
      </div>
    </section>

    <section className="v5-app-bridge" aria-labelledby="app-bridge-title">
      <div className="v5-app-bridge-inner">
        <h2 id="app-bridge-title" className="v5-app-bridge-primary">
          <RevealText>从感知它，到读懂它。</RevealText>
        </h2>
        <h3 className="v5-app-bridge-secondary">
          <RevealText>在 PETTA App，查看它的状态、日记与变化。</RevealText>
        </h3>
      </div>
    </section>

    <section className="v5-diary" id="diary" aria-label="PETTA 宠物日记未来交互概念">
      {diaryScenes.map((scene, sceneIndex) => <article className={`v5-diary-panel scene-${scene.id}`} key={scene.id}>
        <div className="v5-diary-panel-inner">
          <div className="v5-diary-visual" aria-label={`${scene.label}视觉示意`}>
            <figure className="v5-diary-photo v5-diary-panel-art">
              <img src={scene.image} alt={scene.alt} width="1536" height="1024" loading="lazy" />
            </figure>
          </div>

          <div className="v5-diary-copy">
            <h2 id={sceneIndex === 0 ? 'diary-title' : undefined} aria-label={scene.title}>{scene.titleLines.map((line) => <span className="v5-diary-title-line" key={line}><span>{line}</span></span>)}</h2>
            <p>{scene.copy}</p>
            <div className="v5-diary-facts">{scene.facts.map((fact) => <span key={fact}>{fact}</span>)}</div>
          </div>
        </div>
      </article>)}
    </section>

    <section className="v5-diy-intro" id="diy" ref={diyIntroRef} aria-labelledby="diy-intro-title" style={diyIntroStyle}>
      <div className="v5-diy-intro-sticky">
        <div className="v5-diy-intro-heading">
          <p className="v5-kicker">DIY · ONE OF ONE</p>
          <h2 id="diy-intro-title">
            <span className="v5-title-line"><RevealText>它的独一无二</RevealText></span>
            <span className="v5-title-line"><RevealText>值得一款特别的项圈</RevealText></span>
          </h2>
        </div>

        <div className="v5-diy-intro-stage">
          <img src="/images/v5/diy-intro/three-dogs-collar-gallery-v2.png" alt="三只犬在暖白建筑空间中佩戴不同艺术风格的 PETTA 概念项圈" width="1680" height="945" loading="lazy" decoding="async" />
        </div>

        <a className="v5-diy-intro-prompt" href="#diy-collection">
          <span>今天，它是哪一派？</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v14M6.5 12.5 12 18l5.5-5.5" /></svg>
        </a>
      </div>
    </section>

    <section className="v5-diy" id="diy-collection" ref={diyRef} aria-labelledby="diy-title" tabIndex={0} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); selectDiy(diy + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); selectDiy(diy - 1); } }}>
      <div className="v5-diy-sticky">
        <div className="v5-diy-heading">
          <h2 className="v5-sr-only" id="diy-title">PETTA DIY 项圈系列</h2>
          <div className="v5-diy-series" role="tablist" aria-label="选择 DIY 项圈系列">{diySeries.map((series) => <button type="button" role="tab" aria-selected={diyOptions[diy].series === series.id} onClick={() => selectDiy(series.start)} key={series.id}><span>{series.meta}</span>{series.label}</button>)}</div>
        </div>
        <div className="v5-diy-gallery" id="diy-carousel" role="region" aria-roledescription="carousel" aria-label="完整 DIY 项圈款式；使用左右按钮、点击卡片或按左右方向键切换">
          <div className="v5-diy-cards">{diyOptions.map((option, index) => {
            const orbitOffset = index - diyProgress;
            const orbitAngle = orbitOffset * 0.72;
            const orbitDepth = Math.cos(orbitAngle);
            const orbitSide = Math.sin(orbitAngle);
            const distance = Math.abs(orbitOffset);
            const nearby = distance < 2.8;
            const interactive = distance < 1.55;
            const orbitStyle = {
              '--diy-x': `${orbitSide * 68}vw`,
              '--diy-y': `${-5 - orbitSide * 16 + (1 - orbitDepth) * 4}vh`,
              '--diy-z': `${(orbitDepth - 1) * 560}px`,
              '--diy-rotate-y': `${orbitSide * -34}deg`,
              '--diy-rotate-z': `${orbitSide * 6}deg`,
              '--diy-scale': Math.max(0.42, 0.84 - Math.min(distance, 1.8) * 0.25),
              '--diy-opacity': Math.max(0, Math.min(1, 1 - distance * 0.46)),
              '--diy-blur': `${Math.min(2.8, distance * 0.85)}px`,
              '--diy-saturation': Math.max(0.5, 1 - distance * 0.2),
              zIndex: Math.round(20 + orbitDepth * 10),
            } as CSSProperties;
            return <button className={`v5-diy-card ${index === diy ? 'is-active' : ''}`} data-active={index === diy ? 'true' : 'false'} style={orbitStyle} type="button" aria-label={`查看 ${option.seriesLabel}：${option.label}`} aria-current={index === diy ? 'true' : undefined} aria-hidden={!nearby} tabIndex={interactive ? 0 : -1} onClick={() => selectDiy(index)} key={option.src}><img src={option.src} alt={index === diy ? `PETTA 完整 DIY 项圈概念款：${option.label}` : ''} width="1536" height="1024" loading={index < 2 ? 'eager' : 'lazy'} decoding="async" /></button>;
          })}</div>
          <div className="v5-diy-caption" style={{ '--diy-caption-reveal': diyCaptionReveal, '--diy-caption-y': `${(1 - diyCaptionReveal) * 18}px` } as CSSProperties} aria-live="polite" aria-atomic="true"><p><span>{String(diy + 1).padStart(2, '0')}</span>{diyOptions[diy].seriesLabel} · {diyOptions[diy].season}</p><h3>{diyOptions[diy].label}</h3><p>{diyOptions[diy].copy}</p></div>
        </div>
        <div className="v5-diy-footer">
          <a href="#waitlist" onClick={() => setSubmitted(false)}>保存这个偏好到 Waitlist <span aria-hidden="true">→</span></a>
          <div className="v5-diy-nav" aria-label="切换 DIY 项圈款式">
            <button type="button" aria-label="上一款项圈" aria-controls="diy-carousel" disabled={diy === 0} onClick={() => selectDiy(diy - 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg></button>
            <button type="button" aria-label="下一款项圈" aria-controls="diy-carousel" disabled={diy === diyOptions.length - 1} onClick={() => selectDiy(diy + 1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6" /></svg></button>
          </div>
        </div>
      </div>
    </section>

    <section className={`v5-validation v5-shell ${validationVisible ? 'is-visible' : ''}`} id="cocreate" aria-labelledby="validation-title" ref={validationRef}>
      <div className="v5-validation-copy">
        <h2 id="validation-title"><SectionTitle lines={['早一点发现', '就多一次挽救家人的机会']} /></h2>
        <p>我们希望通过对日常节奏的持续理解，让值得留意的变化更早被看见。这不是寿命承诺，也不构成诊断，而是为更长久的陪伴多做一点准备。</p>
      </div>
      <div className="v5-companion-features" aria-label="PETTA 正在探索的陪伴方向">
        {companionFeatures.map((feature, index) => <article className={activeCompanion === index ? 'is-active' : ''} data-feature-index={index} ref={(node) => { companionFeatureRefs.current[index] = node; }} key={feature.id}>
          <span className="v5-companion-icon"><CompanionIcon name={feature.icon} /></span>
          <div><h3>{feature.title}</h3><p>{feature.copy}</p></div>
        </article>)}
      </div>
    </section>

    <section className="v5-vision" id="vision" aria-labelledby="vision-title" ref={visionSectionRef} data-autoplay-visible={visionVisible} data-reduced-motion={reduceMotion} onFocusCapture={() => setVisionFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setVisionFocused(false); }}>
      <div className="v5-vision-heading"><h2 id="vision-title"><SectionTitle lines={['不在它身边的时间里，', '也能少一些焦虑和担心。']} /></h2></div>
      <div className="v5-vision-track" ref={visionRef} onScroll={syncVisionFromScroll} tabIndex={0} role="region" aria-label="PETTA 未来陪伴场景，可横向滑动或使用左右方向键浏览" onKeyDown={(event) => { if (event.key === 'ArrowRight') selectVision(vision + 1); if (event.key === 'ArrowLeft') selectVision(vision - 1); }}>
        {visionStories.map((story, index) => <article className={`v5-vision-card ${vision === index ? 'is-active' : ''}`} data-vision-index={index} aria-current={vision === index ? 'true' : undefined} role="button" tabIndex={0} aria-label={`查看第 ${index + 1} 位愿景人物：${story.label}`} onClick={() => selectVision(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectVision(index); } }} key={story.number}><figure><img src={story.image} alt={story.alt} loading="lazy" decoding="async" /></figure><div><p><span>{story.number}</span>{story.label}</p><h3>{story.title}</h3><p>{story.copy}</p></div></article>)}
      </div>
      <div className="v5-vision-controls">
        <div className="v5-vision-progress" aria-hidden="true">{visionStories.map((story, index) => <span className={vision === index ? 'is-active' : ''} key={story.number}><i /></span>)}</div>
        <span className="v5-vision-count" aria-live="polite">{String(vision + 1).padStart(2, '0')} / {String(visionStories.length).padStart(2, '0')}</span>
      </div>
    </section>

    <section className="v5-waitlist v5-shell" id="waitlist" aria-labelledby="waitlist-title"><div className="v5-waitlist-copy"><p className="v5-kicker"><span /> PETTA EARLY COMMUNITY</p><h2 id="waitlist-title"><SectionTitle lines={['加入 PETTA', '首批共创名单。']} /></h2><p>告诉我们你和宠物的真实需要。你的选择会帮助 PETTA 判断第一版应该优先完成什么。</p></div><div className="v5-form-panel">{submitted ? <div className="v5-success" role="status"><span aria-hidden="true">✓</span><h3>偏好预览已完成</h3><p>这个本地版本不会保存或发送你的信息。正式 Waitlist 开放后，你可以再次提交并加入共创名单。</p><button type="button" onClick={() => setSubmitted(false)}>返回表单</button></div> : <form onSubmit={submitWaitlist}><label>怎么称呼你？<input required name="name" autoComplete="name" placeholder="例如：Momo 的家人" /></label><label>联系方式<input required name="contact" autoComplete="email" placeholder="name@example.com" /></label><div className="v5-field-row"><label>你的伙伴<select name="pet" defaultValue="dog"><option value="dog">狗狗</option><option value="cat">猫咪</option><option value="both">猫狗都有</option></select></label><label>它的体型<select name="size" defaultValue="medium"><option value="small">小型</option><option value="medium">中型</option><option value="large">大型</option><option value="unknown">暂不确定</option></select></label></div><label>最期待的方向<select name="interest" defaultValue="diary"><option value="change">注意变化</option><option value="reassurance">离家时的安心感</option><option value="diary">宠物日记</option><option value="comfort">佩戴舒适</option><option value="diy">DIY 外观</option></select></label><div className="v5-field-row"><label>喜欢的 DIY 上盖<select name="diy" value={diy} onChange={(event) => setDiy(Number(event.target.value))}>{diyOptions.map((option, index) => <option value={index} key={option.src}>{option.label}</option>)}</select></label><label>可接受价格区间<select name="price" defaultValue="consider"><option value="consider">了解后再决定</option><option value="under500">500 元以内</option><option value="500to999">500–999 元</option><option value="over1000">1000 元以上</option></select></label></div><label>还有什么想告诉我们？<textarea name="message" rows={3} placeholder="佩戴、外观、宠物日记……" /></label><label className="v5-check"><input type="checkbox" name="interview" checked={interview} onChange={(event) => setInterview(event.target.checked)} />愿意参加后续访谈或试戴</label><button type="submit" className="v5-button">加入 Waitlist <span aria-hidden="true">→</span></button><small>当前为表单体验预览，暂不保存或发送信息。</small></form>}</div></section>

    <footer className="v5-footer"><a className="v5-brand" href="#top" aria-label="返回 PETTA 首页"><BrandMark /></a><p>For every day. For every version of them.</p><p>本网站展示的健康感知、状态说明与宠物日记均为研发方向或未来交互概念，不构成诊断或医疗建议，也不能替代专业兽医。</p><a href="#top">回到顶部 ↑</a></footer>
  </main>;
}
