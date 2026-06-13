import { motion } from 'motion/react';
import { Award, Building2, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function RecommendedServicesPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'business'>('business');

  useEffect(() => {
    // Carousel functionality
    const initCarousel = (carouselId: string) => {
      const root = document.getElementById(carouselId);
      if (!root) return;

      const shell = root.querySelector('.shell');
      const viewport = root.querySelector('.viewport');
      const track = root.querySelector('.track');
      const slides = Array.from(root.querySelectorAll('.slide'));
      const prevBtn = root.querySelector('.prev');
      const nextBtn = root.querySelector('.next');

      if (!shell || !viewport || !track || !prevBtn || !nextBtn || slides.length === 0) return;

      const intervalMs = 3000;
      let timer: NodeJS.Timeout | null = null;
      let index = 0;

      function slidesPerView() {
        const spv = getComputedStyle(root as Element).getPropertyValue('--spv').trim();
        const n = parseInt(spv, 10);
        return Number.isFinite(n) && n > 0 ? n : 3;
      }

      function maxIndex() {
        return Math.max(0, slides.length - slidesPerView());
      }

      function slideStepPx() {
        const first = slides[0] as HTMLElement;
        if (!first) return 0;
        const slideW = first.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track as HTMLElement).gap || '0');
        return slideW + gap;
      }

      function goTo(i: number) {
        const mi = maxIndex();
        index = Math.max(0, Math.min(i, mi));
        const x = index * slideStepPx();
        (track as HTMLElement).style.transform = `translateX(-${x}px)`;
      }

      function next() {
        const mi = maxIndex();
        if (index >= mi) {
          index = 0;
          goTo(index);
        } else {
          goTo(index + 1);
        }
      }

      function prev() {
        const mi = maxIndex();
        if (index <= 0) {
          index = mi;
          goTo(index);
        } else {
          goTo(index - 1);
        }
      }

      function start() {
        stop();
        timer = setInterval(next, intervalMs);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      (nextBtn as HTMLButtonElement).addEventListener('click', () => {
        next();
        start();
      });
      (prevBtn as HTMLButtonElement).addEventListener('click', () => {
        prev();
        start();
      });

      (shell as HTMLElement).addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          prev();
          start();
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          next();
          start();
        }
      });

      let startX = 0,
        dx = 0,
        touching = false;

      (viewport as HTMLElement).addEventListener(
        'touchstart',
        (e) => {
          if (!e.touches || e.touches.length !== 1) return;
          touching = true;
          startX = e.touches[0].clientX;
          dx = 0;
          stop();
        },
        { passive: true }
      );

      (viewport as HTMLElement).addEventListener(
        'touchmove',
        (e) => {
          if (!touching || !e.touches || e.touches.length !== 1) return;
          dx = e.touches[0].clientX - startX;
        },
        { passive: true }
      );

      (viewport as HTMLElement).addEventListener('touchend', () => {
        if (!touching) return;
        touching = false;
        const threshold = 45;
        if (dx > threshold) prev();
        else if (dx < -threshold) next();
        start();
      });

      (shell as HTMLElement).addEventListener('mouseenter', stop);
      (shell as HTMLElement).addEventListener('mouseleave', start);

      let resizeT: NodeJS.Timeout | null = null;
      window.addEventListener('resize', () => {
        if (resizeT) clearTimeout(resizeT);
        resizeT = setTimeout(() => {
          (track as HTMLElement).style.transition = 'none';
          goTo(Math.min(index, maxIndex()));
          requestAnimationFrame(() => ((track as HTMLElement).style.transition = 'transform 420ms ease'));
        }, 120);
      });

      goTo(0);
      start();

      return () => {
        stop();
      };
    };

    // Initialize both carousels
    initCarousel('business-carousel');
    initCarousel('travel-carousel');
  }, []);

  return (
    <>
      <title>{t('servicesPage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Trusted service providers and partners recommended by JA Group Services Ltd"
      />

      <style>{`
        .carousel-container {
          --spv: 3;
          --gap: 14px;
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        @media (min-width: 1400px) {
          .carousel-container { --spv: 4; }
        }

        @media (max-width: 980px) {
          .carousel-container { --spv: 2; }
        }

        @media (max-width: 640px) {
          .carousel-container { --spv: 1; }
        }

        .carousel-container .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .carousel-container .section-title {
          font-size: 18px;
          font-weight: 800;
        }

        .carousel-container .partner img {
          width: 110px;
          height: auto;
          display: block;
        }

        .carousel-container .shell {
          position: relative;
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 1px 10px rgba(0,0,0,.06);
          overflow: hidden;
        }

        .carousel-container .viewport {
          overflow: hidden;
          touch-action: pan-y;
          padding: 12px;
        }

        .carousel-container .track {
          display: flex;
          gap: var(--gap);
          transition: transform 420ms ease;
          will-change: transform;
        }

        .carousel-container .slide {
          flex: 0 0 calc((100% - (var(--gap) * (var(--spv) - 1))) / var(--spv));
          border: 1px solid rgba(0,0,0,.10);
          border-radius: 14px;
          padding: 10px;
          background: #fff;
          box-sizing: border-box;
        }

        .carousel-container .item {
          width: 100%;
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-container .item a {
          display: block;
        }

        .carousel-container .navbtn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,.18);
          background: rgba(255,255,255,.92);
          box-shadow: 0 4px 12px rgba(0,0,0,.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          user-select: none;
        }

        .carousel-container .prev { left: 10px; }
        .carousel-container .next { right: 10px; }

        .carousel-container img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        @media (prefers-reduced-motion: reduce) {
          .carousel-container .track { transition: none; }
        }
      `}</style>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#0A1F44] via-[#1e3a5f] to-[#2563EB] text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Award className="h-4 w-4" />
                {t('recommended.hero.badge', language)}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('recommended.title', language)}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                {t('recommended.hero.subtitle', language)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tab Filter Section */}
        <section className="py-8 bg-white border-b border-gray-200 sticky top-[6rem] md:top-[7rem] lg:top-[8rem] z-40 backdrop-blur-lg bg-white/95">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setActiveTab('business')}
                size="lg"
                variant={activeTab === 'business' ? 'default' : 'outline'}
                className={`px-8 py-6 text-lg font-semibold transition-all duration-300 ${
                  activeTab === 'business'
                    ? 'bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90 shadow-lg'
                    : 'bg-white text-[#0A1F44] hover:bg-gray-50 border-2 border-[#0A1F44]/20'
                }`}
              >
                <Building2 className="mr-2 h-5 w-5" />
                {t('recommended.tabs.business', language)}
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold transition-all duration-300 bg-white text-[#2563EB] hover:bg-blue-50 border-2 border-[#2563EB]/20"
              >
                <Link to="/find-activities-tours">
                  <Compass className="mr-2 h-5 w-5" />
                  {t('recommended.tabs.activities', language)}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Business Services Tab */}
        {activeTab === 'business' && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 bg-[#0A1F44]/10 text-[#0A1F44] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Building2 className="h-4 w-4" />
                  {t('recommended.business.badge', language)}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1F44] mb-4">
                  {t('recommended.business.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70 max-w-2xl mx-auto">
                  {t('recommended.business.subtitle', language)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div id="business-carousel" className="carousel-container">
                  <div className="header">
                    <div className="section-title">{t('recommended.business.section1', language)}</div>
                    <div className="partner">
                      <a
                        rel="sponsored"
                        href="https://1st-formations-limited.sjv.io/c/6953031/886574/12045"
                        target="_top"
                        id="886574"
                      >
                        <img
                          src="//a.impactradius-go.com/display-ad/12045-886574"
                          width="155"
                          height="65"
                          alt=""
                        />
                      </a>
                      <img
                        height="0"
                        width="0"
                        src="https://imp.pxf.io/i/6953031/886574/12045"
                        style={{ position: 'absolute', visibility: 'hidden' }}
                      />
                    </div>
                  </div>

                  <div className="shell" tabIndex={0}>
                    <button className="navbtn prev" type="button">
                      ‹
                    </button>
                    <button className="navbtn next" type="button">
                      ›
                    </button>

                    <div className="viewport">
                      <div className="track">
                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/907861/12045"
                                target="_top"
                                id="907861"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-907861"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/907861/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/974959/12045"
                                target="_top"
                                id="974959"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-974959"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/974959/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/1728651/12045"
                                target="_top"
                                id="1728651"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-1728651"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/1728651/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/1074676/12045"
                                target="_top"
                                id="1074676"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-1074676"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/1074676/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/1714190/12045"
                                target="_top"
                                id="1714190"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-1714190"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/1714190/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="slide">
                          <div className="item">
                            <div>
                              <a
                                rel="sponsored"
                                href="https://1st-formations-limited.sjv.io/c/6953031/2707705/12045"
                                target="_top"
                                id="2707705"
                              >
                                <img
                                  src="//a.impactradius-go.com/display-ad/12045-2707705"
                                  width="300"
                                  height="250"
                                  alt=""
                                />
                              </a>
                              <img
                                height="0"
                                width="0"
                                src="https://imp.pxf.io/i/6953031/2707705/12045"
                                style={{ position: 'absolute', visibility: 'hidden' }}
                              />
                            </div>
                          </div>
                        </div>


                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AirLandLine Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16"
              >
                <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-lg">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <a
                      href="https://airlandline.com/?fpr=jagroupservicesltd"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="transition-transform hover:scale-105 duration-300"
                    >
                      <img
                        src="/assets/al-logo.png"
                        alt="AirLandLine"
                        className="w-64 md:w-80 h-auto"
                      />
                    </a>
                    <a
                      href="https://airlandline.com/?fpr=jagroupservicesltd"
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex items-center gap-2 bg-[#0A1F44] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0A1F44]/90 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                    >
                      Visit
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>

             </div>
           </section>
         )}


        {/* Disclaimer */}
        <section className="py-12 bg-[#0A1F44]/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-sm text-[#1A1A1A]/60 text-center leading-relaxed">
                <strong>Disclosure:</strong> JA Group Services Ltd may receive compensation for referrals to
                some of these service providers. All recommendations are based on our professional assessment
                and direct experience. We only recommend services that meet our quality standards and that we
                would use ourselves.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
