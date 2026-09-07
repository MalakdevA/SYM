'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_INFO, SOCIAL_MEDIA } from '@/lib/constants';
import { 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Headphones, 
  ShieldCheck, 
  Wrench, 
  AlertCircle, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Search
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function SupportView() {
  const { language, dir, t } = useLanguage();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Technical Support',
    scooterModel: 'General Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const composedMessage = formData.scooterModel && formData.scooterModel !== 'General Inquiry'
        ? `${formData.message}\n\nالموديل / الطراز: ${formData.scooterModel}`
        : formData.message;

      const res = await fetch('/api/contact/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.category,
          message: composedMessage,
        })
      });

      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (parseError) {
        console.warn('Backend returned non-JSON response for contact API', parseError);
        data = { success: false, error: isAr ? 'فشل الاتصال بالخادم.' : 'Server unreachable. Please make sure the PHP backend is running.' };
      }

      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          category: 'Technical Support',
          scooterModel: 'General Inquiry',
          message: ''
        });
      } else {
        setErrorMessage(data.error || (isAr ? 'فشل إرسال الرسالة. يمكنك الاتصال بنا مباشرة.' : 'Failed to submit inquiry. Please try calling us directly.'));
      }
    } catch (err) {
      setErrorMessage(isAr ? 'خطأ في الاتصال بالشبكة. يرجى إعادة المحاولة أو التواصل معنا عبر الواتساب.' : 'Network connection error. Please try again or contact us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppQuick = (topic: string) => {
    const text = isAr 
      ? `مرحباً دائم SYM مصر، أحتاج مساعدة بشأن: ${topic}`
      : `Hello SYM Egypt Support, I need assistance regarding: ${topic}`;
    const url = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const faqs = [
    {
      q: isAr ? 'كيف يمكنني معرفة أسعار وتوافر قطع الغيار؟' : 'How do I check spare parts availability and prices?',
      a: isAr ? 'يمكنك البحث في كتالوج قطع الغيار الرسمي على صفحة /spare-parts باسم القطعة أو الكود الداخلي والخارجي، أو إرسال صورة القطعة عبر الواتساب للتأكيد الفوري.' : 'You can search our official Spare Parts catalog at /spare-parts by part name, internal code, or external code. You can also send us a photo of your part on WhatsApp for instant confirmation.'
    },
    {
      q: isAr ? 'ما هي تغطية الضمان الرسمي لـ SYM في مصر؟' : 'What is covered under the SYM Official Warranty in Egypt?',
      a: isAr ? 'جميع سكوترات SYM الجديدة المباعة عبر المعارض المعتمدة تشمل ضمان لمدة سنتين أو 20,000 كم يغطي المحرك، ناقل الحركة، والأجزاء الكهربائية الرئيسية.' : 'All new SYM scooters purchased through authorized showrooms include 2 Years or 20,000 km warranty covering engine, transmission, and core electrical components.'
    },
    {
      q: isAr ? 'أين تقع مراكز خدمة وصيانة SYM الرسمية؟' : 'Where are the official SYM service centers located?',
      a: isAr ? 'لدينا مراكز خدمة وصيانة معتمدة في مدينة نصر (مكرم عبيد)، المهندسين (شارع السودان)، الشيخ زايد، والمعادي الجديدة مجهزة بأحدث أجهزة الفحص ومهندسين معتمدين.' : 'We have official service workshops in Nasr City (Makram Ebeid), Mohandessin (Sudan St), Sheikh Zayed, and New Maadi with certified technicians and original diagnostic equipment.'
    },
    {
      q: isAr ? 'كيف يمكنني حجز موعد صيانة للسكوتر الخاص بي؟' : 'How can I schedule a maintenance appointment for my scooter?',
      a: isAr ? 'يمكنك حجز موعد الصيانة عبر الاتصال بـ 01271384149، أو ملء النموذج أدناه، أو التواصل الفوري عبر الواتساب.' : 'You can book your service slot by calling 01271384149, sending a message through the form below, or contacting our WhatsApp customer desk directly.'
    }
  ];

  return (
    <div className="w-full bg-[#050505] text-white min-h-screen font-sans" dir={dir}>
      {/* ── 1. Hero Section ── */}
      <section className="relative w-full bg-gradient-to-b from-neutral-950 via-black to-[#050505] pt-28 pb-20 px-6 md:px-12 border-b border-neutral-900 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-950/50 border border-red-800/40 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-red-950/30">
            <Headphones className="w-4 h-4 text-red-500" />
            <span>{t('support.badge', '24/7 Official Customer Care')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            {t('support.title', 'Service and Support')}
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium">
            {t('support.subtitle', 'Get help for all your SYM scooters, motorcycles, spare parts, and warranty inquiries.')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="#contact-form"
              className="bg-white hover:bg-neutral-200 text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200 shadow-xl"
            >
              {t('support.sendMessage', 'Send Message')}
            </a>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="border border-neutral-700 hover:border-red-500 bg-neutral-900/80 hover:bg-red-950/40 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all duration-200"
            >
              {t('support.chatWhatsapp', 'Chat on WhatsApp')}
            </a>
          </div>

          {/* Hero Representatives Image Container */}
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-neutral-800/90 shadow-2xl bg-neutral-950 group">
            {/* Image Frame */}
            <div className="relative w-full h-[340px] sm:h-[440px] bg-neutral-900">
              <Image
                src="/service.webp"
                alt="SYM Customer Support Representatives"
                fill
                className="object-cover object-[center_80%] group-hover:scale-105 transition-transform duration-700 brightness-110 contrast-105"
                priority
              />
            </div>
            
            {/* Live Support Bar Docked at Bottom */}
            <div className="p-4 sm:p-6 bg-neutral-950/95 border-t border-neutral-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-start">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                <div>
                  <span className="text-white font-bold text-sm sm:text-base block">{t('support.supportOnline', 'Support Team Online')}</span>
                  <span className="text-neutral-400 text-xs">{t('support.avgResponse', 'Average response time: < 15 minutes')}</span>
                </div>
              </div>
              <a
                href={`tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t('support.callHotline', 'Call Hotline 01271384149')}</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. Direct Interactive Channels Grid ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">{t('support.howConnect', 'How would you like to connect?')}</h2>
          <p className="text-neutral-400 text-sm sm:text-base">{t('support.chooseChannel', 'Choose your preferred channel for instant support and assistance')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Channel 1: Direct Phone Call */}
          <div className="bg-neutral-900/60 border border-neutral-800 hover:border-red-600/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-2xl hover:shadow-red-950/20 backdrop-blur-sm">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('support.callCardTitle', 'Call Our Hotline')}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                {t('support.callCardDesc', 'Speak directly with a customer care specialist for immediate help with sales, maintenance, or roadside support.')}
              </p>
              <div className="text-xs text-neutral-400 space-y-2 mb-6 bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t('support.workingHoursSunThu', 'Sun – Thu: 9:00 AM – 9:00 PM')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t('support.workingHoursFriSat', 'Fri – Sat: 10:00 AM – 6:00 PM')}</span>
                </div>
              </div>
            </div>
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/[^0-9+]/g, '')}`}
              className="w-full text-center bg-neutral-800 hover:bg-red-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-red-600 shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isAr ? 'اتصل بنا' : 'Call'} {CONTACT_INFO.phone}</span>
            </a>
          </div>

          {/* Channel 2: WhatsApp Chat */}
          <div className="bg-neutral-900/60 border border-neutral-800 hover:border-red-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-2xl hover:shadow-red-950/20 backdrop-blur-sm">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('support.waCardTitle', 'WhatsApp Instant Chat')}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                {t('support.waCardDesc', 'Send photos, part numbers, or chassis details directly to our WhatsApp support team for fast resolution.')}
              </p>

              {/* Quick WhatsApp Topics */}
              <div className="space-y-2 mb-6">
                <button
                  type="button"
                  onClick={() => handleWhatsAppQuick(isAr ? 'استفسار عن قطع الغيار' : 'Spare Parts Inquiry')}
                  className="w-full text-start bg-neutral-950 hover:bg-neutral-800 text-xs text-neutral-300 py-2.5 px-3.5 rounded-xl border border-neutral-800 transition-colors flex items-center justify-between"
                >
                  <span>{t('support.waInquiryParts', '🔧 Spare Parts Inquiry')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 ${isAr ? 'rotate-180' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppQuick(isAr ? 'حجز موعد صيانة' : 'Maintenance Booking')}
                  className="w-full text-start bg-neutral-950 hover:bg-neutral-800 text-xs text-neutral-300 py-2.5 px-3.5 rounded-xl border border-neutral-800 transition-colors flex items-center justify-between"
                >
                  <span>{t('support.waBookingService', '🛠️ Maintenance Booking')}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-neutral-500 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-gradient-to-r from-[#E60012] via-red-600 to-rose-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-red-950/40 border border-red-500/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('support.startWaChat', 'Start WhatsApp Chat')}</span>
            </a>
          </div>

          {/* Channel 3: Official Email */}
          <div className="bg-neutral-900/60 border border-neutral-800 hover:border-blue-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-950/20 backdrop-blur-sm">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('support.emailCardTitle', 'Email Customer Care')}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                {t('support.emailCardDesc', 'Have a detailed technical question or official inquiry? Email our customer support department directly.')}
              </p>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAr ? 'الدعم العام:' : 'General Info:'}</span>
                  <span className="font-mono text-white">{CONTACT_INFO.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAr ? 'قسم المبيعات:' : 'Sales Care:'}</span>
                  <span className="font-mono text-white">{CONTACT_INFO.salesEmail}</span>
                </div>
              </div>
            </div>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="w-full text-center bg-neutral-800 hover:bg-blue-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>{t('support.sendEmailBtn', 'Send Email')}</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── 3. Advanced Contact & Support Message Form ── */}
      <section id="contact-form" className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-3">{t('support.formTitle', 'Send Us a Direct Message')}</h2>
            <p className="text-neutral-400 text-sm max-w-xl mx-auto">
              {t('support.formSubtitle', 'Fill out your contact details and inquiry message below. Our customer support specialist will contact you via email or phone.')}
            </p>
          </div>

          {submitted ? (
            <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">{t('support.msgSuccessTitle', 'Message Sent Successfully!')}</h3>
              <p className="text-neutral-300 text-sm max-w-md mx-auto">
                {t('support.msgSuccessDesc', 'Thank you for contacting SYM Egypt Support. We have received your inquiry and our team will get back to you within 24 hours.')}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors mt-2"
              >
                {t('support.sendAnotherMsg', 'Send Another Message')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Row 1: Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    {t('support.fullName', 'Full Name *')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('support.fullNamePlaceholder', 'e.g. Ahmed Mohamed')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    {t('support.phone', 'Phone Number *')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('support.phonePlaceholder', 'e.g. 0100 123 4567')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Email & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    {t('support.email', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('support.emailPlaceholder', 'name@example.com')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    {t('support.inquirySubject', 'Inquiry Subject')}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
                  >
                    <option value="Technical Support">{t('support.subTech', 'Technical Support & Maintenance')}</option>
                    <option value="Spare Parts">{t('support.subSpare', 'Spare Parts Inquiry')}</option>
                    <option value="Warranty Policy">{t('support.subWarranty', 'Warranty Registration & Claims')}</option>
                    <option value="Sales & Financing">{t('support.subSales', 'Scooter Sales & Financing')}</option>
                    <option value="Other">{t('support.subOther', 'Other Inquiry')}</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Scooter Model Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  {t('support.selectModel', 'Scooter / Motorcycle Model (Optional)')}
                </label>
                <select
                  name="scooterModel"
                  value={formData.scooterModel}
                  onChange={handleInputChange}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
                >
                  <option value="General Inquiry">{t('support.selectModelPlaceholder', 'Select your model (or General Inquiry)')}</option>
                  <option value="CRUiSYM 400">CRUiSYM 400</option>
                  <option value="CRUiSYM 300 / 300i">CRUiSYM 300 / 300i</option>
                  <option value="Joymax Z 300">Joymax Z 300</option>
                  <option value="Husky ADV 200">Husky ADV 200</option>
                  <option value="Jet 14 EVO">Jet 14 EVO</option>
                  <option value="Jet 14 200 / DD">Jet 14 200 / DD</option>
                  <option value="Jet X 150 / 200">Jet X 150 / 200</option>
                  <option value="Symphony ST 200">Symphony ST 200</option>
                  <option value="Symphony SR 150">Symphony SR 150</option>
                  <option value="Fiddle II / III">Fiddle II / III</option>
                  <option value="Maxsym TL 508">Maxsym TL 508</option>
                </select>
              </div>

              {/* Row 4: Message Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  {t('support.yourMessage', 'Your Message *')}
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('support.messagePlaceholder', 'Please describe your question, maintenance issue, or spare part details in full...')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-600 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {loading ? (
                  <span>{t('support.sendingMsg', 'Sending Message...')}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('support.sendMsgBtn', 'Submit Message to Support')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── 4. Frequently Asked Questions (FAQ) Accordion ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{t('support.faqTitle', 'Frequently Asked Questions')}</h2>
          <p className="text-neutral-400 text-sm">{t('support.faqSubtitle', 'Quick answers to common inquiries')}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-start font-bold text-white text-base flex items-center justify-between gap-4 hover:text-red-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-red-500' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 pt-1 text-neutral-400 text-sm leading-relaxed border-t border-neutral-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Main Showrooms & Service Centers ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 border-t border-neutral-900 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{t('support.showroomsTitle', 'Official Showrooms & Service Centers')}</h2>
          <p className="text-neutral-400 text-sm">{t('support.showroomsSubtitle', 'Visit us in person for sales, genuine parts, and scheduled maintenance')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-red-500 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">{isAr ? 'فرع مدينة نصر الرئيسي' : 'Nasr City Main Branch'}</h4>
            <p className="text-neutral-400 text-xs mb-3">{isAr ? 'المعرض الرئيسي وورشة الصيانة' : 'Main Showroom & Maintenance Workshop'}</p>
            <p className="text-neutral-300 text-xs leading-relaxed mb-4">
              {isAr ? 'شارع مكرم عبيد، مدينة نصر، القاهرة' : 'Makram Ebeid St, Nasr City, Cairo'}
            </p>
            <span className="text-xs text-red-500 font-bold block">{t('support.openDaily', 'Open Daily')}</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-red-500 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">{isAr ? 'فرع المهندسين' : 'Mohandessin Branch'}</h4>
            <p className="text-neutral-400 text-xs mb-3">{isAr ? 'معرض ومكتب قطع الغيار' : 'Showroom & Spare Parts Desk'}</p>
            <p className="text-neutral-300 text-xs leading-relaxed mb-4">
              {isAr ? 'شارع السودان، المهندسين، الجيزة' : 'Sudan St, Mohandessin, Giza'}
            </p>
            <span className="text-xs text-red-500 font-bold block">{t('support.openDaily', 'Open Daily')}</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-red-500 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">{isAr ? 'فرع الشيخ زايد' : 'Sheikh Zayed Branch'}</h4>
            <p className="text-neutral-400 text-xs mb-3">{isAr ? 'مركز التجربة الرئيسي' : 'Flagship Experience Center'}</p>
            <p className="text-neutral-300 text-xs leading-relaxed mb-4">
              {isAr ? 'المحور المركزي، مدينة الشيخ زايد' : 'Central Spine, Sheikh Zayed City'}
            </p>
            <span className="text-xs text-red-500 font-bold block">{t('support.openDaily', 'Open Daily')}</span>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-red-500 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">{isAr ? 'فرع المعادي' : 'Maadi Branch'}</h4>
            <p className="text-neutral-400 text-xs mb-3">{isAr ? 'خدمة سريعة وقطع غيار' : 'Express Service & Spare Parts'}</p>
            <p className="text-neutral-300 text-xs leading-relaxed mb-4">
              {isAr ? 'شارع اللاسلكي، المعادي الجديدة، القاهرة' : 'Laselky St, New Maadi, Cairo'}
            </p>
            <span className="text-xs text-red-500 font-bold block">{t('support.openDaily', 'Open Daily')}</span>
          </div>

        </div>
      </section>

    </div>
  );
}
