import { MoonPhaseInfo, MoonPhaseName } from '../types';

/**
 * High-precision Lunar Ephemeris & Phase Calculator
 * Synodic Month: 29.53058867 days
 * Reference New Moon: Jan 6, 2000 18:14 UTC (JD 2451549.5 + 0.26)
 */
const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

export function calculateMoonPhase(targetDate: Date = new Date()): MoonPhaseInfo {
  const timeDiff = targetDate.getTime() - KNOWN_NEW_MOON;
  const daysSinceEpoch = timeDiff / (1000 * 60 * 60 * 24);
  const lunarCycles = daysSinceEpoch / SYNODIC_MONTH;
  const cycleFraction = lunarCycles - Math.floor(lunarCycles);
  const ageInDays = cycleFraction * SYNODIC_MONTH;

  // Illumination calculation (0 to 100%)
  // Phase angle from 0 to 2*PI
  const phaseAngle = cycleFraction * 2 * Math.PI;
  const illumination = Math.round((1 - Math.cos(phaseAngle)) / 2 * 100);

  // Phase Classification (8 distinct standard astronomical lunar phases)
  let phase: MoonPhaseName;
  let nameTh = '';
  let nameEn = '';
  let symbol = '';

  if (ageInDays < 1.84566) {
    phase = 'new_moon';
    nameTh = 'จันทร์ดับ (New Moon)';
    nameEn = 'New Moon';
    symbol = '🌑';
  } else if (ageInDays < 5.53699) {
    phase = 'waxing_crescent';
    nameTh = 'จันทร์เสี้ยวข้างขึ้น (Waxing Crescent)';
    nameEn = 'Waxing Crescent';
    symbol = '🌒';
  } else if (ageInDays < 9.22831) {
    phase = 'first_quarter';
    nameTh = 'จันทร์ครึ่งดวงแรก (First Quarter)';
    nameEn = 'First Quarter';
    symbol = '🌓';
  } else if (ageInDays < 12.91963) {
    phase = 'waxing_gibbous';
    nameTh = 'จันทร์ค่อนดวงข้างขึ้น (Waxing Gibbous)';
    nameEn = 'Waxing Gibbous';
    symbol = '🌔';
  } else if (ageInDays < 16.61096) {
    phase = 'full_moon';
    nameTh = 'จันทร์เพ็ญเต็มดวง (Full Moon)';
    nameEn = 'Full Moon';
    symbol = '🌕';
  } else if (ageInDays < 20.30228) {
    phase = 'waning_gibbous';
    nameTh = 'จันทร์ค่อนดวงข้างแรม (Waning Gibbous)';
    nameEn = 'Waning Gibbous';
    symbol = '🌖';
  } else if (ageInDays < 23.99361) {
    phase = 'last_quarter';
    nameTh = 'จันทร์ครึ่งดวงสุดท้าย (Last Quarter)';
    nameEn = 'Last Quarter';
    symbol = '🌗';
  } else if (ageInDays < 27.68493) {
    phase = 'waning_crescent';
    nameTh = 'จันทร์เสี้ยวข้างแรม (Waning Crescent)';
    nameEn = 'Waning Crescent';
    symbol = '🌘';
  } else {
    phase = 'new_moon';
    nameTh = 'จันทร์ดับ (New Moon)';
    nameEn = 'New Moon';
    symbol = '🌑';
  }

  // Moon Zodiac Sign estimate (Moon moves through all 12 signs in ~27.3 days, ~2.27 days per sign)
  const zodiacSigns = [
    { name: 'ราศีเมษ (Aries)', symbol: '♈', element: 'ไฟ' },
    { name: 'ราศีพฤษภ (Taurus)', symbol: '♉', element: 'ดิน' },
    { name: 'ราศีเมถุน (Gemini)', symbol: '♊', element: 'ลม' },
    { name: 'ราศีกรกฎ (Cancer)', symbol: '♋', element: 'น้ำ' },
    { name: 'ราศีสิงห์ (Leo)', symbol: '♌', element: 'ไฟ' },
    { name: 'ราศีกันย์ (Virgo)', symbol: '♍', element: 'ดิน' },
    { name: 'ราศีตุลย์ (Libra)', symbol: '♎', element: 'ลม' },
    { name: 'ราศีพิจิก (Scorpio)', symbol: '♏', element: 'น้ำ' },
    { name: 'ราศีธนู (Sagittarius)', symbol: '♐', element: 'ไฟ' },
    { name: 'ราศีมังกร (Capricorn)', symbol: '♑', element: 'ดิน' },
    { name: 'ราศีกุมภ์ (Aquarius)', symbol: '♒', element: 'ลม' },
    { name: 'ราศีมีน (Pisces)', symbol: '♓', element: 'น้ำ' },
  ];
  const siderealDays = 27.321661;
  const siderealFraction = (daysSinceEpoch / siderealDays) - Math.floor(daysSinceEpoch / siderealDays);
  const zodiacIndex = Math.floor(siderealFraction * 12);
  const currentSign = zodiacSigns[zodiacIndex] || zodiacSigns[0];

  // Cosmic Influences & Wisdom breakdown for each phase
  const cosmicMap: Record<MoonPhaseName, MoonPhaseInfo['cosmicEnergy']> = {
    new_moon: {
      theme: 'การตั้งเจตจำนงใหม่ & รีเซ็ตพลังงาน (New Intentions & Clean Slate)',
      vibe: 'ความสงบนิ่ง จิตใต้สำนึกเปิดกว้าง เหมาะกับการวางแผนและปลูกเมล็ดพันธุ์ความหวัง',
      intensity: 'calm',
      intensityScore: 35,
      elementalFocus: 'ธาตุน้ำและลม (การไหลเวียนของจินตนาการ)',
      doActions: [
        'ตั้งเป้าหมายประจำเดือนใหม่ หรือเขียน Wishlist',
        'เริ่มโปรเจกต์ใหม่ที่ต้องการความเติบโตอย่างมั่นคง',
        'ทำสมาธิ หรือจัดระเบียบพื้นที่ในห้อง/โต๊ะทำงาน',
      ],
      avoidActions: [
        'ด่วนตัดสินใจเรื่องใหญ่ขณะอารมณ์ยังว่างเปล่า',
        'ยึดติดกับสิ่งที่เพิ่งสูญเสียไปในอดีต',
      ],
      catWisdom: 'แมวยังรู้ว่าก่อนจะกระโดดไกล ต้องย่อตัวเก็บแรงไว้ในความมืดก่อนเสมอจ้ะ',
      mantra: 'ฉันเปิดรับการเริ่มต้นใหม่ด้วยความมั่นใจและหัวใจที่เบาสบาย',
    },
    waxing_crescent: {
      theme: 'การลงมือทำก้าวแรก & สะสมแรงส่ง (First Momentum & Curiosity)',
      vibe: 'กระแสพลังกำลังก่อตัว ความคิดสร้างสรรค์เริ่มชัดเจน ความกล้าทดลองสิ่งใหม่',
      intensity: 'moderate',
      intensityScore: 55,
      elementalFocus: 'ธาตุดินและไฟ (การตั้งรากฐานและลงมือทำ)',
      doActions: [
        'ลงมือปฏิบัติจริงตามแผนที่ตั้งไว้ทันที',
        'เปิดรับข้อมูลใหม่ หรือหาความรู้เพิ่มเติม',
        'ส่งสาร ติดต่อประสานงาน และเริ่มเจรจา',
      ],
      avoidActions: [
        'ความสงสัยในตัวเองจนไม่ยอมเริ่มก้าวแรก',
        'ท้อแท้เร็วเพียงเพราะผลลัพธ์ยังไม่เห็นทันตา',
      ],
      catWisdom: 'ก้าวแรกอาจจะต้วมเตี้ยมเหมือนลูกแมวหัดเดิน แต่ถ้าไม่ก้าวก็อยู่ที่เดิมนะเพื่อนสาว!',
      mantra: 'ทุกการกระทำเล็กๆ ของฉัน กำลังนำพาไปสู่ความสำเร็จที่ยิ่งใหญ่',
    },
    first_quarter: {
      theme: 'การก้าวข้ามบททดสอบ & ตัดสินใจเด็ดขาด (Breakthrough & Overcoming Friction)',
      vibe: 'แรงเสียดทานระหว่างแผนการกับความเป็นจริง ความจำเป็นต้องแก้ไขและปรับกลยุทธ์',
      intensity: 'high',
      intensityScore: 78,
      elementalFocus: 'ธาตุไฟ (ความมุ่งมั่นและความกล้าหาญ)',
      doActions: [
        'เผชิญหน้ากับอุปสรรคอย่างมีสติ ไม่หนีปัญหา',
        'ตัดทอนสิ่งที่ไม่เวิร์กออกจากกระบวนการทำงาน',
        'เจรจาต่อรองเพื่อยืนยันจุดยืนที่ถูกต้อง',
      ],
      avoidActions: [
        'การยอมแพ้ถอดใจเมื่อเจอกำแพงขวางหน้า',
        'การใช้อารมณ์ปะทะกับคนรอบข้างโดยไร้เหตุผล',
      ],
      catWisdom: 'ถ้ากระโดดไม่พ้นโซฟา ก็แค่ดีดขาหลังแรงขึ้นอีกนิด อย่าเพิ่งมาร้องงอแง!',
      mantra: 'ฉันแข็งแกร่งกว่าทุกอุปสรรค และพร้อมปรับตัวเพื่อคว้าชัยชนะ',
    },
    waxing_gibbous: {
      theme: 'การขัดเกลา & บ่มเพาะก่อนถึงจุดสูงสุด (Refining & Persistence)',
      vibe: 'การเก็บรายละเอียด ความอดทนในโค้งสุดท้าย พลังดึงดูดสิ่งดีงามกำลังพีค',
      intensity: 'high',
      intensityScore: 85,
      elementalFocus: 'ธาตุดิน (ความปราณีตและการเกาะติดเป้าหมาย)',
      doActions: [
        'ทบทวนตรวจสอบรายละเอียดของงานให้ไร้ที่ติ',
        'ดูแลสุขภาพร่างกายและเสริมสร้างพลังงานบวก',
        'สนับสนุนเพื่อนร่วมทีมเพื่อเข้าเส้นชัยไปด้วยกัน',
      ],
      avoidActions: [
        'ความใจร้อนอยากให้จบเร็วๆ จนทิ้งข้อผิดพลาด',
        'ความประมาทคิดว่าทุกอย่างเสร็จสมบูรณ์แล้ว',
      ],
      catWisdom: 'แมวส่องเหยื่ออย่างนิ่งสงบ ไม่รีบตะครุบจนไก่ตื่น จำไว้!',
      mantra: 'ความพยายามและความประณีตของฉัน กำลังเบ่งบานอย่างสมบูรณ์แบบ',
    },
    full_moon: {
      theme: 'พลังแห่งความสมบูรณ์ & ปลดปล่อยอารมณ์ (Illumination, Harvest & Release)',
      vibe: 'พลังงานจักรวาลพุ่งถึงขีดสุด สัญชาตญาณเฉียบแหลม แต่อารมณ์อาจอ่อนไหวง่าย',
      intensity: 'peak',
      intensityScore: 100,
      elementalFocus: 'ธาตุน้ำบริสุทธิ์และแสงสุริยคราส (มหาสมุทรแห่งความรู้สึก)',
      doActions: [
        'เฉลิมฉลองและขอบคุณความสำเร็จที่เก็บเกี่ยวได้',
        'จั่วไพ่พยากรณ์ หรือทำพิธีชำระล้างพลังงานลบ/หินนำโชค',
        'เคลียร์ใจและปล่อยวางความโกรธแค้น ความกังวล',
      ],
      avoidActions: [
        'การตัดสินใจด้วยอารมณ์โกรธหรือความตื่นตระหนก',
        'การปะทะคารมในความสัมพันธ์ที่กำลังเปราะบาง',
      ],
      catWisdom: 'คืนจันทร์เต็มดวง แมวยังตาโตระวังภัย แกก็อย่าใช้อารมณ์ฟาดงวงฟาดงาจนพังนะจ๊ะ!',
      mantra: 'ฉันปลดปล่อยสิ่งที่ไม่ได้รับใช้ชีวิตฉันอีกต่อไป และขอบคุณทุกสิ่งที่ฉันมี',
    },
    waning_gibbous: {
      theme: 'การแบ่งปันความรู้ & ตอบแทนคืนสู่สังเวียน (Gratitude & Sharing Wisdom)',
      vibe: 'จิตใจเริ่มกลับมาสู่ความสงบ ความเข้าใจในสัจธรรม การแลกเปลี่ยนประสบการณ์',
      intensity: 'moderate',
      intensityScore: 70,
      elementalFocus: 'ธาตุลม (การสื่อสารและการถ่ายทอด)',
      doActions: [
        'ส่งต่อความรู้ แนะนำ และช่วยเหลือผู้อื่น',
        'จดบันทึกบทเรียนที่ได้จากเหตุการณ์ล่าสุด',
        'แสดงความกตัญญูและขอบคุณผู้มีพระคุณ',
      ],
      avoidActions: [
        'การโอ้อวดความสำเร็จจนสร้างความหมั่นไส้',
        'การตระหนี่ถี่เหนียวไม่ยอมเผื่อแผ่ใคร',
      ],
      catWisdom: 'จับหนูได้ตัวใหญ่ ก็แบ่งให้คนเปิดกระป๋องบ้าง จะได้มีกินไปนานๆ',
      mantra: 'ฉันพร้อมแบ่งปันความสุขและปัญญา เพื่อสร้างคุณค่าให้โลกใบนี้',
    },
    last_quarter: {
      theme: 'การชำระล้าง & ตัดบ่วงพันธนาการ (Clearing, Forgiveness & Re-evaluating)',
      vibe: 'การปล่อยมือจากสิ่งที่เป็นพิษ สางงานค้าง การให้อภัยและตัดสิ่งที่ถ่วงความเจริญ',
      intensity: 'moderate',
      intensityScore: 60,
      elementalFocus: 'ธาตุดินและน้ำ (การดีท็อกซ์ทั้งกายและใจ)',
      doActions: [
        'เคลียร์เอกสาร ข้าวของไม่ใช้ และทิ้งขยะในจิตใจ',
        'ยกเลิกข้อตกลงหรือความสัมพันธ์ที่ดูดพลังงาน',
        'ตรวจเช็กการเงินและวางแผนอุดรอยรั่ว',
      ],
      avoidActions: [
        'การเก็บสะสมความทุกข์ไว้เป็นสมบัติส่วนตัว',
        'การผัดวันประกันพรุ่งเรื่องการทิ้งสิ่งเก่า',
      ],
      catWisdom: 'ถ้ากะบะทรายมันเต็ม ก็ต้องตักทิ้งจ้ะ ไม่ใช่ไปนั่งทับมันไว้!',
      mantra: 'ฉันให้อภัย ปล่อยวาง และสร้างพื้นที่ว่างสำหรับสิ่งมหัศจรรย์ใหม่ๆ',
    },
    waning_crescent: {
      theme: 'การพักผ่อนฟื้นฟู & สมาธิในความเงียบ (Deep Rest & Surrender)',
      vibe: 'พลังงานภายนอกชะลอตัว เป็นเวลาของการนอนหลับ ฟื้นฟูจิตวิญญาณและพักใจ',
      intensity: 'calm',
      intensityScore: 40,
      elementalFocus: 'ธาตุน้ำและลม (ความเงียบสงบและการฟื้นฟูเซลล์)',
      doActions: [
        'นอนหลับพักผ่อนให้เพียงพอ ทานอาหารที่มีประโยชน์',
        'หลีกเลี่ยงงานที่ต้องใช้พลังงานสูงติดต่อกันหลายชั่วโมง',
        'เข้าสปา แช่น้ำ หรือฟังเสียงธรรมชาติเพื่อรีเซ็ตคลื่นสมอง',
      ],
      avoidActions: [
        'การบังคับตัวเองให้ฝืนทำงานหนักจนเบิร์นเอาต์',
        'การเริ่มภาระผูกพันระยะยาวใหม่ในช่วงนี้',
      ],
      catWisdom: 'การนอนหลับ 16 ชั่วโมงต่อวันไม่ใช่เรื่องขี้เกียจ แต่มันคือศาสตร์แห่งการอยู่รอดของแมว!',
      mantra: 'ฉันอนุญาตให้ตัวเองได้พักผ่อนอย่างเต็มอิ่ม เพื่อเตรียมพร้อมสำหรับรอบถัดไป',
    },
  };

  // Next Major Target (New Moon or Full Moon)
  let upcomingKeyPhase = {
    nameTh: 'จันทร์เพ็ญเต็มดวง (Full Moon)',
    date: '',
    daysLeft: 0,
    symbol: '🌕',
  };

  if (ageInDays < 14.765) {
    const daysToFull = 14.765 - ageInDays;
    const fullDate = new Date(targetDate.getTime() + daysToFull * 86400000);
    upcomingKeyPhase = {
      nameTh: 'จันทร์เพ็ญเต็มดวง (Full Moon)',
      date: fullDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      daysLeft: Math.max(1, Math.round(daysToFull)),
      symbol: '🌕',
    };
  } else {
    const daysToNew = SYNODIC_MONTH - ageInDays;
    const newDate = new Date(targetDate.getTime() + daysToNew * 86400000);
    upcomingKeyPhase = {
      nameTh: 'จันทร์ดับ (New Moon)',
      date: newDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
      daysLeft: Math.max(1, Math.round(daysToNew)),
      symbol: '🌑',
    };
  }

  return {
    phase,
    nameTh,
    nameEn,
    symbol,
    illumination,
    ageInDays: Number(ageInDays.toFixed(1)),
    zodiacSign: currentSign.name,
    zodiacSymbol: currentSign.symbol,
    zodiacElement: currentSign.element,
    cosmicEnergy: cosmicMap[phase],
    upcomingKeyPhase,
  };
}
