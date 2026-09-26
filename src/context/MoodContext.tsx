import React, { createContext, useContext, useState, useEffect } from 'react';
import { MoodType, MoodOption } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';

export const AVAILABLE_MOODS: MoodOption[] = [
  {
    id: 'mystic-purple',
    nameTh: 'Mystic Purple (ม่วงกำมะหยี่มนตรา)',
    nameEn: 'Mystic Purple',
    subtitle: 'Signature The Cat Room มนตร์เสน่ห์แมวดำ',
    icon: '🔮',
    previewColors: {
      surface: '#110918',
      container: '#1E0E2A',
      accent: '#EAC272',
      text: '#FAE9CA',
    },
    description: 'บรรยากาศห้องเวทมนตร์ยามค่ำคืน อบอุ่น ลึกลับ ชวนค้นหาความจริงในชะตา',
  },
  {
    id: 'gilded-gold',
    nameTh: 'Gilded Gold (ทองอร่าม บารมีมหาเศรษฐี)',
    nameEn: 'Gilded Gold',
    subtitle: 'แสงสีทองเรืองรอง เสริมดวงวาสนาการเงิน',
    icon: '👑',
    previewColors: {
      surface: '#140F06',
      container: '#201708',
      accent: '#F6C958',
      text: '#FFF4DC',
    },
    description: 'ประกายทองคำโบราณส่องสว่าง เสริมพลังความมั่นใจ เรียกทรัพย์เข้ากระเป๋า',
  },
  {
    id: 'midnight-black',
    nameTh: 'Midnight Black (ดำสนิทรัตติกาล สุขุมลุ่มลึก)',
    nameEn: 'Midnight Black',
    subtitle: 'ความมืดที่สงบนิ่ง สมาธิแน่วแน่ มินิมอล',
    icon: '🐈‍⬛',
    previewColors: {
      surface: '#09090B',
      container: '#121216',
      accent: '#D8D8E6',
      text: '#EDEDF2',
    },
    description: 'ฉากหลังดำสนิทลดแสงรบกวนตา เพ่งจิตเปิดไพ่อย่างเฉียบคมและทรงพลัง',
  },
  {
    id: 'emerald-oracle',
    nameTh: 'Emerald Oracle (หยกมรกต พลังบำบัดจิต)',
    nameEn: 'Emerald Oracle',
    subtitle: 'พลังธรรมชาติ ธาตุไม้ สมดุลหยินหยาง',
    icon: '🌿',
    previewColors: {
      surface: '#061210',
      container: '#0A1C19',
      accent: '#4ECCA3',
      text: '#E8F8F5',
    },
    description: 'เฉดเขียวมรกตลึกลับ เย็นสบายตา ช่วยผ่อนคลายความเครียดสะสม',
  },
];

interface MoodContextValue {
  currentMood: MoodType;
  activeMoodConfig: MoodOption;
  availableMoods: MoodOption[];
  setMood: (mood: MoodType) => void;
  isMoodModalOpen: boolean;
  setIsMoodModalOpen: (open: boolean) => void;
  openMoodSelector: () => void;
}

const MoodContext = createContext<MoodContextValue | undefined>(undefined);

const STORAGE_KEY = 'thecatroom_interface_mood';

export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMood, setCurrentMoodState] = useState<MoodType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as MoodType | null;
      if (saved && AVAILABLE_MOODS.some(m => m.id === saved)) {
        return saved;
      }
    }
    return 'mystic-purple';
  });

  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);

  // Apply mood to DOM attribute and CSS Variables
  useEffect(() => {
    document.documentElement.setAttribute('data-mood', currentMood);
    localStorage.setItem(STORAGE_KEY, currentMood);
  }, [currentMood]);

  const activeMoodConfig = AVAILABLE_MOODS.find(m => m.id === currentMood) || AVAILABLE_MOODS[0];

  const setMood = (newMood: MoodType) => {
    if (newMood === currentMood) return;
    setCurrentMoodState(newMood);
    playMysticChimeSound('gold');
  };

  const openMoodSelector = () => {
    setIsMoodModalOpen(true);
  };

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        activeMoodConfig,
        availableMoods: AVAILABLE_MOODS,
        setMood,
        isMoodModalOpen,
        setIsMoodModalOpen,
        openMoodSelector,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = (): MoodContextValue => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
