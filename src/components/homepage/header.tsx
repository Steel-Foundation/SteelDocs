import { ArrowDown, CookingPot } from 'lucide-react';

const glassStyle = {
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
};

const Pill = ({ text }: { text: string }) => (
  <div
    className="text-black dark:text-white w-auto px-4 h-8.5 flex justify-center items-center rounded-[50px] font-medium text-xs md:text-sm bg-black/5 border border-black/10 dark:bg-white/5 dark:border-white/10"
    style={glassStyle}
  >
    <CookingPot className="w-4 h-4" />
    <span className="ml-1">{text}</span>
  </div>
);

const Headline = ({ subtitle }: { subtitle: string }) => (
  <>
    <h1
      className="mt-4 text-black dark:text-white text-center leading-[1.2] -tracking-[2px] max-w-[16ch] font-minecraft text-7xl"
    >
      Steel<span className="text-teal-600 dark:text-teal-400 font-bold italic">MC</span>
    </h1>

    <h2 className='text-gray-700 dark:text-white max-w-150 text-center'>
      {subtitle}
    </h2>
  </>
);

const Actions = ({ mainCtaText, secondCtaText }: { mainCtaText: string; secondCtaText: string }) => (
  <div className="flex gap-4 mt-8 items-center pointer-events-auto">
    {/* Main CTA */}
    <a
      className="px-6 md:px-8 py-2 font-minecraft font-bold bg-black text-white dark:bg-white dark:text-black rounded-[50px] text-xs md:text-sm border-none cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 hover:-translate-y-px transition-all duration-200 ease-out"
      href="#join-us"
    >
      {mainCtaText}
    </a>

    {/* Second CTA */}
    <a
      className="px-6 md:px-8 py-2 font-minecraft font-bold rounded-[50px] text-xs md:text-sm bg-black/5 border border-black/10 text-black/80 dark:bg-white/5 dark:border-white/10 dark:text-white/85 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 hover:-translate-y-px transition-all duration-200 ease-out"
      style={glassStyle}
      href="/SteelDocs/guides/getting-started/introduction/"
    >
      {secondCtaText}
    </a>
  </div>
);

interface HeaderProps {
  pillText: string;
  subtitle: string;
  mainCtaText: string;
  secondCtaText: string;
}

const BackgroundContent = ({
  pillText,
  subtitle,
  mainCtaText,
  secondCtaText
}: HeaderProps) => {

  return (
    <div className="relative w-full h-full overflow-hidden">

      <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full z-1">
        <Pill text={pillText} />
        <Headline subtitle={subtitle} />
        <Actions mainCtaText={mainCtaText} secondCtaText={secondCtaText} />
        <a href="#arrow" id="arrow"><ArrowDown className="w-10 h-10 p-2 mt-16 text-black dark:text-white animate-bounce bg-black/20 dark:bg-white/30 rounded-full" /></a>
      </div>
    </div>
  );
};

export default BackgroundContent;