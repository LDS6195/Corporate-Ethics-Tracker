import type {
  CauseCategory,
  CauseScoreWeights,
  CauseSignalType,
  ConfidenceLevel,
  SourceTier,
} from "@/types/causes";

export const CAUSE_TAXONOMY: CauseCategory[] = [
  {
    id: "worker-wellbeing",
    label: "Worker Wellbeing",
    description: "Labor outcomes, job quality, transition support, and wages.",
    subcategories: [
      {
        id: "labor-rights-organizing",
        label: "Labor Rights and Organizing",
        description: "Collective bargaining, worker representation, and anti-retaliation commitments.",
      },
      {
        id: "transition-reskilling",
        label: "Workforce Transition and Reskilling",
        description: "Upskilling, retraining, and redeployment for displaced workers.",
      },
      {
        id: "wage-equity",
        label: "Wage Equity and Job Quality",
        description: "Pay fairness, predictable scheduling, and benefits quality.",
      },
      {
        id: "community-workforce-development",
        label: "Community Workforce Development",
        description: "Local workforce pipelines, apprenticeships, and career pathways.",
      },
    ],
  },
  {
    id: "digital-rights",
    label: "Digital Rights",
    description: "Privacy, surveillance limits, AI accountability, and platform governance.",
    subcategories: [
      {
        id: "privacy-surveillance",
        label: "Data Privacy and Surveillance Limits",
        description: "Consent, minimization, and safeguards against intrusive monitoring.",
      },
      {
        id: "cybersecurity-consumer-protection",
        label: "Cybersecurity and Consumer Protection",
        description: "Security practices and protection from data misuse.",
      },
      {
        id: "ai-safety-fairness",
        label: "AI Safety, Fairness, and Accountability",
        description: "Risk controls, testing, red-teaming, and governance standards.",
      },
      {
        id: "content-platform-governance",
        label: "Content and Platform Governance",
        description: "Moderation quality, transparency, and recourse for harm.",
      },
    ],
  },
  {
    id: "climate-environment",
    label: "Climate and Environment",
    description: "Climate mitigation, adaptation, biodiversity, and pollution outcomes.",
    subcategories: [
      {
        id: "emissions-clean-energy",
        label: "Emissions Reduction and Clean Energy",
        description: "Decarbonization targets, energy transition spending, and performance.",
      },
      {
        id: "adaptation-resilience",
        label: "Climate Adaptation and Resilience",
        description: "Community and infrastructure resilience against climate impacts.",
      },
      {
        id: "biodiversity-land-water",
        label: "Biodiversity and Land/Water Protection",
        description: "Habitat protection and water stewardship support.",
      },
      {
        id: "pollution-waste",
        label: "Pollution and Waste Reduction",
        description: "Waste, toxins, and circularity initiatives.",
      },
    ],
  },
  {
    id: "health-human-services",
    label: "Health and Human Services",
    description: "Public health, essential needs, and emergency support.",
    subcategories: [
      {
        id: "public-health-access",
        label: "Public Health Access",
        description: "Access to healthcare and preventive services.",
      },
      {
        id: "mental-health",
        label: "Mental Health Support",
        description: "Funding and programs for mental health outcomes.",
      },
      {
        id: "housing-food-security",
        label: "Housing and Food Security",
        description: "Support for housing stability and food access.",
      },
      {
        id: "disaster-emergency-relief",
        label: "Disaster and Emergency Relief",
        description: "Rapid aid for disasters and humanitarian crises.",
      },
    ],
  },
  {
    id: "education-opportunity",
    label: "Education and Opportunity",
    description: "Education access, research support, and opportunity mobility.",
    subcategories: [
      {
        id: "k12-support",
        label: "K-12 Education Support",
        description: "School funding, educator support, and student programs.",
      },
      {
        id: "higher-ed-research",
        label: "Higher-Ed and Research Funding",
        description: "University partnerships, grants, and public-interest research.",
      },
      {
        id: "stem-digital-literacy",
        label: "STEM and Digital Literacy",
        description: "STEM pipeline growth and technology access.",
      },
      {
        id: "scholarships-access",
        label: "Scholarships and Access Programs",
        description: "Affordability and inclusion initiatives for learners.",
      },
    ],
  },
  {
    id: "civil-democratic-institutions",
    label: "Civil and Democratic Institutions",
    description: "Democratic integrity, anti-corruption, and civic health.",
    subcategories: [
      {
        id: "voting-civic-participation",
        label: "Voting and Civic Participation",
        description: "Programs that expand civic access and democratic participation.",
      },
      {
        id: "anti-corruption-transparency",
        label: "Anti-Corruption and Transparency",
        description: "Governance reforms and anti-corruption advocacy.",
      },
      {
        id: "rule-of-law-human-rights",
        label: "Rule of Law and Human Rights",
        description: "Civil liberties and legal rights protections.",
      },
      {
        id: "journalism-misinformation-resilience",
        label: "Journalism and Misinformation Resilience",
        description: "Independent journalism, media literacy, and truth infrastructure.",
      },
    ],
  },
  {
    id: "equity-inclusion",
    label: "Equity and Inclusion",
    description: "Inclusion outcomes across protected groups and access needs.",
    subcategories: [
      {
        id: "anti-discrimination",
        label: "Anti-Discrimination Initiatives",
        description: "Programs addressing systemic bias and discrimination.",
      },
      {
        id: "accessibility-disability",
        label: "Accessibility and Disability Inclusion",
        description: "Inclusive design and disability rights support.",
      },
      {
        id: "gender-racial-equity",
        label: "Gender and Racial Equity",
        description: "Representation, opportunity, and equity interventions.",
      },
      {
        id: "lgbtq-protections",
        label: "LGBTQ+ Protections and Support",
        description: "Safety, rights, and inclusion for LGBTQ+ communities.",
      },
    ],
  },
  {
    id: "other-unclassified",
    label: "Other/Unclassified",
    description: "Use only when evidence cannot be reliably mapped to a core category.",
    subcategories: [],
  },
];

export const CAUSE_SIGNAL_TYPES: { id: CauseSignalType; label: string }[] = [
  { id: "grant-donation", label: "Grant/Donation Amount" },
  { id: "recipient-disclosure", label: "Recipient Organization Disclosure" },
  { id: "policy-commitment", label: "Public Policy/Commitment Signal" },
  { id: "lobbying-alignment", label: "Lobbying Alignment" },
  { id: "pac-political-spend", label: "PAC/Political Spend Alignment" },
  { id: "trade-association-alignment", label: "Trade Association Alignment" },
];

export const SOURCE_TIER_DESCRIPTION: Record<SourceTier, string> = {
  primary:
    "Regulatory filings, official grant disclosures, audited statements, and first-party legal disclosures.",
  secondary:
    "Company ESG/CSR publications and official press statements that cite verifiable facts.",
  tertiary:
    "Credible third-party journalism and watchdog summaries when primary documentation is absent.",
};

export const CONFIDENCE_RULES: Record<ConfidenceLevel, string> = {
  high: "Named recipient + dated source + amount disclosed from primary/regulated source.",
  medium: "Recipient and cause are verifiable but amount is missing or partial.",
  low: "Statement-only support signal with no clear recipient or spend amount.",
};

export const CAUSE_SCORE_WEIGHTS: CauseScoreWeights = {
  supportSignal: 25,
  spendingAlignment: 40,
  disclosureQuality: 25,
  alignmentGap: 10,
};

export interface CauseCoverageSnapshot {
  sourceCount: number;
  independentSourceCount: number;
  hasSpendingAmount: boolean;
  hasRecipientDisclosure: boolean;
}

export function isCauseCompositeEligible(snapshot: CauseCoverageSnapshot): {
  eligible: boolean;
  reason?: string;
} {
  if (!snapshot.hasSpendingAmount) {
    return {
      eligible: false,
      reason: "Insufficient spending disclosure: no verifiable amount found.",
    };
  }
  if (snapshot.independentSourceCount < 2) {
    return {
      eligible: false,
      reason: "Insufficient source diversity: minimum two independent sources required.",
    };
  }
  return { eligible: true };
}
