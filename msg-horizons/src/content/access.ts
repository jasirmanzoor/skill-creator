import type { Locale } from "@/content/i18n";

/**
 * Copy for the live estimator's section and its sign-in (components/estimator/EstimatorSection.tsx).
 * Signing in sends the visitor's name and mobile to MSG through /api/lead (interest "estimator_signin"),
 * so every visitor who prices a delivery reaches the team as a lead. Their answer to "may we help?" is sent
 * the same way (interest "estimator_help_yes" / "estimator_help_no").
 */
type Copy = {
  eyebrow: string;
  title: string;
  lead: string;
  gate: {
    title: string;
    body: string;
    name: string;
    phone: string;
    phoneHint: string;
    company: string;
    optional: string;
    consent: string;
    submit: string;
    sending: string;
    privacy: string;
    errors: { required: string; phone: string; consent: string; network: string };
  };
  welcome: {
    hello: string; // {name}
    ask: string;
    yes: string;
    no: string;
    thanks: string;
    later: string;
    wa: string; // {name} {orders}
  };
};

export const accessCopy: Record<Locale, Copy> = {
  en: {
    eyebrow: "Live estimator",
    title: "See your price, then your plan.",
    lead: "Pick your profile, set your daily orders, cash share and area. MSG's rate card answers as you move, and one tap turns it into a plan.",
    gate: {
      title: "Sign in to open the estimator",
      body: "Your name and mobile number open MSG's live prices. It takes ten seconds, and our team is on hand if you'd like help.",
      name: "Your name",
      phone: "Mobile (WhatsApp)",
      phoneHint: "05X XXX XXXX",
      company: "Company",
      optional: "optional",
      consent: "MSG Horizons may contact me on WhatsApp or by phone about my enquiry.",
      submit: "Open the estimator",
      sending: "Opening…",
      privacy: "Used only to follow up on your enquiry. Never shared.",
      errors: {
        required: "This field is required",
        phone: "Please enter a valid mobile number",
        consent: "Please agree so we can follow up",
        network: "Something went wrong. Please try again.",
      },
    },
    welcome: {
      hello: "Welcome, {name}. We're happy to see you here.",
      ask: "We see you're browsing service prices. May we help and assist?",
      yes: "Yes, please help me",
      no: "No thanks, I'll browse",
      thanks: "Thank you. Our team will message you on WhatsApp shortly.",
      later: "Need help later? Chat with MSG on WhatsApp.",
      wa: "Hello MSG Horizons, I'm {name}. I'm using the live estimator (about {orders} orders a day) and I'd like some help.",
    },
  },
  ar: {
    eyebrow: "المقدّر المباشر",
    title: "شاهد سعرك، ثم خطتك.",
    lead: "اختر ملفك، وحدد طلباتك اليومية ونسبة الدفع النقدي والمنطقة. جدول أسعار ام اس جي يجيبك مباشرة، وبنقرة واحدة يتحول إلى خطة.",
    gate: {
      title: "سجّل الدخول لفتح المقدّر",
      body: "اسمك ورقم جوالك يفتحان أسعار ام اس جي المباشرة. يستغرق الأمر عشر ثوانٍ، وفريقنا جاهز إن أردت المساعدة.",
      name: "اسمك",
      phone: "الجوال (واتساب)",
      phoneHint: "05X XXX XXXX",
      company: "الشركة",
      optional: "اختياري",
      consent: "أوافق على أن تتواصل معي ام اس جي هورايزونز عبر واتساب أو الهاتف بخصوص استفساري.",
      submit: "افتح المقدّر",
      sending: "جارٍ الفتح…",
      privacy: "نستخدمها فقط للمتابعة بخصوص استفسارك، ولا نشاركها أبداً.",
      errors: {
        required: "هذا الحقل مطلوب",
        phone: "يرجى إدخال رقم جوال صحيح",
        consent: "يرجى الموافقة لنتمكن من المتابعة",
        network: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      },
    },
    welcome: {
      hello: "أهلاً {name}، يسعدنا وجودك هنا.",
      ask: "نراك تتصفح أسعار الخدمات. هل يمكننا مساعدتك؟",
      yes: "نعم، ساعدوني",
      no: "لا شكراً، سأتصفح",
      thanks: "شكراً لك. سيتواصل معك فريقنا عبر واتساب قريباً.",
      later: "تحتاج مساعدة لاحقاً؟ تحدث مع ام اس جي عبر واتساب.",
      wa: "مرحباً ام اس جي هورايزونز، أنا {name}. أستخدم المقدّر المباشر (نحو {orders} طلب يومياً) وأود الحصول على مساعدة.",
    },
  },
};
