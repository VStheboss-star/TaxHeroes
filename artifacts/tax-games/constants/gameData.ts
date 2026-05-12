export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface MemoryCard {
  id: string;
  pairId: string;
  label: string;
  type: "term" | "definition";
}

export interface ScrambleWord {
  word: string;
  hint: string;
  fact: string;
}

export interface TrailScenario {
  id: number;
  scene: string;
  situation: string;
  choices: {
    text: string;
    points: number;
    feedback: string;
    isGood: boolean;
  }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is tax evasion?",
    options: [
      "Legally reducing your tax bill",
      "Illegally hiding income to avoid paying taxes",
      "Getting a tax refund",
      "Filing taxes late by accident",
    ],
    correct: 1,
    explanation:
      "Tax evasion is the ILLEGAL act of hiding income or assets from the government to avoid paying taxes you legally owe. It's a serious crime!",
  },
  {
    id: 2,
    question:
      "Which famous gangster was caught for tax evasion in 1931, not murder?",
    options: ["Jesse James", "Bonnie and Clyde", "Al Capone", "John Dillinger"],
    correct: 2,
    explanation:
      "Al Capone ran a criminal empire but was ultimately convicted for tax evasion — proving the IRS always catches up with you eventually!",
  },
  {
    id: 3,
    question: "What do income taxes primarily fund?",
    options: [
      "Private businesses",
      "Public services like schools, hospitals, and roads",
      "Government officials' salaries only",
      "Nothing important",
    ],
    correct: 1,
    explanation:
      "Your taxes fund public schools, hospitals, emergency services, roads, parks, and national defence — services everyone relies on every day.",
  },
  {
    id: 4,
    question: "What is a tax audit?",
    options: [
      "A way to get a bigger refund",
      "A government review of your financial records for accuracy",
      "A penalty for paying too much tax",
      "A type of bank account",
    ],
    correct: 1,
    explanation:
      "A tax audit is when tax authorities examine your financial records to verify that your tax return is accurate and complete.",
  },
  {
    id: 5,
    question: "What is the maximum prison sentence for federal tax evasion in the USA?",
    options: ["6 months", "1 year", "5 years", "Life in prison"],
    correct: 2,
    explanation:
      "Tax evasion in the USA can result in up to 5 years in federal prison, plus massive fines and having to pay all the owed taxes!",
  },
  {
    id: 6,
    question: "What is the KEY difference between tax avoidance and tax evasion?",
    options: [
      "The amount of money involved",
      "Avoidance is legal, evasion is illegal",
      "Evasion is legal, avoidance is illegal",
      "There is no difference",
    ],
    correct: 1,
    explanation:
      "Tax AVOIDANCE uses legal methods to reduce your tax bill. Tax EVASION illegally hides income. One is smart planning, the other is a crime!",
  },
  {
    id: 7,
    question: "What is VAT (Value Added Tax)?",
    options: [
      "A tax only rich people pay",
      "A tax added to the price of goods and services",
      "A tax on property",
      "A penalty for late filing",
    ],
    correct: 1,
    explanation:
      "VAT is added to the price of products you buy. In the UK it's 20%, so a £100 item becomes £120. It's a major source of government revenue.",
  },
  {
    id: 8,
    question:
      "What percentage fraud penalty can the IRS charge on unpaid taxes?",
    options: ["5%", "25%", "75%", "10%"],
    correct: 2,
    explanation:
      "The IRS can charge a civil fraud penalty of 75% of the unpaid taxes — on top of what you already owe! Tax evasion is extremely costly.",
  },
  {
    id: 9,
    question: "What government agency collects federal taxes in the United States?",
    options: ["FBI", "CIA", "IRS", "NSA"],
    correct: 2,
    explanation:
      "The Internal Revenue Service (IRS) is responsible for collecting federal taxes and enforcing tax laws in the United States.",
  },
  {
    id: 10,
    question: "What is a tax deduction?",
    options: [
      "A fine for paying taxes late",
      "An expense that legally reduces your taxable income",
      "Extra tax added to your bill",
      "Money the government owes you",
    ],
    correct: 1,
    explanation:
      "A tax deduction reduces the amount of income that is subject to tax. Things like charitable donations and business expenses can be deductions.",
  },
  {
    id: 11,
    question:
      "What is a 'progressive tax system'?",
    options: [
      "Everyone pays the same flat percentage",
      "Lower earners pay higher rates",
      "Higher earners pay higher percentage rates",
      "Only businesses pay taxes",
    ],
    correct: 2,
    explanation:
      "In a progressive tax system, the more you earn, the higher percentage you pay. This is designed to ensure fairness in society.",
  },
  {
    id: 12,
    question:
      "What happens to public services when large numbers of people evade taxes?",
    options: [
      "Nothing changes",
      "Services improve because government works harder",
      "Services deteriorate due to lack of funding",
      "Taxes go down",
    ],
    correct: 2,
    explanation:
      "When people evade taxes, there's less money for hospitals, schools, and roads. Everyone suffers when some people don't pay their fair share.",
  },
  {
    id: 13,
    question: "What is a tax return?",
    options: [
      "Getting your money back from a shop",
      "An annual document declaring income and taxes owed to the government",
      "A refund from the government",
      "A penalty notice",
    ],
    correct: 1,
    explanation:
      "A tax return is an annual filing where you report your income and calculate how much tax you owe (or if you're owed a refund).",
  },
  {
    id: 14,
    question: "Which of these is an example of LEGAL tax avoidance?",
    options: [
      "Not declaring freelance income",
      "Hiding money in offshore accounts illegally",
      "Contributing to a pension fund to reduce taxable income",
      "Lying about business expenses",
    ],
    correct: 2,
    explanation:
      "Contributing to a pension is a perfectly legal way to reduce taxable income. The government encourages saving for retirement this way.",
  },
  {
    id: 15,
    question: "What is 'National Insurance' (or Social Security in the USA)?",
    options: [
      "Voluntary savings scheme",
      "A tax funding retirement, healthcare, and disability benefits",
      "Private health insurance",
      "A bank savings product",
    ],
    correct: 1,
    explanation:
      "National Insurance / Social Security is a tax that funds retirement pensions, healthcare, and support for people who are unable to work.",
  },
  {
    id: 16,
    question: "If a company earns $1 million but hides $500K from the IRS, what is this?",
    options: [
      "Smart business planning",
      "Tax avoidance",
      "Tax evasion — a federal crime",
      "A legal loophole",
    ],
    correct: 2,
    explanation:
      "Hiding $500,000 of income is tax evasion — a federal crime. The company would face massive fines, penalties, and possible imprisonment for executives.",
  },
  {
    id: 17,
    question: "How does paying taxes benefit YOU personally?",
    options: [
      "It doesn't benefit you at all",
      "Through the public services you use daily",
      "Only if you're poor",
      "Only through tax refunds",
    ],
    correct: 1,
    explanation:
      "You personally benefit from taxes every day — the roads you use, the schools you attend, the fire service, police, and NHS are all funded by taxes!",
  },
  {
    id: 18,
    question: "What is 'tax fraud'?",
    options: [
      "Paying too much tax by mistake",
      "The deliberate falsification of tax returns to reduce tax liability",
      "Filing taxes after the deadline",
      "Asking for too big a refund",
    ],
    correct: 1,
    explanation:
      "Tax fraud involves deliberately falsifying information on tax returns — like inventing fake expenses or hiding income. It's criminal behaviour.",
  },
  {
    id: 19,
    question:
      "In the UK, which organisation investigates serious tax evasion cases?",
    options: [
      "Metropolitan Police",
      "HMRC (His Majesty's Revenue & Customs)",
      "MI5",
      "The Bank of England",
    ],
    correct: 1,
    explanation:
      "HMRC investigates tax evasion in the UK and has the power to prosecute offenders, seize assets, and impose heavy financial penalties.",
  },
  {
    id: 20,
    question:
      "What is the BEST reason why teens should understand taxes?",
    options: [
      "So they can avoid paying them when they grow up",
      "Taxes don't affect young people at all",
      "Because tax knowledge helps make informed financial decisions as adults",
      "Only accountants need to know about taxes",
    ],
    correct: 2,
    explanation:
      "Understanding taxes helps you make smart financial decisions, fulfill your civic responsibilities, and avoid costly legal problems as an adult!",
  },
];

export const MEMORY_PAIRS = [
  { id: "a", term: "Income Tax", definition: "Tax paid on money you earn from work or investments" },
  { id: "b", term: "Tax Evasion", definition: "Illegally hiding income to avoid paying taxes — a crime!" },
  { id: "c", term: "Tax Audit", definition: "Government review of your financial records for accuracy" },
  { id: "d", term: "VAT", definition: "Tax added to the price of goods and services you buy" },
  { id: "e", term: "Tax Return", definition: "Yearly form where you report your income and taxes paid" },
  { id: "f", term: "Deduction", definition: "An expense that legally reduces the amount of tax you owe" },
  { id: "g", term: "Tax Avoidance", definition: "Using LEGAL methods to reduce your tax bill" },
  { id: "h", term: "HMRC / IRS", definition: "Government agencies responsible for collecting taxes" },
];

export const SCRAMBLE_WORDS: ScrambleWord[] = [
  {
    word: "REVENUE",
    hint: "Money coming in",
    fact: "The IRS collected over $4.7 TRILLION in tax revenue in 2022 — funding everything from NASA to national parks!",
  },
  {
    word: "EVASION",
    hint: "Escaping something illegally",
    fact: "Al Capone, one of history's most notorious criminals, was finally jailed in 1931 for TAX EVASION — not murder or bootlegging!",
  },
  {
    word: "PENALTY",
    hint: "A punishment or fine",
    fact: "Tax fraud penalties can reach 75% of the unpaid amount — on top of interest and potential prison time!",
  },
  {
    word: "INCOME",
    hint: "Money you earn",
    fact: "Most countries only tax income above a certain threshold — to protect lower earners from heavy tax burdens.",
  },
  {
    word: "AUDIT",
    hint: "A detailed check or review",
    fact: "The IRS audits less than 0.5% of tax returns — but those who evade are far more likely to get selected!",
  },
  {
    word: "BUDGET",
    hint: "A financial plan",
    fact: "The US federal budget exceeds $6 TRILLION per year. Without tax revenue, the entire system would collapse.",
  },
  {
    word: "REFUND",
    hint: "Money returned to you",
    fact: "The average US tax refund is about $2,800 — money back because you overpaid throughout the year!",
  },
  {
    word: "CITIZEN",
    hint: "A member of a country",
    fact: "Most countries require ALL citizens and residents to pay taxes — it's a fundamental civic responsibility.",
  },
  {
    word: "FEDERAL",
    hint: "Relating to the central government",
    fact: "Federal taxes fund national services like the military, Medicare, Social Security, and federal highways.",
  },
  {
    word: "JUSTICE",
    hint: "Fairness and the law",
    fact: "The Department of Justice prosecutes hundreds of tax criminals each year — nobody is above the law!",
  },
];

export const TRAIL_SCENARIOS: TrailScenario[] = [
  {
    id: 1,
    scene: "Your First Job",
    situation:
      "You just landed your first part-time job earning £200/week. Your employer asks about your tax situation. What do you do?",
    choices: [
      {
        text: "Register properly with HMRC and provide my tax code",
        points: 30,
        feedback: "Excellent! Registering properly means you'll only pay the right amount — and build a clean record from the start.",
        isGood: true,
      },
      {
        text: "Ask to be paid in cash to avoid any tax hassle",
        points: -20,
        feedback: "Dangerous! 'Cash in hand' to evade tax is illegal for both you AND your employer. HMRC investigates this regularly.",
        isGood: false,
      },
      {
        text: "Ignore it — I'm young, taxes don't apply to me yet",
        points: -10,
        feedback: "Wrong! If you earn above the tax-free threshold, you must pay tax regardless of age. Ignorance isn't a legal defence.",
        isGood: false,
      },
    ],
  },
  {
    id: 2,
    scene: "Side Hustle Income",
    situation:
      "You earn £3,000 from tutoring students privately. Your friend says 'It's just pocket money, you don't need to declare it.' What do you do?",
    choices: [
      {
        text: "Report all tutoring income honestly on my tax return",
        points: 30,
        feedback: "Perfect! All income must be declared. Declaring it protects you legally and builds a trustworthy financial record.",
        isGood: true,
      },
      {
        text: "Only report half — it's not that much money",
        points: -25,
        feedback: "This is partial tax evasion — still illegal! Selectively hiding income can trigger an audit and massive penalties.",
        isGood: false,
      },
      {
        text: "Don't report any of it, follow your friend's advice",
        points: -30,
        feedback: "Very risky! The HMRC 'Let Property Campaign' and digital payment records mean undeclared income is easily caught.",
        isGood: false,
      },
    ],
  },
  {
    id: 3,
    scene: "The Suspicious Letter",
    situation:
      "You receive an official letter from HMRC saying they're investigating your income records and requesting documents. What do you do?",
    choices: [
      {
        text: "Respond immediately and provide all requested documents honestly",
        points: 30,
        feedback: "Wise move! Cooperating with HMRC is always the best approach. Non-cooperation dramatically worsens penalties.",
        isGood: true,
      },
      {
        text: "Ignore the letter and hope it goes away",
        points: -30,
        feedback: "Terrible idea! Ignoring HMRC escalates to formal investigation, court summons, and criminal charges for obstruction.",
        isGood: false,
      },
      {
        text: "Destroy the letter — they can't prove you received it",
        points: -40,
        feedback: "This is obstruction of justice — a SEPARATE criminal offence on top of any tax issues. Digital records already exist.",
        isGood: false,
      },
    ],
  },
  {
    id: 4,
    scene: "The Offshore Temptation",
    situation:
      "A financial advisor offers to move your savings to an offshore account to 'protect them from taxes.' What do you do?",
    choices: [
      {
        text: "Refuse — this sounds like illegal tax evasion",
        points: 35,
        feedback: "Smart! Offshore tax evasion schemes are heavily prosecuted. Global data-sharing agreements mean nowhere is truly hidden anymore.",
        isGood: true,
      },
      {
        text: "Ask for more details before deciding",
        points: 20,
        feedback: "Cautious and reasonable. Always seek independent legal advice before any financial decisions. Many such schemes ARE illegal.",
        isGood: true,
      },
      {
        text: "Say yes — everyone's doing it!",
        points: -35,
        feedback: "'Everyone's doing it' is never a legal defence. Tax havens like Panama and Cayman Islands are under intense global scrutiny.",
        isGood: false,
      },
    ],
  },
  {
    id: 5,
    scene: "Business Expenses",
    situation:
      "You run a small business. Your accountant asks about your expenses. Your friend says to include some personal holiday costs as 'business travel.' What do you do?",
    choices: [
      {
        text: "Only claim genuine business expenses — holidays are personal",
        points: 30,
        feedback: "Exactly right! Falsely claiming personal costs as business expenses is fraud and one of the most common audit triggers.",
        isGood: true,
      },
      {
        text: "Include the holidays — it's a grey area, right?",
        points: -25,
        feedback: "It's not a grey area — it's fraud. HMRC scrutinises travel claims carefully. This could trigger a full business audit.",
        isGood: false,
      },
      {
        text: "Ask your accountant what's genuinely allowable first",
        points: 30,
        feedback: "Perfect professional approach! A good accountant will find LEGITIMATE deductions — no need to risk fraud.",
        isGood: true,
      },
    ],
  },
];

export const LEARN_FACTS = [
  {
    category: "What Are Taxes?",
    color: "#4F46E5",
    icon: "book-open",
    facts: [
      "Taxes are payments made by citizens and businesses to the government. They fund essential public services that everyone uses.",
      "There are many types of taxes: income tax, sales tax, VAT, property tax, corporation tax, and inheritance tax.",
      "The UK was one of the first countries to introduce income tax in 1799 — to fund wars against Napoleon!",
      "In the US, the federal income tax was made permanent by the 16th Amendment in 1913.",
      "Most people have taxes automatically deducted from their pay through a 'Pay As You Earn' (PAYE) system.",
    ],
  },
  {
    category: "What Do Taxes Fund?",
    color: "#10B981",
    icon: "heart",
    facts: [
      "Healthcare: Taxes fund hospitals, ambulances, and the NHS (UK) or Medicare/Medicaid (USA).",
      "Education: From primary schools to universities, public education relies heavily on tax funding.",
      "Infrastructure: Every road, bridge, railway, and public building is largely funded by taxes.",
      "Emergency Services: Police, fire brigades, and coastguard are funded by your taxes.",
      "Social Safety Net: Unemployment benefits, disability support, and state pensions help vulnerable people.",
      "National Defence: Military, intelligence services, and border control are all government-funded.",
    ],
  },
  {
    category: "Tax Evasion Facts",
    color: "#EF4444",
    icon: "alert-triangle",
    facts: [
      "Global tax evasion costs governments an estimated $427 BILLION per year — money that could fund schools and hospitals.",
      "Al Capone, one of history's most dangerous criminals, was finally imprisoned in 1931 — for tax evasion.",
      "HMRC recovered over £36 billion in unpaid taxes in 2022/23 through investigations and audits.",
      "Tax evaders can face prison sentences of up to 7 years in the UK and 5 years in the USA.",
      "Digital technology has made tax evasion much harder — banks share data globally and crypto transactions are traceable.",
      "The Panama Papers (2016) exposed how wealthy individuals hid money in offshore accounts. Many were prosecuted.",
    ],
  },
  {
    category: "Tax Consequences",
    color: "#F97316",
    icon: "zap",
    facts: [
      "Financial penalties for tax fraud can be up to 200% of the unpaid tax amount.",
      "A criminal tax conviction stays on your record permanently, affecting jobs, travel visas, and lending.",
      "HMRC has 'naming and shaming' powers — convicted tax evaders can be publicly identified.",
      "Companies caught evading taxes can lose government contracts, damaging their entire business.",
      "Even celebrities and billionaires get caught — Pete Rose, Wesley Snipes, and Lionel Messi have all faced tax evasion charges.",
      "Tax evasion investigations can go back 20+ years, meaning you're never 'safe' after evading.",
    ],
  },
  {
    category: "Smart Tax Facts",
    color: "#8B5CF6",
    icon: "trending-up",
    facts: [
      "Tax AVOIDANCE is legal — using ISAs, pension contributions, and allowances to legally reduce your tax bill.",
      "The UK personal allowance means you don't pay income tax on your first £12,570 of earnings (2024).",
      "Charitable donations can reduce your tax bill through Gift Aid — the government adds 25% on top.",
      "Self-employed people must file their own tax returns each year — there's no employer to do it for them.",
      "Starting to save in a pension early is one of the best legal ways to reduce income tax.",
      "Many countries have tax treaties to prevent the same income being taxed twice in different countries.",
    ],
  },
];
