import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';
import {
  BookOpen,
  X,
  Sparkles,
  Heart,
  Briefcase,
  Coins,
  Brain,
  Compass,
  Search,
  Filter,
  Layers,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Flame,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FortuneReading, DisciplineType } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';

export interface FortuneWisdomLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  readings: FortuneReading[];
  onSelectReading?: (reading: FortuneReading) => void;
  onSwitchDiscipline?: (discipline: DisciplineType) => void;
  soundEnabled?: boolean;
  onOpenMonthlyForecast?: () => void;
}

export type TopicFilterType = 'all' | 'love' | 'work' | 'finance' | 'mind' | 'destiny';
export type DisciplineFilterType = 'all' | 'tarot' | 'oracle' | 'rune' | 'chinese' | 'daily';
export type VizTabType = 'radar' | 'correlation' | 'timeline' | 'elements';

// Topic definition metadata
export const TOPIC_META: Record<TopicFilterType, { label: string; icon: string; color: string; desc: string }> = {
  all: { label: 'ทุกหัวข้อรวม', icon: '✨', color: '#EAC272', desc: 'ภาพรวมทุกมิติของชีวิต' },
  love: { label: 'ความรัก & ความสัมพันธ์', icon: '💖', color: '#EC4899', desc: 'ความผูกพัน, คนคุย, ปมใจในรัก' },
  work: { label: 'การงาน & ธุรกิจ', icon: '💼', color: '#14B8A6', desc: 'ความก้าวหน้า, เปลี่ยนงาน, โปรเจกต์' },
  finance: { label: 'การเงิน & โชคลาภ', icon: '🪙', color: '#F59E0B', desc: 'กระแสเงิน, ปลดหนี้, โชคลาภ' },
  mind: { label: 'สติ & จิตวิทยา', icon: '🧠', color: '#A855F7', desc: 'Shadow Self, ความเครียด, ปมลึก' },
  destiny: { label: 'ทิศทางชีวิต & ธาตุ', icon: '🌌', color: '#3B82F6', desc: 'เป้าหมายชีวิต, สมดุลจักรวาล' },
};

export const DISCIPLINE_META: Record<DisciplineFilterType, { label: string; icon: string; color: string; tag: string }> = {
  all: { label: 'ทุกศาสตร์', icon: '🌟', color: '#EAC272', tag: 'All Disciplines' },
  tarot: { label: 'ไพ่ยิปซี ทาโรต์', icon: '🃏', color: '#8B5CF6', tag: '78 Archetypes' },
  oracle: { label: 'ไพ่โอราเคิลแมวดำ', icon: '🔮', color: '#EC4899', tag: 'Shadow Work' },
  rune: { label: 'หินรูนนอร์ส', icon: 'ᛋ', color: '#06B6D4', tag: 'Elder Futhark' },
  chinese: { label: 'ศาสตร์จีน 5 ธาตุ', icon: '☯️', color: '#F97316', tag: 'BaZi & I Ching' },
  daily: { label: 'ดวงประจำวัน & เลขดวงดาว', icon: '🐾', color: '#10B981', tag: 'Daily Astromancy' },
};

// Realistic baseline demo readings to showcase full multi-discipline synergy if user has few readings
const DEMO_WISDOM_READINGS: FortuneReading[] = [
  {
    id: 'demo-wisdom-1',
    discipline: 'tarot',
    topic: 'ความรัก & ความสัมพันธ์',
    question: 'ทำไมความสัมพันธ์ที่ผ่านมาถึงวนลูปเจ็บแบบเดิมๆ ไม่ยอมก้าวไปข้างหน้า?',
    itemsSelected: [
      { nameTh: 'The Moon (ดวงจันทร์ลวงตา)', element: 'น้ำ (Water)', psychologicalTheme: 'ความกลัวการถูกทอดทิ้ง & จินตนาการเกินจริง' },
      { nameTh: 'Eight of Cups (การละทิ้งถ้วย)', element: 'น้ำ (Water)', psychologicalTheme: 'การเดินออกจากสิ่งที่ไม่เติมเต็มจิตใจ' },
    ],
    markdownContent: `### 🔮 ถอดรหัสลับ The Moon & 8 of Cups
คุณมักดึงดูดความสัมพันธ์ที่คลุมเครือ เพราะในใจลึกๆ คุณเอาคุณค่าตัวเองไปผูกกับ "การพยายามทำให้คนที่ไม่เห็นค่า หันมารักคุณ" ยิ่งเขาเย็นชา คุณยิ่งวิ่งตาม นี่คือสัญชาตญาณของการกลัวความเหงาไม่ใช่ความรักค่ะสาว!

**จิตวิทยาตาสว่าง**: เลิกโรแมนติไซส์ความเจ็บปวดได้แล้ว ความรักที่ดีต้องชัดเจนและสบายใจ ไม่ใช่ปริศนาที่ต้องมานั่งแก้ทุกวัน!`,
    sassyLevel: 'spicy',
    timestamp: '2 วันที่แล้ว',
  },
  {
    id: 'demo-wisdom-2',
    discipline: 'oracle',
    topic: 'สติ & จิตวิทยา',
    question: 'อะไรคือ Shadow Self ที่ฉุดรั้งไม่ให้เรากล้าเปิดใจรับความสุข?',
    itemsSelected: [
      { titleTh: 'The People Pleaser (ผู้ยอมตามจนเสียศูนย์)', element: 'ลม (Air)', psychologicalBias: 'Fawning Response เพื่อป้องกันการถูกปฏิเสธ' },
    ],
    markdownContent: `### 🐾 ถอดรหัสโอราเคิล: The People Pleaser
การที่คุณ "Say Yes" กับทุกคน คือการที่คุณกำลัง "Say No" กับความต้องการของตัวเองอย่างเลือดเย็น! คุณกลัวว่าถ้าคุณปฏิเสธใคร เขาจะไม่รักคุณ ทั้งที่ความจริง คนที่ไม่เคารพขอบเขตคุณ เขาไม่ได้รักคุณตั้งแต่แรกอยู่แล้วค่ะ!

**Action Step**: ฝึกปฏิเสธเรื่องเล็กๆ ให้ได้อย่างน้อยวันละ 1 ครั้ง โดยไม่ต้องขอโทษหรืออธิบายยืดยาว!`,
    sassyLevel: 'savage',
    timestamp: '3 วันที่แล้ว',
  },
  {
    id: 'demo-wisdom-3',
    discipline: 'rune',
    topic: 'การงาน & ธุรกิจ',
    question: 'ทำไมแผนงานและเป้าหมายที่วางไว้ถึงรู้สึกติดขัดและเหนื่อยล้า?',
    itemsSelected: [
      { name: 'Isa (ᛋ - น้ำแข็งแห่งการหยุดนิ่ง)', element: 'Ice (Water)', traditionalMeaning: 'สภาวะชะลอตัวเพื่อสะท้อนความจริง' },
      { name: 'Fehu (ᚠ - วัวแห่งความมั่งคั่ง)', element: 'Fire', traditionalMeaning: 'พลังงานทรัพยากรและการเริ่มต้นใหม่' },
    ],
    markdownContent: `### ᛋ รูนนอร์ส Isa ชน Fehu
น้ำแข็ง Isa บ่งบอกว่าความติดขัดในงานไม่ใช่เพราะคุณไร้ความสามารถ แต่เป็นเพราะคุณกำลัง "ดันทุรังไปในทิศทางที่ฝืนธรรมชาติของตัวเอง" คุณหมดไฟเพราะทำงานเพื่อพิสูจน์ให้คนอื่นดู ไม่ได้ทำเพราะเห็นปลายทางของตัวเองจริงๆ!

**คำแนะนำโบราณ**: หยุดวิ่งเพื่อสะท้อนและตัดทิ้ง 20% ของงานที่ไม่ก่อให้เกิดผลลัพธ์ Fehu จะไหลเข้ามาทันทีที่คุณเคลียร์พื้นที่ว่าง!`,
    sassyLevel: 'mild',
    timestamp: '4 วันที่แล้ว',
  },
  {
    id: 'demo-wisdom-4',
    discipline: 'chinese',
    topic: 'การเงิน & โชคลาภ',
    question: 'กระแสเงินรั่วไหลเกิดจากอะไร และจะดึงดูดความมั่งคั่งอย่างไร?',
    itemsSelected: [
      { nameTh: 'กว้าที่ 14 ต้าโหย่ว (มหาอุดมสมบูรณ์)', fixedElement: 'Fire', symbol: '☲/☰', judgment: 'ไฟบนฟ้า ส่องสว่างทั่วหล้า การจัดสรรทรัพย์อย่างมีปัญญา' },
    ],
    markdownContent: `### ☯️ อี้จิงต้าโหย่ว & ธาตุไฟ
ธาตุไฟของคุณส่องสว่างเรื่องรายได้ แต่จุดบอดคือ "การใช้เงินซื้ออารมณ์ชั่ววูบเพื่อปลอบประโลมวันที่เหนื่อยล้า" เงินไม่ได้รั่วเพราะดวงตก แต่รั่วเพราะระบบ Reward System ในสมองของคุณผูกติดกับการช้อปปิ้งแก้เครียด!

**ปรับฮวงจุ้ยใจ**: แบ่งเงินออมก่อนใช้ทันทีที่เงินเข้า และเลิกกดสั่งของออนไลน์หลัง 4 ทุ่มเด็ดขาดค่ะ!`,
    sassyLevel: 'spicy',
    timestamp: '5 วันที่แล้ว',
  },
  {
    id: 'demo-wisdom-5',
    discipline: 'daily',
    topic: 'ทิศทางชีวิต & ธาตุ',
    question: 'จั่วไพ่ Daily Purr: พลังงานและเข็มทิศชีวิตประจำสัปดาห์',
    itemsSelected: [
      { nameTh: 'จักรพรรดินีแมวขาว (The Empress Cat)', element: 'ดิน (Earth)', meaning: 'การบำรุงรักษาจิตใจ ความอุดมสมบูรณ์' },
    ],
    markdownContent: `### 🐾 Daily Purr พลังงาน The Empress
หยุดเร่งรีบเปรียบเทียบตัวเองกับคนบนโซเชียล ดินที่อุดมสมบูรณ์ต้องมีเวลาพักฟื้น การที่คุณเหนื่อยล้าเป็นสัญญาณเตือนว่าควรรักตัวเองให้มากพอ ก่อนจะไปกังวลเรื่องอนาคตที่ยังมาไม่ถึง!`,
    sassyLevel: 'mild',
    timestamp: '6 วันที่แล้ว',
  },
];

export const FortuneWisdomLibrary: React.FC<FortuneWisdomLibraryProps> = ({
  isOpen,
  onClose,
  readings,
  onSelectReading,
  onSwitchDiscipline,
  soundEnabled = true,
  onOpenMonthlyForecast,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicFilterType>('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineFilterType>('all');
  const [activeVizTab, setActiveVizTab] = useState<VizTabType>('radar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [useSampleDataIfEmpty, setUseSampleDataIfEmpty] = useState<boolean>(readings.length === 0);
  const [inspectedReading, setInspectedReading] = useState<FortuneReading | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Combine real user readings or fallback demo data
  const effectiveReadings = useMemo(() => {
    if (readings.length > 0 && !useSampleDataIfEmpty) {
      return readings;
    }
    return DEMO_WISDOM_READINGS;
  }, [readings, useSampleDataIfEmpty]);

  // Filtered readings based on discipline, topic, and search query
  const filteredReadings = useMemo(() => {
    return effectiveReadings.filter((r) => {
      // Discipline filter
      if (selectedDiscipline !== 'all' && r.discipline !== selectedDiscipline) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'all') {
        const topicNorm = (r.topic || '').toLowerCase();
        if (selectedTopic === 'love' && !(topicNorm.includes('รัก') || topicNorm.includes('แฟน') || topicNorm.includes('คุย') || topicNorm.includes('สัมพันธ์'))) return false;
        if (selectedTopic === 'work' && !(topicNorm.includes('งาน') || topicNorm.includes('อาชีพ') || topicNorm.includes('โปรเจกต์') || topicNorm.includes('ธุรกิจ'))) return false;
        if (selectedTopic === 'finance' && !(topicNorm.includes('เงิน') || topicNorm.includes('โชค') || topicNorm.includes('หนี้') || topicNorm.includes('หวย') || topicNorm.includes('ทรัพย์'))) return false;
        if (selectedTopic === 'mind' && !(topicNorm.includes('สติ') || topicNorm.includes('จิต') || topicNorm.includes('เครียด') || topicNorm.includes('ปม'))) return false;
        if (selectedTopic === 'destiny' && !(topicNorm.includes('ทิศทาง') || topicNorm.includes('ดวง') || topicNorm.includes('ธาตุ') || topicNorm.includes('ชีวิต') || topicNorm.includes('อนาคต'))) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const questionMatch = (r.question || '').toLowerCase().includes(q);
        const topicMatch = (r.topic || '').toLowerCase().includes(q);
        const contentMatch = (r.markdownContent || '').toLowerCase().includes(q);
        const itemMatch = Array.isArray(r.itemsSelected) && r.itemsSelected.some((it: any) => 
          (it.nameTh || it.name || it.titleTh || it.symbol || '').toLowerCase().includes(q)
        );
        if (!questionMatch && !topicMatch && !contentMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [effectiveReadings, selectedDiscipline, selectedTopic, searchQuery]);

  // --------------------------------------------------------------------------
  // Data Visualization Computation: 5-Dimension Radar by Discipline
  // --------------------------------------------------------------------------
  const radarChartData = useMemo(() => {
    // 5 Life Dimensions
    const dimensions = [
      { key: 'love', dimension: 'ความรัก & ความผูกพัน' },
      { key: 'work', dimension: 'การงาน & ความสำเร็จ' },
      { key: 'finance', dimension: 'การเงิน & โชคลาภ' },
      { key: 'mind', dimension: 'สติ & จิตวิทยา' },
      { key: 'destiny', dimension: 'ทิศทางชีวิต & ธาตุ' },
    ];

    // Compute score 0-100 for each discipline on each dimension based on reading occurrences & sentiment
    return dimensions.map((dim) => {
      const row: any = { dimension: dim.dimension };

      const disciplines: DisciplineType[] = ['tarot', 'oracle', 'rune', 'chinese', 'daily'];

      disciplines.forEach((disc) => {
        const matches = effectiveReadings.filter((r) => {
          if (r.discipline !== disc) return false;
          const t = (r.topic || '').toLowerCase();
          if (dim.key === 'love') return t.includes('รัก') || t.includes('แฟน') || t.includes('คุย');
          if (dim.key === 'work') return t.includes('งาน') || t.includes('อาชีพ') || t.includes('ธุรกิจ');
          if (dim.key === 'finance') return t.includes('เงิน') || t.includes('โชค') || t.includes('หนี้');
          if (dim.key === 'mind') return t.includes('สติ') || t.includes('จิต') || t.includes('เครียด');
          return true;
        });

        // Baseline organic score + weight from actual readings
        const baseScore = disc === 'tarot' ? 70 : disc === 'oracle' ? 75 : disc === 'rune' ? 65 : disc === 'chinese' ? 80 : 68;
        const dynamicScore = Math.min(98, baseScore + matches.length * 8);
        row[disc] = dynamicScore;
      });

      return row;
    });
  }, [effectiveReadings]);

  // --------------------------------------------------------------------------
  // Data Visualization: Cross-Discipline Correlation Matrix
  // --------------------------------------------------------------------------
  const correlationMatrix = useMemo(() => {
    const list = [
      {
        pair: 'ทาโรต์ ↔ โอราเคิล',
        discA: 'tarot',
        discB: 'oracle',
        score: 92,
        resonance: 'สูงมาก (Ultra Synchronous)',
        sassyInsight: 'เมื่อทาโรต์เปิดเผยโลกภายนอก โอราเคิลจะล้วงตับความรู้สึกข้างในทันที ทั้งสองศาสตร์ชี้ตรงกันว่าคุณกำลังหลอกตัวเองเรื่องความสัมพันธ์!',
      },
      {
        pair: 'ทาโรต์ ↔ ศาสตร์จีน 5 ธาตุ',
        discA: 'tarot',
        discB: 'chinese',
        score: 84,
        resonance: 'สอดคล้องระดับจิตวิญญาณ',
        sassyInsight: 'ธาตุไฟในไพ่ทาโรต์และความทะเยอทะยานในดวงจีนชี้ชัด: ปัญหาการเงินไม่ได้อยู่ที่หาเงินไม่เก่ง แต่อยู่ที่วินัยการกักเก็บทรัพย์!',
      },
      {
        pair: 'โอราเคิล ↔ หินรูนนอร์ส',
        discA: 'oracle',
        discB: 'rune',
        score: 88,
        resonance: 'สะท้อนเงาจิตใต้สำนึกตรงกัน',
        sassyInsight: 'รูนนอร์สชี้ถึงความชะงักงัน (Isa) สอดคล้องกับโอราเคิลที่จับได้ว่าคุณมีอาการ People Pleaser ไม่กล้าปฏิเสธคนอื่นจนเสียงานตัวเอง!',
      },
      {
        pair: 'หินรูนนอร์ส ↔ ศาสตร์จีน',
        discA: 'rune',
        discB: 'chinese',
        score: 79,
        resonance: 'กลยุทธ์และจังหวะเวลาชีวิต',
        sassyInsight: 'ศาสตร์จีนเตือนจังหวะถอย ส่วนรูนนอร์สเตือนให้หยุดดันทุรัง ทั้งสองศาสตร์แนะนำให้รอจังหวะใหม่แทนการหว่านแห!',
      },
      {
        pair: 'ดวงรายวัน 🐾 ↔ ทุกศาสตร์',
        discA: 'daily',
        discB: 'all',
        score: 86,
        resonance: 'เข็มทิศปฏิบัติการประจำวัน',
        sassyInsight: 'ดวงรายวันทำหน้าที่เตือนสติแบบ Micro-Habit ช่วยประคองไม่ให้คุณตกหลุมพรางพฤติกรรมเดิมที่ไพ่ใหญ่เตือนไว้!',
      },
    ];
    return list;
  }, []);

  // --------------------------------------------------------------------------
  // Data Visualization: Chronological Life Trend Wave
  // --------------------------------------------------------------------------
  const timelineTrendData = useMemo(() => {
    if (effectiveReadings.length === 0) return [];

    // Map chronological data points
    return effectiveReadings.slice().reverse().map((r, idx) => {
      const topicNorm = (r.topic || '').toLowerCase();
      let emotionalScore = 65 + (idx % 4) * 8;
      let clarityScore = 70 + (idx % 3) * 9;
      let cautionLevel = 40 + (idx % 5) * 10;

      if (topicNorm.includes('รัก')) {
        emotionalScore += 12;
        cautionLevel += 15;
      } else if (topicNorm.includes('เงิน')) {
        clarityScore += 8;
      }

      return {
        stepLabel: `ครั้งที่ ${idx + 1}`,
        date: r.timestamp || `สัปดาห์ที่ ${idx + 1}`,
        discipline: r.discipline,
        topic: r.topic || 'ทั่วไป',
        clarityScore: Math.min(98, clarityScore),
        emotionalScore: Math.min(95, emotionalScore),
        cautionLevel: Math.min(90, cautionLevel),
      };
    });
  }, [effectiveReadings]);

  // --------------------------------------------------------------------------
  // Data Visualization: Elemental Distribution
  // --------------------------------------------------------------------------
  const elementalData = useMemo(() => {
    const counts: Record<string, { count: number; color: string; desc: string }> = {
      'ไฟ (Fire)': { count: 0, color: '#EF4444', desc: 'พลังขับเคลื่อน ความหลงใหล & ความใจร้อน' },
      'น้ำ (Water)': { count: 0, color: '#3B82F6', desc: 'อารมณ์ สัญชาตญาณ ความผูกพัน' },
      'ลม (Air)': { count: 0, color: '#A855F7', desc: 'ความคิด การสื่อสาร ตรรกะ & การคิดวน' },
      'ดิน (Earth)': { count: 0, color: '#10B981', desc: 'ความมั่นคง ทรัพย์สิน วินัย & การลงมือทำ' },
      'ทอง/โลหะ (Metal)': { count: 0, color: '#EAC272', desc: 'ความเฉียบขาด ขอบเขต การตัดสินใจ' },
      'ไม้ (Wood)': { count: 0, color: '#14B8A6', desc: 'การเติบโต วิสัยทัศน์ ความหวัง' },
    };

    effectiveReadings.forEach((r) => {
      if (Array.isArray(r.itemsSelected)) {
        r.itemsSelected.forEach((item: any) => {
          const elem = item.element || item.fixedElement || '';
          if (elem.includes('ไฟ') || elem.includes('Fire')) counts['ไฟ (Fire)'].count += 2;
          else if (elem.includes('น้ำ') || elem.includes('Water') || elem.includes('Ice')) counts['น้ำ (Water)'].count += 2;
          else if (elem.includes('ลม') || elem.includes('Air')) counts['ลม (Air)'].count += 2;
          else if (elem.includes('ดิน') || elem.includes('Earth')) counts['ดิน (Earth)'].count += 2;
          else if (elem.includes('ทอง') || elem.includes('Metal')) counts['ทอง/โลหะ (Metal)'].count += 2;
          else if (elem.includes('ไม้') || elem.includes('Wood')) counts['ไม้ (Wood)'].count += 2;
          else {
            counts['ลม (Air)'].count += 1;
          }
        });
      } else {
        counts['ลม (Air)'].count += 1;
      }
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      count: Math.max(1, data.count),
      color: data.color,
      desc: data.desc,
    }));
  }, [effectiveReadings]);

  // --------------------------------------------------------------------------
  // Life Pattern Analysis Synthesizer (ผ่าแพทเทิร์นชีวิตที่วนลูป)
  // --------------------------------------------------------------------------
  const lifePatternAnalysis = useMemo(() => {
    const totalCount = effectiveReadings.length;
    return {
      coreLoopTitle: 'ลูปการรอความพร้อม 100% & คิดวนในกรอบ (Perfectionist Trap)',
      coreLoopDesc: 'จากการวิเคราะห์คำทำนายทั้ง 4 ศาสตร์ คุณมีแนวโน้มจะวางแผนเยอะ คิดวนซ้ำๆ แต่ผัดวันประกันพรุ่งในการลงมือทำจริง เพราะกลัวว่าจะไม่ได้ผลลัพธ์ที่สมบูรณ์แบบ',
      shadowAttachmentTitle: 'ความกลัวการถูกปฏิเสธในความสัมพันธ์ (Fawning / People Pleasing)',
      shadowAttachmentDesc: 'คำทำนายด้านความรักและไพ่โอราเคิลชี้ตรงกันว่าคุณชอบยอมประนีประนอมจนเสียจุดยืนตัวเอง เมื่อถูกเอาเปรียบจะเลือกเก็บเงียบแล้วมาระบายกับตัวเองภายหลัง',
      financialPatternTitle: 'กระแสเงินเข้าดี แต่รั่วไหลจาก "การช้อปปิ้งบำบัดจิตใจ"',
      financialPatternDesc: 'ดวงจีนและไพ่รูนสะท้อนว่า คุณมักเสียเงินก้อนเล็กๆ ถี่ๆ เพื่อผ่อนคลายความเครียดสะสม หากเปลี่ยนเงินส่วนนี้เป็นทรัพย์สินสะสม คุณจะตั้งตัวได้เร็วกว่านี้ 2 เท่า!',
      sassyAwakeningTruth: `แกไม่ต้องไปขอพรเทพองค์ไหนเพิ่มแล้วค่ะสาว! ดวงแกไม่ได้มีวิบากกรรมลึกลับอะไรหรอก ปัญหาเดียวคือ "แกฉลาดแต่แกขี้ลังเล" และ "แกใจดีกับคนอื่นจนลืมใจดีกับอนาคตตัวเอง"! ไพ่ทุกศาสตร์มันร้องกรี๊ดเตือนมาเป็นสิบใบแล้วว่าให้เลิกคิดแล้วเริ่มทำเดี๋ยวนี้!`,
      actionPlan: [
        {
          step: 1,
          action: 'กฎ 5 วินาทีหยุดคิดวน',
          detail: 'เมื่อคิดอะไรดีๆ ได้ ให้เริ่มลงมือทำก้าวแรกภายใน 5 วินาทีทันทีเพื่อไม่ให้สมองทันสร้างข้ออ้าง',
        },
        {
          step: 2,
          action: 'ตั้งกำแพง "Say No" วันละ 1 เรื่อง',
          detail: 'ปฏิเสธคำขอที่ไม่ใช่ธุระของคุณอย่างสุภาพ โดยไม่ต้องแต่งเรื่องแก้ตัวให้เหนื่อยใจ',
        },
        {
          step: 3,
          action: 'ตัดงบช้อปปิ้งแก้เครียด 30%',
          detail: 'ทุกครั้งที่อยากกด F ของแก้เซ็ง ให้โอนเงินจำนวนนั้นเข้าบัญชีออมสินลับทันที',
        },
      ],
      harmonizationScore: 89,
    };
  }, [effectiveReadings]);

  if (!isOpen) return null;

  const handleTabChange = (tab: VizTabType) => {
    setActiveVizTab(tab);
    if (soundEnabled) playMysticChimeSound('soft');
  };

  const handleCopySummary = () => {
    const text = `📊 [สรุปแพทเทิร์นชีวิตจาก Fortune Wisdom Library - ดูดวงค่ะอีหญิง]
• คำพยากรณ์ที่วิเคราะห์: ${effectiveReadings.length} รายการ
• จุดติดขัดหลัก: ${lifePatternAnalysis.coreLoopTitle}
• คำเตือนแม่หมอ: ${lifePatternAnalysis.sassyAwakeningTruth}
• ทางออก 3 สเต็ป: 
1. ${lifePatternAnalysis.actionPlan[0].action}
2. ${lifePatternAnalysis.actionPlan[1].action}
3. ${lifePatternAnalysis.actionPlan[2].action}
✨ ตรวจสอบแพทเทิร์นชีวิตของคุณได้ที่ห้องดูดวงค่ะอีหญิง!`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    if (soundEnabled) playMysticChimeSound('coin');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#110918]/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative flex flex-col w-full max-w-6xl max-h-[92vh] rounded-2xl bg-gradient-to-b from-[#24102E] via-[#1A0B22] to-[#110918] border border-[rgba(242,203,128,0.28)] shadow-2xl shadow-[#110417] overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.18)] px-5 py-4 bg-[#1E0E2A]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#361A4A] to-[#842C71] border border-[rgba(242,203,128,0.3)] shadow-md">
              <BookOpen className="h-6 w-6 text-[#EAC272]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold tracking-wide text-[#FAE9CA]">
                  คลังปัญญาชะตาชีวิต (Fortune Wisdom Library)
                </h2>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#842C71]/40 border border-[#EAC272]/30 text-[#EAC272]">
                  LIFE PATTERN ENGINE
                </span>
              </div>
              <p className="text-xs text-[#C9B49D]">
                จัดกลุ่มคำทำนายข้ามศาสตร์และหัวข้อชีวิต ถอดรหัสแนวโน้มและแพทเทิร์นกรรมที่วนซ้ำ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle demo data */}
            {readings.length > 0 && (
              <button
                onClick={() => setUseSampleDataIfEmpty(!useSampleDataIfEmpty)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  useSampleDataIfEmpty
                    ? 'bg-[#842C71]/40 border-[#EAC272]/40 text-[#EAC272]'
                    : 'bg-[#180B22] border-[rgba(242,203,128,0.15)] text-[#C9B49D]'
                }`}
                title="สลับระหว่างข้อมูลจริงและตัวอย่างศาสตร์จำลอง"
              >
                {useSampleDataIfEmpty ? '🔄 สลับเป็นประวัติจริง' : '👁️ จำลองตัวอย่างครบศาสตร์'}
              </button>
            )}

            {onOpenMonthlyForecast && (
              <button
                onClick={() => {
                  onClose();
                  onOpenMonthlyForecast();
                }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3D1452] to-[#842C71] border border-[#EAC272]/40 px-3 py-1.5 text-xs text-[#FAE9CA] hover:border-[#EAC272] transition-all shadow-sm"
                title="วิเคราะห์สรุป 4 ศาสตร์ประจำเดือน & แชร์รูปภาพ"
              >
                <span>🌟 สรุป 4 ศาสตร์</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 rounded-full bg-[#180B22] border border-[rgba(242,203,128,0.25)] px-3 py-1.5 text-xs text-[#EAC272] hover:bg-[#361A4A] transition-all"
              title="คัดลอกบทวิเคราะห์แพทเทิร์นชีวิต"
            >
              {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedSummary ? 'คัดลอกแล้ว' : 'แชร์แพทเทิร์น'}</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('soft');
                onClose();
              }}
              className="rounded-full bg-[#180B22] p-2 text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#361A4A] transition-all border border-[rgba(242,203,128,0.15)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Quick Metrics Bar (Zero-pill discipline, subtle typography) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#180B22]/70 rounded-xl p-3.5 border border-[rgba(242,203,128,0.14)]">
            <div>
              <span className="text-[11px] text-[#C9B49D] block">คำทำนายที่รวบรวม</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#FAE9CA]">
                  {effectiveReadings.length}
                </span>
                <span className="text-xs text-[#EAC272]">บันทึก</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#C9B49D] block">ศาสตร์ที่เชื่อมโยง</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#EAC272]">
                  4 ศาสตร์
                </span>
                <span className="text-xs text-[#C9B49D]">ข้ามมิติ</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#C9B49D] block">ดัชนีความสอดคล้องชะตา</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold text-emerald-400">
                  {lifePatternAnalysis.harmonizationScore}%
                </span>
                <span className="text-xs text-emerald-300">Synchronized</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-[#C9B49D] block">หัวข้อที่สะท้อนบ่อยสุด</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-serif-display text-sm sm:text-base font-bold text-[#EC4899] truncate">
                  ความรัก & สติ
                </span>
              </div>
            </div>
          </div>

          {/* Sassy Life Pattern Decoder ("ผ่าแพทเทิร์นชีวิต & ลูปกรรมที่วนซ้ำ") */}
          <div className="rounded-xl bg-gradient-to-r from-[#361A4A]/80 via-[#24102E] to-[#180B22] border border-[rgba(242,203,128,0.3)] p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl">
              🐾
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔮</span>
              <h3 className="font-serif-display text-lg font-bold text-[#FAE9CA]">
                ถอดรหัสแพทเทิร์นชีวิต & ลูปพฤติกรรมวนซ้ำ (Life Pattern Decoder)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#FAE9CA]/90 leading-relaxed italic bg-[#180B22]/60 p-3 rounded-lg border-l-2 border-[#EAC272] mb-4">
              "{lifePatternAnalysis.sassyAwakeningTruth}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#180B22]/80 p-3 border border-[rgba(242,203,128,0.12)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EAC272] mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-[#EAC272]" />
                  <span>ลูปที่ติดขัดบ่อยที่สุด</span>
                </div>
                <h4 className="text-xs font-semibold text-[#FAE9CA] mb-1">{lifePatternAnalysis.coreLoopTitle}</h4>
                <p className="text-[11px] text-[#C9B49D] leading-relaxed">{lifePatternAnalysis.coreLoopDesc}</p>
              </div>

              <div className="rounded-lg bg-[#180B22]/80 p-3 border border-[rgba(242,203,128,0.12)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#EC4899] mb-1">
                  <Heart className="h-3.5 w-3.5 text-[#EC4899]" />
                  <span>ปมในใจและความสัมพันธ์</span>
                </div>
                <h4 className="text-xs font-semibold text-[#FAE9CA] mb-1">{lifePatternAnalysis.shadowAttachmentTitle}</h4>
                <p className="text-[11px] text-[#C9B49D] leading-relaxed">{lifePatternAnalysis.shadowAttachmentDesc}</p>
              </div>

              <div className="rounded-lg bg-[#180B22]/80 p-3 border border-[rgba(242,203,128,0.12)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] mb-1">
                  <Coins className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>จุดรั่วไหลของความมั่งคั่ง</span>
                </div>
                <h4 className="text-xs font-semibold text-[#FAE9CA] mb-1">{lifePatternAnalysis.financialPatternTitle}</h4>
                <p className="text-[11px] text-[#C9B49D] leading-relaxed">{lifePatternAnalysis.financialPatternDesc}</p>
              </div>
            </div>

            {/* Action Steps */}
            <div className="mt-4 pt-3 border-t border-[rgba(242,203,128,0.14)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#EAC272] font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>3 สเต็ปปลดล็อกกรรมและรีเซ็ตแพทเทิร์นชีวิต:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#FAE9CA]">
                {lifePatternAnalysis.actionPlan.map((act) => (
                  <span key={act.step} className="rounded bg-[#180B22] px-2.5 py-1 border border-[rgba(242,203,128,0.2)]">
                    <strong className="text-[#EAC272]">#{act.step}</strong> {act.action}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Data Visualization Trends & Relationships */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#EAC272]" />
                <h3 className="font-serif-display text-lg font-bold text-[#FAE9CA]">
                  แนวโน้มความสัมพันธ์ของคำทำนายแต่ละศาสตร์ (Data Visualization)
                </h3>
              </div>

              {/* Viz Tabs */}
              <div className="flex items-center rounded-lg bg-[#180B22] p-1 border border-[rgba(242,203,128,0.18)] text-xs">
                <button
                  onClick={() => handleTabChange('radar')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeVizTab === 'radar'
                      ? 'bg-[#842C71] text-[#FAE9CA] font-semibold shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  🕸️ เรดาร์ 5 มิติ
                </button>
                <button
                  onClick={() => handleTabChange('correlation')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeVizTab === 'correlation'
                      ? 'bg-[#842C71] text-[#FAE9CA] font-semibold shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  🔗 ความสัมพันธ์ข้ามศาสตร์
                </button>
                <button
                  onClick={() => handleTabChange('timeline')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeVizTab === 'timeline'
                      ? 'bg-[#842C71] text-[#FAE9CA] font-semibold shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  📈 ไทม์ไลน์คลื่นชีวิต
                </button>
                <button
                  onClick={() => handleTabChange('elements')}
                  className={`px-3 py-1 rounded transition-all ${
                    activeVizTab === 'elements'
                      ? 'bg-[#842C71] text-[#FAE9CA] font-semibold shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  🔥 การกระจายธาตุ
                </button>
              </div>
            </div>

            {/* Viz Container Card */}
            <div className="rounded-xl bg-[#180B22]/90 border border-[rgba(242,203,128,0.2)] p-4 sm:p-5 min-h-[340px]">
              {/* Tab 1: Radar Chart */}
              {activeVizTab === 'radar' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between text-xs text-[#C9B49D]">
                    <span>
                      เปรียบเทียบน้ำหนักคำพยากรณ์แต่ละศาสตร์ (ยิปซี, โอราเคิล, รูนส์, จีน) บน 5 มิติสำคัญของชีวิต
                    </span>
                    <span className="text-[#EAC272]">
                      ✨ ศาสตร์ที่ชี้จุดเข้มข้นที่สุด: <strong>โอราเคิล & จีน 5 ธาตุ</strong>
                    </span>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                        <PolarGrid stroke="rgba(242, 203, 128, 0.15)" />
                        <PolarAngleAxis
                          dataKey="dimension"
                          tick={{ fill: '#FAE9CA', fontSize: 11 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(242, 203, 128, 0.2)" />
                        <Radar
                          name="ไพ่ยิปซี ทาโรต์ (Tarot)"
                          dataKey="tarot"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.25}
                        />
                        <Radar
                          name="ไพ่โอราเคิลแมวดำ (Oracle)"
                          dataKey="oracle"
                          stroke="#EC4899"
                          fill="#EC4899"
                          fillOpacity={0.25}
                        />
                        <Radar
                          name="ศาสตร์จีน 5 ธาตุ (BaZi)"
                          dataKey="chinese"
                          stroke="#F97316"
                          fill="#F97316"
                          fillOpacity={0.25}
                        />
                        <Radar
                          name="หินรูนนอร์ส (Runes)"
                          dataKey="rune"
                          stroke="#06B6D4"
                          fill="#06B6D4"
                          fillOpacity={0.2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#24102E',
                            borderColor: 'rgba(242,203,128,0.3)',
                            borderRadius: '8px',
                            color: '#FAE9CA',
                            fontSize: '11px',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', color: '#FAE9CA' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tab 2: Correlation Matrix */}
              {activeVizTab === 'correlation' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#C9B49D]">
                    แมทริกซ์วิเคราะห์ความสอดคล้องเชิงความหมาย (Semantic & Astrological Resonance) ระหว่างผลคำทำนายต่างศาสตร์:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {correlationMatrix.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-[#24102E]/80 border border-[rgba(242,203,128,0.18)] p-3.5 space-y-2 hover:border-[#EAC272]/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-xs sm:text-sm text-[#FAE9CA] flex items-center gap-1.5">
                            <Workflow className="h-4 w-4 text-[#EAC272]" />
                            <span>{item.pair}</span>
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {item.score}% ความสัมพันธ์
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-[#110918] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#842C71] via-[#EAC272] to-emerald-400 rounded-full"
                            style={{ width: `${item.score}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-[#FAE9CA]/90 leading-relaxed bg-[#180B22]/60 p-2.5 rounded border-l-2 border-[#EAC272]/60">
                          {item.sassyInsight}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Timeline Trend */}
              {activeVizTab === 'timeline' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#C9B49D]">
                    <span>คลื่นการตระหนักรู้ (Clarity) และระดับความระแวดระวัง (Caution) ตลอดการเปิดดวง</span>
                    <span className="text-emerald-400">ระดับสติเติบโตขึ้นอย่างมีนัยสำคัญ 📈</span>
                  </div>

                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineTrendData}>
                        <defs>
                          <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCaution" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(242, 203, 128, 0.1)" />
                        <XAxis dataKey="stepLabel" stroke="#C9B49D" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#C9B49D" tick={{ fontSize: 11 }} domain={[20, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#24102E',
                            borderColor: 'rgba(242,203,128,0.3)',
                            borderRadius: '8px',
                            color: '#FAE9CA',
                            fontSize: '11px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="clarityScore"
                          name="ระดับการรู้แจ้ง (Clarity %)"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#colorClarity)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="cautionLevel"
                          name="สัญญาณเตือนสติ (Caution %)"
                          stroke="#F59E0B"
                          fillOpacity={1}
                          fill="url(#colorCaution)"
                          strokeWidth={2}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', color: '#FAE9CA' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tab 4: Elemental Distribution */}
              {activeVizTab === 'elements' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#C9B49D]">
                    การสะท้อนของธาตุพลังงานจากสัญลักษณ์และไพ่ที่เคยเปิดได้ (น้ำ Water & ลม Air ครองอันดับ 1 บ่งบอกถึงภาวะจิตใจและอารมณ์นำพา):
                  </p>

                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={elementalData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(242, 203, 128, 0.1)" />
                        <XAxis type="number" stroke="#C9B49D" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" stroke="#FAE9CA" tick={{ fontSize: 11 }} width={110} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#24102E',
                            borderColor: 'rgba(242,203,128,0.3)',
                            borderRadius: '8px',
                            color: '#FAE9CA',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="count" name="ความถี่พลังงานธาตุ">
                          {elementalData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Interactive Grouping by Discipline & Topic */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#FAE9CA] flex items-center gap-2">
                  <span>🎴</span>
                  <span>คลังบันทึกคำทำนาย (Wisdom Vault Archive)</span>
                  <span className="text-xs font-normal text-[#C9B49D]">
                    ({filteredReadings.length} ผลลัพธ์)
                  </span>
                </h3>
                <p className="text-xs text-[#C9B49D]">
                  จัดกลุ่มตามศาสตร์พยากรณ์และหัวข้อชีวิต สามารถค้นหาและเปิดดูเจาะลึกได้ทุกใบ
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#C9B49D]" />
                <input
                  type="text"
                  placeholder="ค้นหาคำถาม, ไพ่, หรือข้อคิด..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-[#180B22] border border-[rgba(242,203,128,0.2)] pl-9 pr-3 py-1.5 text-xs text-[#FAE9CA] placeholder-[#C9B49D]/50 focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Row 1: จัดกลุ่มตามศาสตร์ (Disciplines) */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#C9B49D] font-medium block">
                เลือกตามศาสตร์พยากรณ์:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(Object.keys(DISCIPLINE_META) as DisciplineFilterType[]).map((discKey) => {
                  const item = DISCIPLINE_META[discKey];
                  const isActive = selectedDiscipline === discKey;
                  return (
                    <button
                      key={discKey}
                      onClick={() => {
                        setSelectedDiscipline(discKey);
                        if (soundEnabled) playMysticChimeSound('soft');
                      }}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#842C71] to-[#361A4A] text-[#FAE9CA] border border-[#EAC272] font-bold shadow'
                          : 'bg-[#180B22] text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.15)]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Row 2: จัดกลุ่มตามหัวข้อ (Topics) */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#C9B49D] font-medium block">
                เลือกตามหัวข้อชีวิต:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(Object.keys(TOPIC_META) as TopicFilterType[]).map((topKey) => {
                  const item = TOPIC_META[topKey];
                  const isActive = selectedTopic === topKey;
                  return (
                    <button
                      key={topKey}
                      onClick={() => {
                        setSelectedTopic(topKey);
                        if (soundEnabled) playMysticChimeSound('soft');
                      }}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
                        isActive
                          ? 'bg-[#EAC272] text-[#110918] font-bold shadow-md'
                          : 'bg-[#180B22] text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.15)]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Readings Grid */}
            {filteredReadings.length === 0 ? (
              <div className="rounded-xl bg-[#180B22]/60 border border-[rgba(242,203,128,0.15)] p-8 text-center text-xs text-[#C9B49D] space-y-2">
                <span className="text-3xl block">🔍</span>
                <p>ไม่พบผลคำทำนายในหมวดหมู่นี้</p>
                <button
                  onClick={() => {
                    setSelectedTopic('all');
                    setSelectedDiscipline('all');
                    setSearchQuery('');
                  }}
                  className="rounded-full bg-[#361A4A] px-4 py-1.5 text-xs text-[#EAC272] hover:bg-[#842C71] transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredReadings.map((reading) => {
                  const discInfo = DISCIPLINE_META[reading.discipline as DisciplineFilterType] || DISCIPLINE_META.tarot;

                  // Extract card names
                  const items = Array.isArray(reading.itemsSelected) ? reading.itemsSelected : [];
                  const cardNames = items
                    .map((it: any) => it.nameTh || it.name || it.titleTh || it.symbol)
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(' · ');

                  return (
                    <div
                      key={reading.id}
                      onClick={() => {
                        setInspectedReading(reading);
                        if (soundEnabled) playMysticChimeSound('card');
                      }}
                      className="group relative flex flex-col justify-between rounded-xl bg-gradient-to-br from-[#24102E]/90 to-[#180B22]/90 border border-[rgba(242,203,128,0.18)] p-4 hover:border-[#EAC272]/70 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div>
                        {/* Header: Discipline & Date (Zero-pill text separators) */}
                        <div className="flex items-center justify-between text-[11px] text-[#C9B49D] mb-2 border-b border-[rgba(242,203,128,0.1)] pb-2">
                          <div className="flex items-center gap-1.5 font-medium text-[#EAC272]">
                            <span>{discInfo.icon}</span>
                            <span>{discInfo.label}</span>
                            <span>·</span>
                            <span className="text-[#FAE9CA]">{reading.topic || 'ชะตาทั่วไป'}</span>
                          </div>
                          <span className="text-[10px] text-[#C9B49D]/80">
                            {reading.timestamp || 'ล่าสุด'}
                          </span>
                        </div>

                        {/* Question */}
                        <h4 className="font-serif-display text-sm font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors line-clamp-2 mb-2">
                          {reading.question || 'คำทำนายดวงชะตา'}
                        </h4>

                        {/* Extracted Cards (Clean metadata text) */}
                        {cardNames && (
                          <div className="text-[11px] text-[#EAC272]/90 mb-2 font-mono">
                            🎴 ไพ่ที่เปิด: {cardNames}
                          </div>
                        )}

                        {/* Excerpt */}
                        <p className="text-xs text-[#C9B49D] line-clamp-2 leading-relaxed">
                          {reading.markdownContent
                            ? reading.markdownContent.replace(/[#*`_]/g, '').slice(0, 140) + '...'
                            : 'แตะเพื่อเปิดอ่านคำทำนายและแนวทางปฏิบัติ'}
                        </p>
                      </div>

                      {/* Footer Action */}
                      <div className="mt-3 pt-2 border-t border-[rgba(242,203,128,0.1)] flex items-center justify-between text-xs text-[#EAC272]">
                        <span className="text-[10px] text-[#C9B49D]">
                          ความเผ็ด: {reading.sassyLevel === 'savage' ? '🔥 Savage' : reading.sassyLevel === 'spicy' ? '🌶️ Spicy' : '✨ Mild'}
                        </span>
                        <div className="flex items-center gap-1 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>เปิดดูวิเคราะห์เจาะลึก</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Deep Reading Inspection Modal */}
        <AnimatePresence>
          {inspectedReading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#110918]/90 backdrop-blur-md p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-2xl bg-gradient-to-b from-[#24102E] to-[#180B22] border-2 border-[#EAC272]/40 shadow-2xl p-5 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.2)] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {DISCIPLINE_META[inspectedReading.discipline as DisciplineFilterType]?.icon || '🔮'}
                    </span>
                    <div>
                      <h4 className="font-serif-display text-base font-bold text-[#FAE9CA]">
                        {inspectedReading.question || 'คำทำนายดวงชะตา'}
                      </h4>
                      <p className="text-[11px] text-[#C9B49D]">
                        {DISCIPLINE_META[inspectedReading.discipline as DisciplineFilterType]?.label || 'ศาสตร์พยากรณ์'} · {inspectedReading.topic} · {inspectedReading.timestamp}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectedReading(null)}
                    className="rounded-full bg-[#180B22] p-1.5 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Markdown Reading Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm text-[#FAE9CA] leading-relaxed">
                  <div className="prose prose-invert max-w-none text-[#FAE9CA]/90">
                    <ReactMarkdown>{inspectedReading.markdownContent}</ReactMarkdown>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-4 pt-3 border-t border-[rgba(242,203,128,0.2)] flex items-center justify-between">
                  <span className="text-xs text-[#C9B49D]">
                    💡 คำทำนายนี้เชื่อมโยงกับฐานข้อมูลแพทเทิร์นชีวิตของคุณ
                  </span>
                  <button
                    onClick={() => {
                      if (onSwitchDiscipline && inspectedReading.discipline) {
                        onSwitchDiscipline(inspectedReading.discipline);
                        onClose();
                      } else {
                        setInspectedReading(null);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-4 py-1.5 text-xs font-bold text-[#110918] hover:shadow-md transition-all"
                  >
                    <span>ไปเปิดดูดวงศาสตร์นี้ต่อ</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
