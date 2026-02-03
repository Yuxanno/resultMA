import { useState } from 'react';
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

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    grade: ''
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setShowModal(false);
    // Show success message
    alert('Arizangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Math Academy
                </span>
                <span className="text-xs text-gray-500">Matematika maktabi</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Afzalliklar
              </button>
              <button onClick={() => scrollToSection('programs')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Yo'nalishlar
              </button>
              <button onClick={() => scrollToSection('results')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Natijalar
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Aloqa
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Kirish
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                Qabulga yozilish
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Afzalliklar
              </button>
              <button onClick={() => scrollToSection('programs')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Yo'nalishlar
              </button>
              <button onClick={() => scrollToSection('results')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Natijalar
              </button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
                Aloqa
              </button>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="block w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  Kirish
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="block w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Qabulga yozilish
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>1–11-sinflar uchun zamonaviy matematika maktabi</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Matematikaga
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ishtiyoq uyg'otamiz
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Zamonaviy STEAM darslari, olimpiadaga tayyorgarlik, prezident maktabiga tayyorgarlik va tarbiyaviy muhit bir joyda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                >
                  <span>Qabulga yozilish</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('programs')}
                  className="px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 font-semibold"
                >
                  Yo'nalishlar bilan tanishish
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">200+</div>
                  <div className="text-sm text-gray-600 mt-1">Bitiruvchilar</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">20+</div>
                  <div className="text-sm text-gray-600 mt-1">Olimpiada g'oliblari</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">10+</div>
                  <div className="text-sm text-gray-600 mt-1">Yillik tajriba</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/landing/images/banner.png"
                  alt="Math Academy"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Olimpiada</div>
                    <div className="text-xs text-gray-500">Tayyorgarlik</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float-delayed">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">CRM tizimi</div>
                    <div className="text-xs text-gray-500">Onlayn nazorat</div>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              <span>Nima uchun aynan Math Academy?</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Farzandingiz muvaffaqiyati uchun
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                eng yaxshi muhit
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Biz darslarni faqat "formal" o'tmaymiz – har bir bolada matematik fikrlash va mustaqil o'rganish ko'nikmalarini shakllantiramiz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Yuqori malakali ustozlar</h3>
              <p className="text-gray-600 leading-relaxed">
                Respublika va xalqaro olimpiada tajribasiga ega o'qituvchilar, doimiy ravishda o'z ustida ishlaydigan jamoa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Raqamli nazorat va CRM</h3>
              <p className="text-gray-600 leading-relaxed">
                mathacademy.uz va CRM orqali davomati, natijalari va uy vazifalari ota-onaga doimiy ko'rinib turadi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-pink-100">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Natijaga yo'naltirilgan tizim</h3>
              <p className="text-gray-600 leading-relaxed">
                Har oy diagnostik test, reyting, shaxsiy o'sish tahlili va keyingi oy uchun aniq rejalar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-green-100">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Individual yondashuv</h3>
              <p className="text-gray-600 leading-relaxed">
                Har bir o'quvchi uchun shaxsiy o'quv reja va doimiy monitoring. Kichik guruhlarda intensiv darslar.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-orange-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zamonaviy dastur</h3>
              <p className="text-gray-600 leading-relaxed">
                STEAM metodikasi, interaktiv darslar va amaliy loyihalar orqali chuqur bilim berish.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-indigo-100">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Olimpiada tayyorgarlik</h3>
              <p className="text-gray-600 leading-relaxed">
                Mintaqaviy va xalqaro olimpiadalarga maxsus tayyorgarlik dasturlari va mentorlik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Qabulga yozilish</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To'liq ism
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ism familiyangiz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+998 90 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sinf
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
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
