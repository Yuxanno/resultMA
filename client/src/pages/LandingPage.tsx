import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Trophy, 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Star,
  Sparkles,
  Target,
  Zap,
  Heart
} from 'lucide-react';
import '../landing-animations.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    grade: ''
  });

  // Intersection Observer for scroll animations (optimized)
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-visible');
          // Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/applications/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          grade: formData.grade,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ fullName: '', phone: '', grade: '' });
        alert('Arizangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
      } else {
        alert('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Animated Background Elements - Optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="Math Academy Logo" 
                  loading="lazy"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Math Academy
                </span>
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium hidden xs:block">Matematika maktabi</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors text-[15px] font-medium relative group">
                Afzalliklar
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"></span>
              </button>
              <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-blue-600 transition-colors text-[15px] font-medium relative group">
                Yo'nalishlar
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"></span>
              </button>
              <button onClick={() => scrollToSection('results')} className="text-gray-700 hover:text-blue-600 transition-colors text-[15px] font-medium relative group">
                Natijalar
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"></span>
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors text-[15px] font-medium relative group">
                Aloqa
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"></span>
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="px-4 lg:px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-all text-sm lg:text-[15px] hover:bg-white/50 rounded-lg whitespace-nowrap"
              >
                Kirish
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="shimmer-button px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm lg:text-[15px] shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
              >
                Qabulga yozilish
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/50 transition-colors flex-shrink-0"
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-effect border-t border-white/20">
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors font-medium text-sm">
                Afzalliklar
              </button>
              <button onClick={() => scrollToSection('programs')} className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors font-medium text-sm">
                Yo'nalishlar
              </button>
              <button onClick={() => scrollToSection('results')} className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors font-medium text-sm">
                Natijalar
              </button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors font-medium text-sm">
                Aloqa
              </button>
              <div className="pt-3 border-t border-white/20 space-y-2 mt-3">
                <button
                  onClick={() => navigate('/login')}
                  className="block w-full px-3 py-2.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors font-medium text-sm"
                >
                  Kirish
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="block w-full px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg text-sm"
                >
                  Qabulga yozilish
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 lg:space-y-10">
              <div className="inline-flex items-center space-x-2 px-4 py-2.5 glass-effect rounded-full text-xs sm:text-sm animate-fade-in-up shadow-lg">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="leading-tight font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">1–11-sinflar uchun zamonaviy matematika maktabi</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight animate-fade-in-up animate-delay-100">
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  “Math Academy” xususiy maktabi
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed animate-fade-in-up animate-delay-200 font-light">
                Zamonaviy STEAM darslari, olimpiadaga tayyorgarlik, prezident maktabiga tayyorgarlik va tarbiyaviy muhit bir joyda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up animate-delay-300">
                <button
                  onClick={() => setShowModal(true)}
                  className="shimmer-button group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-base flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <span>Qabulga yozilish</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="px-8 py-4 glass-effect text-gray-700 rounded-xl hover:bg-white/80 transition-all font-semibold text-base shadow-lg hover:shadow-xl"
                >
                  Yo'nalishlar bilan tanishish
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 lg:gap-8 pt-8 animate-fade-in-up animate-delay-400">
                <div className="glass-effect p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">200+</div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">Bitiruvchilar</div>
                </div>
                <div className="glass-effect p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">20+</div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">Olimpiada g'oliblari</div>
                </div>
                <div className="glass-effect p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10+</div>
                  <div className="text-sm text-gray-600 mt-2 font-medium">Yillik tajriba</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative mt-8 lg:mt-0 animate-fade-in-up animate-delay-200">
              <div className="relative z-10 px-4 sm:px-0">
                <div className="relative group">
                  <img
                    src="/landing/images/banner.png"
                    alt="Math Academy"
                    loading="lazy"
                    className="w-full h-auto rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="hidden sm:block absolute -top-6 -left-6 lg:-left-8 glass-effect p-4 rounded-2xl shadow-xl animate-fade-in-up animate-delay-400 z-20 hover:scale-110 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Olimpiada</div>
                    <div className="text-xs text-gray-600 font-medium">Tayyorgarlik</div>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -right-6 lg:-right-8 glass-effect p-4 rounded-2xl shadow-xl animate-fade-in-up animate-delay-500 z-20 hover:scale-110 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">CRM tizimi</div>
                    <div className="text-xs text-gray-600 font-medium">Onlayn nazorat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2.5 glass-effect rounded-full text-xs sm:text-sm mb-6 shadow-lg">
              <Star className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Nima uchun aynan Math Academy?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight px-4">
              Farzandingiz muvaffaqiyati uchun
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                eng yaxshi muhit
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 font-light">
              Biz darslarni faqat "formal" o'tmaymiz – har bir bolada matematik fikrlash va mustaqil o'rganish ko'nikmalarini shakllantiramiz.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Yuqori malakali ustozlar</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Respublika va xalqaro olimpiada tajribasiga ega o'qituvchilar, doimiy ravishda o'z ustida ishlaydigan jamoa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Raqamli nazorat va CRM</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                mathacademy.uz va CRM orqali davomati, natijalari va uy vazifalari ota-onaga doimiy ko'rinib turadi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Natijaga yo'naltirilgan tizim</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Har oy diagnostik test, reyting, shaxsiy o'sish tahlili va keyingi oy uchun aniq rejalar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Individual yondashuv</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Har bir o'quvchi uchun shaxsiy o'quv reja va doimiy monitoring. Kichik guruhlarda intensiv darslar.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zamonaviy dastur</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                STEAM metodikasi, interaktiv darslar va amaliy loyihalar orqali chuqur bilim berish.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="premium-card group glass-effect p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Olimpiada tayyorgarlik</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Mintaqaviy va xalqaro olimpiadalarga maxsus tayyorgarlik dasturlari va mentorlik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 sm:mb-20 scroll-animate">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2.5 glass-effect rounded-full text-xs sm:text-sm mb-6 shadow-lg">
                <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Yo'nalishlar</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                O'quv dasturlarimiz
              </h2>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="shimmer-button mt-6 lg:mt-0 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-base shadow-lg hover:shadow-xl hover:scale-105"
            >
              Konsultatsiyaga yozilish
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Program 1 */}
            <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1–4-sinflar: Boshlang'ich matematika</h3>
              <p className="text-base text-gray-600 mb-6">Matematikaga muhabbat uyg'otish va mustahkam poydevor yaratish.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Mantiqiy masalalar va o'yinlar</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Tez hisoblash ko'nikmalari</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Diqqat va xotirani rivojlantirish</span>
                </li>
              </ul>
            </div>

            {/* Program 2 */}
            <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">5–8-sinflar: Kuchli asos va tayyorgarlik</h3>
              <p className="text-base text-gray-600 mb-6">Umumta'lim dasturi + chuqurlashtirilgan algebra va geometriya.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">O'quv dasturini chuqur o'zlashtirish</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Har hafta onlayn testlar</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Qo'shimcha mustahkamlash darslari</span>
                </li>
              </ul>
            </div>

            {/* Program 3 */}
            <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">9–11-sinflar: Olimpiada va oliygoh</h3>
              <p className="text-base text-gray-600 mb-6">Oliy ta'lim va olimpiadalar uchun chuqur tayyorgarlik.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Oliy ta'lim test bloklari</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Mintaqaviy va xalqaro olimpiadaga tayyorlov</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700">Mentorlik va shaxsiy reja</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl sm:rounded-[2.5rem] p-12 sm:p-16 lg:p-20 scroll-animate shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Farzandingiz kelajagi uchun bugun qaror qabul qiling
                </h2>
                <p className="text-blue-50 text-lg sm:text-xl leading-relaxed font-light">
                  Qabul suhbatiga yoziling, darajani aniqlash testi bepul o'tkaziladi va sizga mos o'quv dasturi tavsiya qilinadi.
                </p>
              </div>
              <div className="text-center lg:text-right">
                <button
                  onClick={() => setShowModal(true)}
                  className="shimmer-button w-full sm:w-auto px-10 py-5 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
                >
                  Qabulga yozilish
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2.5 glass-effect rounded-full text-xs sm:text-sm mb-6 shadow-lg">
              <Trophy className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Natijalarimiz</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight px-4">
              O'quvchilarimiz muvaffaqiyatlari
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 font-light">
              Har yili o'quvchilarimiz respublika va xalqaro olimpiadalarda yuqori natijalar ko'rsatmoqda
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="premium-card glass-effect text-center p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">200+</div>
              <div className="text-base text-gray-600 font-semibold">Bitiruvchilar</div>
            </div>
            <div className="premium-card glass-effect text-center p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">20+</div>
              <div className="text-base text-gray-600 font-semibold">Olimpiada g'oliblari</div>
            </div>
            <div className="premium-card glass-effect text-center p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">95%</div>
              <div className="text-base text-gray-600 font-semibold">O'zlashtirish darajasi</div>
            </div>
            <div className="premium-card glass-effect text-center p-8 rounded-3xl scroll-animate shadow-xl">
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">10+</div>
              <div className="text-base text-gray-600 font-semibold">Yillik tajriba</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-visible pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20 scroll-animate">
            <div className="inline-flex items-center space-x-2 px-4 py-2.5 glass-effect rounded-full text-xs sm:text-sm mb-6 shadow-lg">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Aloqa</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight px-4">
              Biz bilan bog'laning
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Telefon</h3>
                    <p className="text-base text-gray-600">+998 90 974 11 31</p>
                    <p className="text-base text-gray-600">+998 91 648 49 12</p>
                  </div>
                </div>
              </div>

              <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Email</h3>
                    <p className="text-base text-gray-600">info@mathacademy.uz</p>
                  </div>
                </div>
              </div>

              <div className="premium-card glass-effect rounded-3xl p-8 scroll-animate shadow-xl">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Manzil</h3>
                    <p className="text-base text-gray-600">Buxoro viloyati, G'ijduvon tumani, 2-son kasb-hunar maktabi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="premium-card glass-effect rounded-3xl p-3 scroll-animate shadow-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3052.2454445378253!2d64.66316367551107!3d40.09224027532588!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f5069d8abb8ccb7%3A0x1f13c80e1aaed70d!2sGijduvon%20tuman%202-son%20kasb-hunar%20maktabi!5e0!3m2!1sen!2s!4v1763363525407!5m2!1sen!2s"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '20px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="sm:h-[450px]"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            <div className="scroll-animate">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="Math Academy Logo" 
                    className="w-12 h-12 object-contain"
                  />
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Math Academy</span>
              </div>
              <p className="text-base text-gray-400 leading-relaxed font-light">
                Matematikaga ixtisoslashgan xususiy maktab. Zamonaviy ta'lim, sharqona tarbiya va natijaga yo'naltirilgan o'quv dasturlari.
              </p>
            </div>

            <div className="scroll-animate">
              <h3 className="font-bold mb-6 text-lg text-white">Aloqa</h3>
              <ul className="space-y-3 text-base text-gray-400">
                <li className="flex items-center hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0 text-blue-400" />
                  +998 90 974 11 31
                </li>
                <li className="flex items-center hover:text-white transition-colors">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0 text-blue-400" />
                  +998 91 648 49 12
                </li>
                <li className="flex items-center hover:text-white transition-colors">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0 text-blue-400" />
                  info@mathacademy.uz
                </li>
              </ul>
            </div>

            <div className="scroll-animate sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold mb-6 text-lg text-white">Ijtimoiy tarmoqlar</h3>
              <div className="flex space-x-4">
                <a href="https://t.me/mathacademy_ps" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all hover:scale-110 shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/mathacademyuz" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Math Academy. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md modal-backdrop">
          <div className="glass-effect rounded-3xl shadow-2xl max-w-md w-full p-10 relative modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Qabulga yozilish</h3>
              <p className="text-gray-600 text-lg font-light">Ma'lumotlaringizni qoldiring, biz siz bilan bog'lanamiz</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To'liq ism
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none shadow-sm"
                  placeholder="Ism familiyangiz"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none shadow-sm"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sinf
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none shadow-sm"
                >
                  <option value="">Sinfni tanlang</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}-sinf
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="shimmer-button w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold mt-6 shadow-lg hover:shadow-xl"
              >
                Yuborish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
