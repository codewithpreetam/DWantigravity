export interface MatchResult {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    education: number;
    location: number;
    languages: number;
    workMode: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
}

const EDUCATION_RANKS: Record<string, number> = {
  "High School": 1,
  "Bachelor's": 2,
  "Master's": 3,
  "Doctorate": 4,
};

function normalizeString(val: string | null | undefined): string {
  return (val || "").trim().toLowerCase();
}

export function calculateCompatibility(candidate: any, opportunity: any): MatchResult {
  if (!candidate || !opportunity) {
    return {
      score: 0,
      breakdown: { skills: 0, experience: 0, education: 0, location: 0, languages: 0, workMode: 0 },
      matchedSkills: [],
      missingSkills: [],
    };
  }

  // ── Candidate data ────────────────────────────────────────────────────────
  const candidateSkills = (candidate.skills || []).map((s: string) => normalizeString(s));
  const candidateExpYears: number = candidate.experienceYears ?? 0;
  const candidateEduRank: number = EDUCATION_RANKS[candidate.educationDegree || ""] || 0;
  const candidateLocation = normalizeString(candidate.location);
  const candidateLanguages = (candidate.languages || []).map((l: string) => normalizeString(l));
  const candidateWorkMode = normalizeString(candidate.preferredWorkMode || "");

  // ── Opportunity data ──────────────────────────────────────────────────────
  const oppReqSkills = (opportunity.requiredSkills || []).map((s: string) => normalizeString(s));
  const oppPrefSkills = (opportunity.preferredSkills || []).map((s: string) => normalizeString(s));
  const oppMinExpYears: number = opportunity.minExperienceYears ?? 0;
  const oppMinEduRank: number = EDUCATION_RANKS[opportunity.minEducation || ""] || 0;
  const oppReqLanguages = (opportunity.requiredLanguages || []).map((l: string) => normalizeString(l));
  const oppLocation = normalizeString(opportunity.location);
  const oppWorkMode = normalizeString(opportunity.workMode);
  const oppIsRemote = opportunity.isRemote === true || oppWorkMode === "remote";

  // ── 1. Skills Score (40%) ────────────────────────────────────────────────
  // If no skills required anywhere → treat as no filter = 100
  // If required skills exist but candidate has none matching → proportional penalty
  let skillsScore = 100;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const totalSkillsCount = oppReqSkills.length + oppPrefSkills.length;

  if (totalSkillsCount > 0) {
    // Opportunity HAS requirements — calculate actual overlap
    let earnedPoints = 0;
    let maxPoints = 0;

    opportunity.requiredSkills.forEach((skill: string) => {
      const norm = normalizeString(skill);
      maxPoints += 10;
      if (candidateSkills.includes(norm)) {
        earnedPoints += 10;
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    opportunity.preferredSkills.forEach((skill: string) => {
      const norm = normalizeString(skill);
      maxPoints += 5;
      if (candidateSkills.includes(norm)) {
        earnedPoints += 5;
        matchedSkills.push(skill);
      } else {
        missingSkills.push(`${skill} (Preferred)`);
      }
    });

    skillsScore = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
  } else if (candidateSkills.length === 0) {
    // Neither side has skills — neutral/unscored: give partial credit (50)
    // rather than inflating to 100 — we don't truly know alignment
    skillsScore = 50;
  }
  // else: opportunity has no skill filter but candidate has skills → 100 (any candidate qualifies)

  // ── 2. Experience Score (25%) ─────────────────────────────────────────────
  // If opportunity requires 0 years → no filter, any candidate qualifies = 100
  // If > 0 required → proportional match (capped at 100)
  let expScore = 100;
  if (oppMinExpYears > 0) {
    if (candidateExpYears >= oppMinExpYears) {
      expScore = 100;
    } else {
      expScore = Math.round((candidateExpYears / oppMinExpYears) * 100);
    }
  }

  // ── 3. Education Score (15%) ──────────────────────────────────────────────
  // If opportunity specifies no minimum → 100 for all
  // If both have no education data → 50 (unknown, don't inflate)
  let eduScore = 100;
  if (oppMinEduRank > 0) {
    if (candidateEduRank === 0) {
      // Candidate education unknown → assume doesn't meet requirement
      eduScore = 0;
    } else if (candidateEduRank >= oppMinEduRank) {
      eduScore = 100;
    } else {
      // Partial credit — lower degree
      eduScore = Math.round((candidateEduRank / oppMinEduRank) * 100);
    }
  } else if (candidateEduRank === 0) {
    // Neither specifies education — neutral
    eduScore = 75;
  }

  // ── 4. Location Score (10%) ───────────────────────────────────────────────
  // Remote opportunity → anyone qualifies = 100
  // Candidate has no location set AND opportunity requires one → penalty
  // City-level match → 100; partial word match → 70; full mismatch → 30
  let locScore: number;

  if (oppIsRemote) {
    locScore = 100; // fully remote — location irrelevant
  } else if (!oppLocation) {
    locScore = 100; // opportunity didn't specify location — no filter
  } else if (!candidateLocation) {
    // Opportunity requires location but candidate hasn't provided one
    locScore = 30;
  } else if (candidateLocation === oppLocation) {
    locScore = 100;
  } else if (
    candidateLocation.includes(oppLocation) ||
    oppLocation.includes(candidateLocation)
  ) {
    // Partial city/state match (e.g. "mumbai" vs "mumbai, maharashtra")
    locScore = 80;
  } else {
    locScore = 30; // different city — low score, not zero (candidate may relocate)
  }

  // ── 5. Languages Score (5%) ───────────────────────────────────────────────
  // No required languages → 100
  // Has required languages but candidate has none specified → 30 (assume basic)
  let langScore = 100;
  if (oppReqLanguages.length > 0) {
    if (candidateLanguages.length === 0) {
      // Candidate hasn't listed languages — partial, don't assume zero
      langScore = 40;
    } else {
      let matchedCount = 0;
      oppReqLanguages.forEach((lang: string) => {
        if (candidateLanguages.includes(lang)) matchedCount++;
      });
      langScore = Math.round((matchedCount / oppReqLanguages.length) * 100);
    }
  }

  // ── 6. Work Mode Score (5%) ───────────────────────────────────────────────
  // Full match if remote or if candidate mode matches opp mode or either is unspecified
  let workModeScore = 100;
  if (oppIsRemote) {
    workModeScore = 100;
  } else if (candidateWorkMode && oppWorkMode && candidateWorkMode !== oppWorkMode) {
    workModeScore = 50; // mismatch penalty
  }

  // ── Final weighted score ─────────────────────────────────────────────────
  const score = Math.min(
    100,
    Math.round(
      skillsScore * 0.4 +
        expScore * 0.25 +
        eduScore * 0.15 +
        locScore * 0.1 +
        langScore * 0.05 +
        workModeScore * 0.05
    )
  );

  return {
    score,
    breakdown: {
      skills: Math.round(skillsScore),
      experience: Math.round(expScore),
      education: Math.round(eduScore),
      location: Math.round(locScore),
      languages: Math.round(langScore),
      workMode: Math.round(workModeScore),
    },
    matchedSkills,
    missingSkills,
  };
}
