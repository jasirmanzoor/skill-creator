import type { Locale } from "@/content/i18n";
import type { Persona } from "@/lib/planner";

/**
 * First-20-second copy. Facts only — no SLAs, prices or customs.
 * Kept beside the dictionaries so the opening can ship without rewriting 400-line files.
 */
export const openingCopy: Record<
  Locale,
  {
    certainty: string;
    whoPrompt: string;
    personas: Record<Persona, string>;
  }
> = {
  en: {
    certainty: "Riyadh-based. Already operating. One accountable last mile.",
    whoPrompt: "Who are you? The plan starts on this screen.",
    personas: {
      seller: "You sell. We take the order to the door.",
      startup: "Launch the product. Delivery is already built.",
      ecommerce: "Orders every day. The network already spans the Kingdom.",
      enterprise: "Inspect the operation before you hand over volume.",
      platform: "Couriers, fleet and peak capacity into your network.",
    },
  },
  ar: {
    certainty: "من الرياض. تعمل الآن. ميل أخير واحد مسؤول.",
    whoPrompt: "من أنت؟ نبدأ خطتك من هنا.",
    personas: {
      seller: "أنت تبيع. نحن نوصل الطلب إلى الباب.",
      startup: "أطلق منتجك. التوصيل مبني جاهز.",
      ecommerce: "طلبات كل يوم. الشبكة تغطي المملكة.",
      enterprise: "افحص العملية قبل أن تسلّم الحجم.",
      platform: "مناديب وأسطول وطاقة ذروة داخل شبكتك.",
    },
  },
};
