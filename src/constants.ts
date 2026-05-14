import { TierItem } from './types';

export const MAAT_CONFESSIONS: TierItem[] = [
  // פשעים נגד אדם ורכוש
  { id: 'm1', name: 'לא רצחתי' },
  { id: 'm2', name: 'לא גנבתי' },
  // חטאים שבין אדם לחברו ולחברה
  { id: 'm9', name: 'לא אמרתי שקרים' },
  { id: 'm10', name: 'לא גרמתי לאיש לבכות' },
  { id: 'm11', name: 'לא התנהגתי ביהירות או בגאווה יתרה' },
  { id: 'm12', name: 'לא הייתי חמום מוח' },
  { id: 'm14', name: 'לא הייתי רכלן' },
  { id: 'm15', name: 'לא הטעיתי איש' },
  { id: 'm22', name: 'לא בזבזתי את זמני' },
  // חטאים דתיים וקוסמיים
  { id: 'm26', name: 'לא הייתי חמדן' },
  { id: 'm28', name: 'לא ביצעתי ניאוף' },
  { id: 'm30', name: 'לא הייתי קצר רוח' },
  { id: 'm35', name: 'לא פעלתי ברשעות' },
];

export const BUSHIDO_VIRTUES: TierItem[] = [
  { id: 'b1', name: 'יושרה (Gi): הגינות וצדק מוחלט' },
  { id: 'b2', name: 'אומץ (Yu): גבורה נוכח קושי' },
  { id: 'b3', name: 'חמלה (Jin): עזרה לחלש וטוב לב' },
  { id: 'b4', name: 'כבוד (Rei): אדיבות ונימוס קיצוני' },
  { id: 'b5', name: 'כנות (Makoto): אמירת אמת מוחלטת' },
  { id: 'b6', name: 'כבוד עצמי (Meiyo): שמירה על השם הטוב' },
  { id: 'b7', name: 'נאמנות (Chugi): מסירות למנהיג ולמשפחה' },
];

export const DEFAULT_TIERS = [
  { id: 's', name: 'S', color: '#ff7f7f' },
  { id: 'a', name: 'A', color: '#ffbf7f' },
  { id: 'b', name: 'B', color: '#ffff7f' },
  { id: 'c', name: 'C', color: '#7fff7f' },
  { id: 'd', name: 'D', color: '#7fbfff' },
  { id: 'e', name: 'E', color: '#7f7fff' },
];
