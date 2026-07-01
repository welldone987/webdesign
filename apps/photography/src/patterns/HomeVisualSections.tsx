import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { motion, useInView, useScroll, useSpring, useTransform } from 'framer-motion';
import { getThemeDisplayLabels } from '../data/themeLabels.ts';
import { themeAccents } from '../data/themes.ts';
import { getPreviewHeight, getPreviewSrc, getPreviewWidth } from '../lib/photos.ts';
import type { Photo, ThemeSummary } from '../types/photography.ts';

type HomeVisualSectionsProps = {
  photos: Photo[];
  themes: ThemeSummary[];
  prefersReducedMotion: boolean;
  onOpenThemeGallery: (themeSlug: string) => void;
};

type ThemeArchiveItem = {
  theme: ThemeSummary;
  cover: Photo;
  peek: Photo;
  label: string;
};

const ribbonTexts = [
  'LEONARDO DA VINCI CONSIDERED ART A WAY OF STUDYING THE SEEN WORLD, WHERE PATIENCE, OBSERVATION, AND THE HAND LEARN TO THINK TOGETHER /',
  'SUSAN SONTAG WROTE ABOUT PHOTOGRAPHS AS FRAGMENTS OF EXPERIENCE, OBJECTS THAT BOTH PRESERVE AND TRANSFORM MEMORY /',
  'JOHN BERGER TREATED SEEING AS A RELATIONSHIP BETWEEN IMAGE, HISTORY, AND POWER, REMINDING US THAT EVERY PHOTOGRAPH IS ALSO A CHOICE /',
  'GEORGIA OKEEFFE INSISTED ON SLOW ATTENTION, UNTIL ORDINARY FORMS BECAME INTIMATE MONUMENTS OF COLOR, SILENCE, AND SCALE /',
  'ROLAND BARTHES DESCRIBED THE PHOTOGRAPH AS A MEETING OF TIME AND WOUND, WHERE AN UNEXPECTED DETAIL CAN PUNCTURE MEMORY /',
  'AGNES MARTIN PURSUED QUIETNESS, ORDER, AND INNER FEELING THROUGH RESTRAINT, REPETITION, LIGHT PRESSURE, AND A HUMBLE LINE /',
];

const zineTransforms = [
  'translate(-50%, -50%) rotateY(0deg) translateZ(300px) rotateZ(-7deg)',
  'translate(-50%, -50%) rotateY(30deg) translateZ(300px) translateY(-56px) rotateZ(8deg)',
  'translate(-50%, -50%) rotateY(60deg) translateZ(300px) translateY(42px) rotateZ(-3deg)',
  'translate(-50%, -50%) rotateY(90deg) translateZ(300px) translateY(-22px) rotateZ(9deg)',
  'translate(-50%, -50%) rotateY(120deg) translateZ(300px) translateY(64px) rotateZ(-9deg)',
  'translate(-50%, -50%) rotateY(150deg) translateZ(300px) translateY(-42px) rotateZ(4deg)',
  'translate(-50%, -50%) rotateY(180deg) translateZ(300px) translateY(36px) rotateZ(10deg)',
  'translate(-50%, -50%) rotateY(210deg) translateZ(300px) translateY(-68px) rotateZ(-5deg)',
  'translate(-50%, -50%) rotateY(240deg) translateZ(300px) translateY(54px) rotateZ(6deg)',
  'translate(-50%, -50%) rotateY(270deg) translateZ(300px) translateY(-28px) rotateZ(-11deg)',
  'translate(-50%, -50%) rotateY(300deg) translateZ(300px) translateY(18px) rotateZ(3deg)',
  'translate(-50%, -50%) rotateY(330deg) translateZ(300px) translateY(-84px) rotateZ(12deg)',
];

export function HomeVisualSections({ photos, themes, prefersReducedMotion, onOpenThemeGallery }: HomeVisualSectionsProps) {
  const archiveItems = useMemo(() => buildArchiveItems(photos, themes), [photos, themes]);
  const zinePhotos = useMemo(() => buildZinePhotos(photos), [photos]);

  return (
    <>
      <HomeScrollLab prefersReducedMotion={prefersReducedMotion} />
      <HomeThemeArchive
        items={archiveItems}
        onOpenThemeGallery={onOpenThemeGallery}
        prefersReducedMotion={prefersReducedMotion}
      />
      <HomeZinePreview photos={zinePhotos} prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}

function HomeScrollLab({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.22,
  });

  return (
    <section
      className="relative min-h-[760px] overflow-hidden border-b border-black/14 bg-white sm:min-h-[860px] lg:min-h-[min(900px,96vh)]"
      ref={sectionRef}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0_14%,rgba(7,27,47,0.14)_14%_calc(14%+1px),transparent_calc(14%+1px)_28%),repeating-linear-gradient(to_bottom,transparent_0_132px,rgba(7,27,47,0.14)_132px_133px)]"
      />
      <p className="relative z-[3] px-4 pt-7 text-base text-[#071b2f]/62 sm:absolute sm:left-8 sm:top-8 sm:p-0 sm:text-lg lg:left-14">
        Scroll / 01
      </p>
      <div className="relative z-[2] grid min-h-[inherit] gap-8 px-4 pb-14 pt-8 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,0.94fr)_minmax(320px,1fr)] lg:items-center lg:gap-16 lg:px-14 lg:pb-16">
        <div className="grid gap-0 sm:gap-1">
          {[
            ['WHEN WHEN WHEN WHEN WHEN WHEN WHEN WHEN WHEN WHEN WHEN WHEN', -52, 4],
            ['IT COMES IT COMES IT COMES IT COMES IT COMES IT COMES IT COMES', 6, -42],
            ['TO LIGHT TO LIGHT TO LIGHT TO LIGHT TO LIGHT TO LIGHT TO LIGHT', -48, 8],
          ].map(([text, from, to], index) => (
            <ScrollLabLine
              from={Number(from)}
              index={index}
              key={`${text}-${index}`}
              prefersReducedMotion={prefersReducedMotion}
              progress={smoothProgress}
              text={String(text)}
              to={Number(to)}
            />
          ))}
        </div>
        <div className="relative min-h-[360px] sm:min-h-[520px] lg:min-h-[640px]">
          <LightStudySvg prefersReducedMotion={prefersReducedMotion} />
          <div className="font-serif absolute bottom-5 right-0 w-[min(350px,82vw)] border-2 border-[#071b2f]/35 bg-white p-4 text-[#071b2f] shadow-[0_28px_86px_rgba(7,27,47,0.22)] sm:bottom-8 sm:right-[8%] sm:p-5">
            <strong className="block text-4xl font-semibold leading-[0.9] sm:text-5xl">关于网站：</strong>
            <span className="mt-5 block text-base leading-7 sm:text-lg sm:leading-8">
              nothing的小站，记录光影，分享回忆，学习设计与美
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

type ScrollLabLineProps = {
  text: string;
  from: number;
  to: number;
  index: number;
  progress: ReturnType<typeof useSpring>;
  prefersReducedMotion: boolean;
};

function ScrollLabLine({ text, from, to, index, progress, prefersReducedMotion }: ScrollLabLineProps) {
  const x = useTransform(progress, [0, 1], [`${from}%`, `${to}%`]);

  return (
    <div className="relative h-[clamp(74px,10vw,146px)] overflow-hidden border-t border-[#071b2f]/18 last:border-b">
      <motion.span
        className="font-serif absolute top-1/2 block whitespace-nowrap text-[clamp(70px,11vw,168px)] font-semibold uppercase leading-[0.9] will-change-transform"
        style={{ x: prefersReducedMotion ? 0 : x, y: '-45%' }}
      >
        {index % 2 === 0 ? text : `${text} ${text}`}
      </motion.span>
    </div>
  );
}

function LightStudySvg({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const dashTransition = prefersReducedMotion ? undefined : ({ duration: 14, ease: 'linear', repeat: Infinity } as const);
  const pulseTransition = prefersReducedMotion ? undefined : ({ duration: 4, ease: 'easeInOut', repeat: Infinity } as const);

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 640" role="img" aria-label="光线与构图的动态练习图">
      <rect x="58" y="80" width="232" height="146" fill="#d7e4e9" />
      <rect x="342" y="356" width="190" height="156" fill="#ebd7bf" />
      <rect x="108" y="378" width="148" height="110" fill="#dee7d2" />
      <g fill="none" stroke="#071b2f" strokeWidth="1">
        <path d="M88 112 C212 42 372 80 498 190 C590 270 592 420 512 512 C412 618 214 570 126 444 C44 326 18 188 88 112Z" />
        {[
          'M74 340 C180 230 318 214 438 286 C542 348 570 464 506 544',
          'M98 252 C236 338 364 354 536 280',
          'M132 188 C284 136 430 180 558 318',
          'M118 468 C264 528 430 512 574 388',
        ].map((d) => (
          <motion.path
            animate={prefersReducedMotion ? undefined : { strokeDashoffset: -240 }}
            d={d}
            key={d}
            strokeDasharray="8 12"
            transition={dashTransition}
          />
        ))}
        <line x1="42" x2="604" y1="318" y2="318" />
        <line x1="318" x2="318" y1="42" y2="604" />
        <line x1="154" x2="538" y1="164" y2="558" opacity=".42" />
        <line x1="88" x2="590" y1="516" y2="110" opacity=".28" />
      </g>
      <g fill="none" stroke="#071b2f" strokeWidth="1" opacity=".6">
        <rect x="438" y="96" width="86" height="86" />
        <rect x="78" y="264" width="96" height="68" />
        <path d="M220 96 h44 v44 h-44z M512 470 h54 v54 h-54z" />
      </g>
      <g fill="none" strokeWidth="7" strokeLinecap="square">
        <path d="M110 512 L252 404" stroke="#c99567" />
        <path d="M378 120 L538 204" stroke="#7f9fb0" />
        <path d="M406 498 L540 432" stroke="#8f9f76" />
        <path d="M126 152 L222 196" stroke="#8f8b84" />
        <path d="M462 566 L568 504" stroke="#c99567" />
      </g>
      {[
        [438, 286, 10, '#c99567'],
        [252, 404, 8, '#7f9fb0'],
        [524, 182, 7, '#8f9f76'],
        [174, 316, 6, '#8f8b84'],
      ].map(([cx, cy, r, fill]) => (
        <motion.circle
          animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.22, 1] }}
          cx={Number(cx)}
          cy={Number(cy)}
          fill={String(fill)}
          key={`${cx}-${cy}`}
          r={Number(r)}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
          transition={pulseTransition}
        />
      ))}
    </svg>
  );
}

function HomeThemeArchive({
  items,
  prefersReducedMotion,
  onOpenThemeGallery,
}: {
  items: ThemeArchiveItem[];
  prefersReducedMotion: boolean;
  onOpenThemeGallery: (themeSlug: string) => void;
}) {
  return (
    <section
      className="relative overflow-hidden border-b border-black/14 bg-[linear-gradient(90deg,rgba(215,228,233,0.42),transparent_38%),#fff] px-8 py-14 text-[#071b2f] sm:px-8 sm:py-20 lg:min-h-[850px] lg:px-14"
    >
      <div className="relative mx-auto max-w-[1500px]">
        <p className="mb-8 text-base sm:mb-14 sm:text-lg">Theme / 02</p>
        <div className="pointer-events-none absolute inset-x-[-80vw] top-0 z-[1] hidden h-full overflow-hidden sm:block" aria-hidden="true">
          {ribbonTexts.map((text, index) => (
            <RibbonLine
              index={index}
              key={text}
              prefersReducedMotion={prefersReducedMotion}
              text={text}
            />
          ))}
        </div>
        <div className="relative z-[5] grid gap-14 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-12 lg:ml-auto lg:max-w-[820px]">
          {items.map((item, index) => (
            <ArchiveCard
              index={index}
              item={item}
              key={item.theme.slug}
              onOpenThemeGallery={onOpenThemeGallery}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchiveCard({
  item,
  index,
  prefersReducedMotion,
  onOpenThemeGallery,
}: {
  item: ThemeArchiveItem;
  index: number;
  prefersReducedMotion: boolean;
  onOpenThemeGallery: (themeSlug: string) => void;
}) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const isScrollPreviewVisible = useInView(cardRef, {
    amount: 0.72,
    margin: '-8% 0px -30% 0px',
  });
  const folderStyle = {
    '--card-accent': (themeAccents[item.theme.slug as keyof typeof themeAccents] ?? themeAccents.apricity).accent,
    '--card-ink': '#071b2f',
  } as CSSProperties;
  const isPreviewOpen = isPreviewVisible || (isMobilePreview && isScrollPreviewVisible);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const updatePreviewMode = () => setIsMobilePreview(mediaQuery.matches);

    updatePreviewMode();
    mediaQuery.addEventListener('change', updatePreviewMode);

    return () => mediaQuery.removeEventListener('change', updatePreviewMode);
  }, []);

  return (
    <motion.button
      className="group relative z-[3] min-h-[164px] overflow-visible px-4 pb-4 pt-3 text-left text-[var(--card-ink)] outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:min-h-[214px] sm:px-6 sm:pb-6 sm:pt-5 lg:min-h-[202px] lg:px-7"
      onBlur={() => setIsPreviewVisible(false)}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 36 }}
      onClick={() => onOpenThemeGallery(item.theme.slug)}
      onFocus={() => setIsPreviewVisible(true)}
      onMouseEnter={() => setIsPreviewVisible(true)}
      onMouseLeave={() => setIsPreviewVisible(false)}
      ref={cardRef}
      style={folderStyle}
      transition={{ delay: index * 0.06, duration: 0.55, ease: 'easeOut' }}
      type="button"
      viewport={{ amount: 0.25, once: true }}
      whileHover={prefersReducedMotion ? undefined : { y: index % 2 === 0 ? 10 : -8 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: index % 2 === 0 ? 18 : 0 }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 z-0 h-[34px] w-[48%] -translate-y-[70%] rounded-tr-[14px] border border-b-0 border-[#071b2f] bg-[var(--card-accent)] [clip-path:polygon(0_0,calc(100%-28px)_0,100%_100%,0_100%)] transition-transform group-hover:-translate-y-[82%] sm:h-[50px] sm:rounded-tr-[18px]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 z-0 rounded-r-[14px] border border-[#071b2f] bg-[var(--card-accent)] shadow-[0_18px_40px_rgba(7,27,47,0.1)] sm:rounded-r-[18px]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 top-[34px] z-[2] rounded-r-[14px] border border-[#071b2f] bg-[var(--card-accent)] shadow-[0_18px_40px_rgba(7,27,47,0.08)] transition group-hover:border-[#071b2f] group-hover:shadow-[0_26px_70px_rgba(7,27,47,0.18)] sm:top-[50px] sm:rounded-r-[18px]"
      />
      <span className="relative z-[4] block pb-3 text-sm sm:text-base">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="font-serif relative z-[4] mt-6 flex items-baseline gap-3 sm:mt-7">
        <span className="text-[clamp(44px,5.8vw,98px)] font-semibold leading-[0.86]">{item.theme.name}</span>
        <span className="text-[clamp(20px,2vw,34px)] font-semibold uppercase leading-none">{item.label}</span>
      </span>
      <span className="relative z-[4] mt-5 block h-[8px] w-16 bg-[#071b2f] transition-all group-hover:w-full sm:mt-6 sm:h-[9px] sm:w-20" />
      <span className="relative z-[4] ml-auto mt-5 flex min-h-11 w-fit items-center border border-white bg-white px-4 text-sm font-semibold text-[#071b2f] shadow-[0_8px_18px_rgba(7,27,47,0.12)] transition group-hover:bg-[#071b2f] group-hover:text-white">
        进入 &gt;
      </span>
      <span className="pointer-events-none absolute left-[18%] top-0 z-[1] block h-[168px] w-[130px] -translate-x-[16%] -translate-y-[22%] sm:h-[202px] sm:w-[156px] lg:h-[246px] lg:w-[190px] lg:-translate-y-[26%]" aria-hidden="true">
        {[item.cover, item.peek].map((photo, photoIndex) => (
          <span
            className={`absolute inset-0 border-[7px] border-white bg-white shadow-[0_20px_44px_rgba(7,27,47,0.2)] transition duration-500 ${
              isPreviewOpen ? 'opacity-100' : 'opacity-0'
            } ${
              photoIndex === 0
                ? isPreviewOpen
                  ? 'translate-x-1 -translate-y-16 rotate-[-11deg] scale-[0.84] lg:-translate-y-24 lg:scale-100'
                  : 'translate-y-7 rotate-[-2deg] scale-[0.78]'
                : isPreviewOpen
                  ? 'translate-x-20 -translate-y-14 rotate-[9deg] scale-[0.82] lg:translate-x-[120px] lg:-translate-y-[84px] lg:scale-[0.96]'
                  : 'translate-y-8 rotate-3 scale-[0.76]'
            }`}
            key={`${photo.slug ?? photo.src}-${photoIndex}`}
          >
            <img
              alt=""
              className="h-full w-full object-cover"
              decoding="async"
              height={getPreviewHeight(photo)}
              loading="lazy"
              src={getPreviewSrc(photo)}
              width={getPreviewWidth(photo)}
            />
          </span>
        ))}
      </span>
    </motion.button>
  );
}

function HomeZinePreview({ photos, prefersReducedMotion }: { photos: Photo[]; prefersReducedMotion: boolean }) {
  const zineRef = useRef<HTMLElement>(null);
  const isZineInView = useInView(zineRef, { amount: 0.18, margin: '18% 0px 18% 0px' });

  return (
    <section
      className="relative grid min-h-[720px] items-center gap-8 overflow-hidden border-b border-black/14 bg-[radial-gradient(circle_at_76%_46%,rgba(235,215,191,0.62),transparent_34%),radial-gradient(circle_at_90%_70%,rgba(215,228,233,0.9),transparent_28%),#fff] px-4 py-16 text-[#071b2f] [content-visibility:auto] [contain-intrinsic-size:860px] sm:px-8 lg:min-h-[860px] lg:grid-cols-[minmax(0,0.46fr)_minmax(520px,1fr)] lg:px-14 lg:py-24"
      ref={zineRef}
    >
      <div className="relative z-[6]">
        <p className="mb-7 text-base text-[#071b2f]/62 sm:text-lg">Zine / 03</p>
        <h2 className="font-serif text-[clamp(62px,8.4vw,142px)] font-semibold uppercase leading-[0.88]">
          Zine
          <br />
          Coming Soon
        </h2>
        <span className="font-serif mt-7 block text-left text-[clamp(28px,3.2vw,54px)] font-semibold leading-tight">
          待更新 ZINE
          <br />
          萃取中...
        </span>
      </div>
      <div className="relative hidden h-[clamp(500px,58vw,720px)] [perspective-origin:50%_48%] [perspective:1120px] lg:block" aria-label="ZINE 照片轨道预览">
        <div
          className="absolute left-1/2 top-1/2 h-[min(24vw,250px)] w-[min(74vw,760px)] rounded-[50%] border border-[#071b2f]/16"
          style={{ transform: 'translate(-50%, -50%) rotateX(68deg)' }}
        />
        <motion.div
          animate={prefersReducedMotion || !isZineInView ? { rotateX: -8, rotateY: 0 } : { rotateX: -8, rotateY: -360 }}
          className="absolute inset-0 m-auto h-[min(74vw,760px)] w-[min(74vw,760px)] [transform-style:preserve-3d]"
          initial={{ rotateX: -8, rotateY: 0 }}
          transition={
            prefersReducedMotion || !isZineInView
              ? { duration: 0.28, ease: 'easeOut' }
              : { duration: 20, ease: 'linear', repeat: Infinity }
          }
        >
          {photos.slice(0, 12).map((photo, index) => (
            <div
              className="absolute left-1/2 top-1/2 h-[clamp(132px,15vw,214px)] w-[clamp(92px,11vw,150px)] overflow-hidden border border-[#071b2f]/18 bg-white shadow-[0_22px_50px_rgba(7,27,47,0.18)] [backface-visibility:hidden]"
              key={photo.slug ?? photo.src}
              style={{ transform: zineTransforms[index] }}
            >
              <img
                alt=""
                className="h-full w-full object-cover"
                decoding="async"
                height={getPreviewHeight(photo)}
                loading="lazy"
                src={getPreviewSrc(photo)}
                width={getPreviewWidth(photo)}
              />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:hidden" aria-label="ZINE 移动端照片预览">
        {photos.slice(0, 9).map((photo, index) => (
          <img
            alt=""
            className="aspect-[3/4] w-full border border-[#071b2f]/16 object-cover shadow-[0_12px_26px_rgba(7,27,47,0.12)]"
            decoding="async"
            height={getPreviewHeight(photo)}
            key={photo.slug ?? photo.src}
            loading="lazy"
            src={getPreviewSrc(photo)}
            style={{ transform: `translateY(${(index % 3) * 10}px)` }}
            width={getPreviewWidth(photo)}
          />
        ))}
      </div>
    </section>
  );
}

function RibbonLine({
  text,
  index,
  prefersReducedMotion,
}: {
  text: string;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const dir = index % 2 === 0 ? -1 : 1;
  const speed = 180 + index * 24;
  const top = 104 + index * 94;
  const rotate = index % 2 === 0 ? 4 : -4;
  const ribbonStyle = {
    '--ribbon-from': `${dir * speed}px`,
    '--ribbon-to': `${dir * -speed}px`,
    '--ribbon-duration': `${18 + index * 2}s`,
    top,
    rotate: `${rotate}deg`,
  } as CSSProperties;

  return (
    <div
      className={`absolute left-[-60vw] flex w-[280vw] whitespace-nowrap font-serif text-[clamp(32px,3.6vw,74px)] font-semibold uppercase leading-none ${
        index % 2 === 0 ? 'text-[#c99567]/30' : 'text-[#071b2f]/28 mix-blend-multiply'
      }`}
      style={ribbonStyle}
    >
      <span className={prefersReducedMotion ? 'block' : 'home-ribbon-track block will-change-transform'}>
        {text.repeat(2)}
      </span>
    </div>
  );
}

function buildArchiveItems(photos: Photo[], themes: ThemeSummary[]): ThemeArchiveItem[] {
  return themes.map((theme) => {
    const themePhotos = photos.filter((photo) => photo.themeSlug === theme.slug);
    const cover = themePhotos[0] ?? theme.cover;
    const peek = themePhotos.find((photo) => photo.slug !== cover.slug) ?? cover;

    return {
      theme,
      cover,
      peek,
      label: getThemeDisplayLabels(theme.slug).english || theme.subtitle,
    };
  });
}

function buildZinePhotos(photos: Photo[]) {
  const featured = photos.filter((photo) => photo.featured);
  const mixed = [...featured, ...photos.filter((photo) => !photo.featured)];
  const seen = new Set<string>();

  return mixed.filter((photo) => {
    const key = photo.slug ?? photo.src;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
