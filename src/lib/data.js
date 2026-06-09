export const WC_GROUPS = {
  A: [
    { name: 'Mexico',        flag: '🇲🇽', rank: 15 },
    { name: 'United States', flag: '🇺🇸', rank: 16 },
    { name: 'Uruguay',       flag: '🇺🇾', rank: 17 },
    { name: 'Panama',        flag: '🇵🇦', rank: 43 },
  ],
  B: [
    { name: 'Argentina', flag: '🇦🇷', rank: 1  },
    { name: 'Portugal',  flag: '🇵🇹', rank: 6  },
    { name: 'Morocco',   flag: '🇲🇦', rank: 14 },
    { name: 'Angola',    flag: '🇦🇴', rank: 62 },
  ],
  C: [
    { name: 'Spain',    flag: '🇪🇸', rank: 2  },
    { name: 'Brazil',   flag: '🇧🇷', rank: 4  },
    { name: 'Japan',    flag: '🇯🇵', rank: 18 },
    { name: 'Cameroon', flag: '🇨🇲', rank: 40 },
  ],
  D: [
    { name: 'France',       flag: '🇫🇷', rank: 2  },
    { name: 'England',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', rank: 5  },
    { name: 'Australia',    flag: '🇦🇺', rank: 23 },
    { name: 'Saudi Arabia', flag: '🇸🇦', rank: 56 },
  ],
  E: [
    { name: 'Germany',     flag: '🇩🇪', rank: 12 },
    { name: 'Belgium',     flag: '🇧🇪', rank: 3  },
    { name: 'Serbia',      flag: '🇷🇸', rank: 33 },
    { name: 'New Zealand', flag: '🇳🇿', rank: 97 },
  ],
  F: [
    { name: 'Netherlands', flag: '🇳🇱', rank: 7  },
    { name: 'Colombia',    flag: '🇨🇴', rank: 20 },
    { name: 'Ecuador',     flag: '🇪🇨', rank: 44 },
    { name: 'Senegal',     flag: '🇸🇳', rank: 19 },
  ],
  G: [
    { name: 'Croatia',     flag: '🇭🇷', rank: 10 },
    { name: 'South Korea', flag: '🇰🇷', rank: 25 },
    { name: 'Chile',       flag: '🇨🇱', rank: 37 },
    { name: 'Honduras',    flag: '🇭🇳', rank: 68 },
  ],
  H: [
    { name: 'Italy',       flag: '🇮🇹', rank: 9  },
    { name: 'Switzerland', flag: '🇨🇭', rank: 21 },
    { name: 'Poland',      flag: '🇵🇱', rank: 26 },
    { name: 'Algeria',     flag: '🇩🇿', rank: 51 },
  ],
  I: [
    { name: 'Denmark',    flag: '🇩🇰', rank: 13 },
    { name: 'Costa Rica', flag: '🇨🇷', rank: 55 },
    { name: 'Ghana',      flag: '🇬🇭', rank: 65 },
    { name: 'Peru',       flag: '🇵🇪', rank: 74 },
  ],
  J: [
    { name: 'Ukraine',      flag: '🇺🇦', rank: 22 },
    { name: 'Turkey',       flag: '🇹🇷', rank: 27 },
    { name: 'Ivory Coast',  flag: '🇨🇮', rank: 46 },
    { name: 'Bahrain',      flag: '🇧🇭', rank: 84 },
  ],
  K: [
    { name: 'Canada',    flag: '🇨🇦', rank: 48 },
    { name: 'Iran',      flag: '🇮🇷', rank: 20 },
    { name: 'Nigeria',   flag: '🇳🇬', rank: 34 },
    { name: 'Paraguay',  flag: '🇵🇾', rank: 52 },
  ],
  L: [
    { name: 'South Africa', flag: '🇿🇦', rank: 66 },
    { name: 'Slovakia',     flag: '🇸🇰', rank: 47 },
    { name: 'Tunisia',      flag: '🇹🇳', rank: 28 },
    { name: 'Venezuela',    flag: '🇻🇪', rank: 58 },
  ],
}

export const GROUP_NAMES = Object.keys(WC_GROUPS)

export const SCORING = {
  pos1: 25, pos2: 15, pos3: 10, pos4: 5,
  perfectGroup: 10,
  thirdAdvances: 5,
  matchCorrectOutcome: 2,
  matchGoalDiff: 3,
  matchExact: 5,
  jokerMultiplier: 2,
}

export const SPECIAL_QUESTIONS = [
  { id: 1, category: '🏆 Big Winners',   question: 'Who will win the 2026 World Cup?',                      type: 'team',   pts: 10 },
  { id: 2, category: '🏆 Big Winners',   question: 'Which team will be the Runner-Up (lose the Final)?',    type: 'team',   pts: 7  },
  { id: 3, category: '⚽ Goals & Players', question: 'Who will win the Golden Boot (Top Scorer)?',          type: 'text',   pts: 8  },
  { id: 4, category: '⚽ Goals & Players', question: 'Will any player score a Hat-Trick?',                  type: 'yesno',  pts: 5  },
  { id: 5, category: '💥 Drama & Chaos', question: 'Name ONE Top-10 FIFA team that exits the Group Stage',  type: 'team',   pts: 9  },
  { id: 6, category: '💥 Drama & Chaos', question: 'Which host nation advances furthest?',                  type: 'host',   pts: 6  },
  { id: 7, category: '🃏 Bonus',          question: 'Which outside-top-15 team advances furthest?',         type: 'text',   pts: 8  },
  { id: 8, category: '🃏 Bonus',          question: 'Which team receives the most Red Cards?',              type: 'text',   pts: 6  },
]

export const HOST_OPTIONS = ['USA', 'Mexico', 'Canada', 'They go out equally']

export const TOP10_TEAMS = ['Brazil','France','Argentina','Spain','England','Portugal','Belgium','Germany','Netherlands','Croatia','Denmark','Italy']

export const ALL_TEAMS = Object.values(WC_GROUPS).flat().map(t => t.name)

export const LOCK_DATE = new Date('2026-06-11T19:00:00Z') // 3pm ET = 19:00 UTC
