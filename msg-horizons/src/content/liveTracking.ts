import type { Locale } from "./i18n";

/**
 * Live tracking section (src/components/live). The mechanism is as MSG described it (see
 * docs/CONTENT-NOTES.md): the driver gets a request on their phone, approves it, and from then on the
 * seller and their customer see the driver's live location. The demo uses sample places and generic
 * UI, so it carries no times, prices, names or percentages.
 */
export type LiveCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  steps: { t: string; d: string }[];
  stepsLabel: string;
  tryIt: string;
  replay: string;
  /** read out by screen readers when the demo changes state */
  announce: { waiting: string; live: string };
  driver: {
    app: string;
    online: string;
    request: string;
    pickup: string;
    drop: string;
    pickupPlace: string;
    dropPlace: string;
    consent: string;
    approve: string;
    liveTitle: string;
    liveBody: string;
    seeing: string;
    viewers: [string, string];
    label: string;
  };
  tracker: {
    title: string;
    chipWaiting: string;
    chipLive: string;
    waitingTitle: string;
    waitingHint: string;
    mapPickup: string;
    mapDrop: string;
    driverName: string;
    subWaiting: string;
    subLive: string;
    rail: [string, string, string];
    label: string;
  };
  compare: {
    title: string;
    stages: [string, string, string, string];
    scan: { t: string; d: string; gap: string };
    live: { t: string; d: string };
    summary: string;
  };
  note: string;
  cta: string;
};

export const liveCopy: Record<Locale, LiveCopy> = {
  en: {
    eyebrow: "Live tracking",
    title: "Live from the moment your driver says yes.",
    lead: "Scan-based tracking only updates when a parcel is scanned at a hub. With MSG, once the driver accepts the request, you and your customer see the driver's real location on a live map.",
    stepsLabel: "How live tracking starts",
    steps: [
      { t: "The driver gets a request", d: "When a delivery is assigned, the request lands on the driver's phone." },
      { t: "The driver approves", d: "Nothing is shared until they say yes. One tap and tracking begins." },
      { t: "You watch it live", d: "Sellers and their customers follow the driver on a live map." },
    ],
    tryIt: "Try it: tap Approve",
    replay: "Replay",
    announce: {
      waiting: "Waiting for the driver to approve. No location is shared yet.",
      live: "The driver approved. Their live location is now on the map.",
    },
    driver: {
      app: "MSG Driver",
      online: "Online",
      request: "New delivery request",
      pickup: "Pickup",
      drop: "Drop-off",
      pickupPlace: "Olaya",
      dropPlace: "Al Rawdah",
      consent: "Approve to share your live location with the sender for this delivery. Nothing is shared until you do.",
      approve: "Approve",
      liveTitle: "Live location is on",
      liveBody: "Sharing with the sender and their customer",
      seeing: "Seeing your live location",
      viewers: ["The sender", "Their customer"],
      label: "Driver's phone",
    },
    tracker: {
      title: "Order tracking",
      chipWaiting: "Waiting for driver",
      chipLive: "Live",
      waitingTitle: "Live location starts when the driver approves",
      waitingHint: "Tap Approve on the driver's phone",
      mapPickup: "Pickup",
      mapDrop: "Delivery",
      driverName: "Your MSG driver",
      subWaiting: "Not sharing yet",
      subLive: "Live location from the driver's phone",
      rail: ["Order confirmed", "On the way", "Delivered"],
      label: "What you and your customer see",
    },
    compare: {
      title: "What you see, and when",
      stages: ["Picked up", "Hub scan", "Out for delivery", "Delivered"],
      scan: { t: "Scan-based tracking", d: "Updates only when a parcel is scanned", gap: "no updates" },
      live: { t: "MSG live tracking", d: "The driver's live location, once approved" },
      summary: "Scan-based tracking shows an update only at each scan. MSG live tracking shows the driver's location continuously once the driver approves.",
    },
    note: "Illustrative demo with sample places. Live tracking starts when the driver approves the request.",
    cta: "Plan deliveries with live tracking",
  },
  ar: {
    eyebrow: "التتبع المباشر",
    title: "مباشر منذ اللحظة التي يوافق فيها المندوب.",
    lead: "التتبع المعتمد على المسح لا يتحدّث إلا عند مسح الشحنة داخل المركز. مع مسج، بمجرد أن يقبل المندوب الطلب، تشاهد أنت وعميلك موقعه الحقيقي على خريطة مباشرة.",
    stepsLabel: "كيف يبدأ التتبع المباشر",
    steps: [
      { t: "المندوب يستلم الطلب", d: "عند إسناد التوصيلة، يصل الطلب إلى جوال المندوب." },
      { t: "المندوب يوافق", d: "لا تتم مشاركة أي شيء قبل موافقته. بنقرة واحدة يبدأ التتبع." },
      { t: "تتابعه مباشرةً", d: "يتابع التجار وعملاؤهم المندوب على خريطة مباشرة." },
    ],
    tryIt: "جرّبها: اضغط «موافق»",
    replay: "أعد العرض",
    announce: {
      waiting: "بانتظار موافقة المندوب. لم تتم مشاركة أي موقع بعد.",
      live: "وافق المندوب. موقعه المباشر ظاهر الآن على الخريطة.",
    },
    driver: {
      app: "مندوب مسج",
      online: "متصل",
      request: "طلب توصيل جديد",
      pickup: "الاستلام",
      drop: "التسليم",
      pickupPlace: "العليا",
      dropPlace: "الروضة",
      consent: "وافق لمشاركة موقعك المباشر مع المرسل خلال هذه التوصيلة. لا تتم مشاركة أي شيء قبل موافقتك.",
      approve: "موافق",
      liveTitle: "الموقع المباشر يعمل",
      liveBody: "تتم المشاركة مع المرسل وعميله",
      seeing: "يشاهدون موقعك المباشر",
      viewers: ["المرسل", "عميل المرسل"],
      label: "جوال المندوب",
    },
    tracker: {
      title: "تتبّع الطلب",
      chipWaiting: "بانتظار المندوب",
      chipLive: "مباشر",
      waitingTitle: "يبدأ الموقع المباشر عند موافقة المندوب",
      waitingHint: "اضغط «موافق» على جوال المندوب",
      mapPickup: "الاستلام",
      mapDrop: "التسليم",
      driverName: "مندوب مسج الخاص بك",
      subWaiting: "لم تبدأ المشاركة بعد",
      subLive: "الموقع المباشر من جوال المندوب",
      rail: ["تم تأكيد الطلب", "في الطريق", "تم التسليم"],
      label: "ما تراه أنت وعميلك",
    },
    compare: {
      title: "ما تراه، ومتى",
      stages: ["تم الاستلام", "مسح في المركز", "خرجت للتوصيل", "تم التسليم"],
      scan: { t: "التتبع بالمسح", d: "يتحدّث فقط عند مسح الشحنة", gap: "بلا تحديثات" },
      live: { t: "التتبع المباشر من مسج", d: "موقع المندوب المباشر بعد موافقته" },
      summary: "التتبع بالمسح لا يُظهر تحديثًا إلا عند كل عملية مسح. أما التتبع المباشر من مسج فيُظهر موقع المندوب باستمرار بعد موافقته.",
    },
    note: "عرض توضيحي بأماكن تجريبية. يبدأ التتبع المباشر عند موافقة المندوب على الطلب.",
    cta: "خطّط توصيلاتك مع التتبع المباشر",
  },
};
