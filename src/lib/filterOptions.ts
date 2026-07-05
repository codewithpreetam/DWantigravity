/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * filterOptions.ts
 *
 * Server-side helpers that query the database to derive dynamic,
 * data-driven filter option lists for every opportunity type.
 * No values are hardcoded — everything comes from what employers
 * actually filled in when creating listings.
 */

import { db } from "@/lib/db";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deduplicate and sort a string array, dropping blank values */
function dedup(arr: (string | null | undefined)[]): string[] {
  return [...new Set(arr.filter(Boolean) as string[])].sort();
}

/** Build salary/budget/amount bracket options from real values */
function buildSalaryBrackets(
  values: (number | null | undefined)[]
): { label: string; value: string }[] {
  const nums = values.filter((v): v is number => typeof v === "number" && v > 0);
  if (!nums.length) return [];
  const max = Math.max(...nums);
  const min = Math.min(...nums);

  const brackets =
    max <= 50000
      ? [
          { label: "Under ₹25k", value: "0-25000" },
          { label: "₹25k–₹50k", value: "25000-50000" },
        ]
      : max <= 500000
      ? [
          { label: "Under ₹50k", value: "0-50000" },
          { label: "₹50k–₹1L", value: "50000-100000" },
          { label: "₹1L–₹3L", value: "100000-300000" },
          { label: "₹3L–₹5L", value: "300000-500000" },
        ]
      : [
          { label: "Under ₹5L", value: "0-500000" },
          { label: "₹5L–₹10L", value: "500000-1000000" },
          { label: "₹10L–₹20L", value: "1000000-2000000" },
          { label: "Over ₹20L", value: "2000000-999999999" },
        ];

  return brackets.filter((b) => {
    const parts = b.value.split("-").map(Number);
    const lo = parts[0];
    const hi = parts[1];
    return min <= hi && max >= lo;
  });
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export async function getJobFilterOptions() {
  const jobs = await db.job.findMany({
    where: { isActive: true },
    select: {
      location: true,
      workMode: true,
      employmentType: true,
      requiredSkills: true,
      minEducation: true,
      minExperienceYears: true,
      salaryMin: true,
      salaryMax: true,
    },
  });

  // Prisma types are precise, use typed casting
  const locations = dedup(jobs.map((j: any) => j.location));
  const workModes = dedup(jobs.map((j: any) => j.workMode));
  const employmentTypes = dedup(jobs.map((j: any) => j.employmentType));
  const education = dedup(jobs.map((j: any) => j.minEducation));
  const skills = dedup(jobs.flatMap((j: any) => j.requiredSkills as string[]));
  const expYearsRaw: number[] = jobs
    .map((j: any) => j.minExperienceYears as number | null)
    .filter((v: number | null): v is number => v != null);
  const expYears: number[] = [...new Set(expYearsRaw)].sort((a, b) => a - b);
  const salaryBrackets = buildSalaryBrackets([
    ...jobs.map((j: any) => j.salaryMin as number | null),
    ...jobs.map((j: any) => j.salaryMax as number | null),
  ]);

  return { locations, workModes, employmentTypes, education, skills, expYears, salaryBrackets };
}

// ─── Internships ──────────────────────────────────────────────────────────────

export async function getInternshipFilterOptions() {
  const rows = await db.internship.findMany({
    where: { isActive: true },
    select: {
      location: true,
      durationMonths: true,
      requiredSkills: true,
      minEducation: true,
      minExperienceYears: true,
      stipend: true,
    },
  });

  const locations = dedup(rows.map((r: any) => r.location));
  const durationsRaw: number[] = rows
    .map((r: any) => r.durationMonths as number | null)
    .filter((d: number | null): d is number => d != null);
  const durations: number[] = [...new Set(durationsRaw)].sort((a, b) => a - b);
  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const stipendBrackets = buildSalaryBrackets(rows.map((r: any) => r.stipend as number | null));

  return { locations, durations, education, skills, stipendBrackets };
}

// ─── Fellowships ──────────────────────────────────────────────────────────────

export async function getFellowshipFilterOptions() {
  const rows = await db.fellowship.findMany({
    where: { isActive: true },
    select: {
      location: true,
      durationMonths: true,
      requiredSkills: true,
      minEducation: true,
      stipend: true,
    },
  });

  const locations = dedup(rows.map((r: any) => r.location));
  const durationsRaw: number[] = rows
    .map((r: any) => r.durationMonths as number | null)
    .filter((d: number | null): d is number => d != null);
  const durations: number[] = [...new Set(durationsRaw)].sort((a, b) => a - b);
  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const stipendBrackets = buildSalaryBrackets(rows.map((r: any) => r.stipend as number | null));

  return { locations, durations, education, skills, stipendBrackets };
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

export async function getScholarshipFilterOptions() {
  const rows = await db.scholarship.findMany({
    select: {
      requiredSkills: true,
      minEducation: true,
      amount: true,
    },
  });

  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const amountBrackets = buildSalaryBrackets(rows.map((r: any) => r.amount as number | null));

  return { education, skills, amountBrackets };
}

// ─── Grants ────────────────────────────────────────────────────────────────────

export async function getGrantFilterOptions() {
  const rows = await db.grant.findMany({
    where: { isActive: true },
    select: {
      requiredSkills: true,
      minEducation: true,
      amount: true,
    },
  });

  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const fundingBrackets = buildSalaryBrackets(rows.map((r: any) => r.amount as number | null));

  return { education, skills, fundingBrackets };
}

// ─── Consultancies ────────────────────────────────────────────────────────────

export async function getConsultancyFilterOptions() {
  const rows = await db.consultancy.findMany({
    select: {
      location: true,
      requiredSkills: true,
      minEducation: true,
      minExperienceYears: true,
      budget: true,
    },
  });

  const locations = dedup(rows.map((r: any) => r.location));
  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const budgetBrackets = buildSalaryBrackets(rows.map((r: any) => r.budget as number | null));

  return { locations, education, skills, budgetBrackets };
}

// ─── Volunteer ────────────────────────────────────────────────────────────────

export async function getVolunteerFilterOptions() {
  const rows = await db.volunteer.findMany({
    select: {
      location: true,
      requiredSkills: true,
      minEducation: true,
      minExperienceYears: true,
    },
  });

  const locations = dedup(rows.map((r: any) => r.location));
  const education = dedup(rows.map((r: any) => r.minEducation));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));
  const expYearsRaw2: number[] = rows
    .map((r: any) => r.minExperienceYears as number | null)
    .filter((v: number | null): v is number => v != null);
  const expYears: number[] = [...new Set(expYearsRaw2)].sort((a, b) => a - b);

  return { locations, education, skills, expYears };
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getEventFilterOptions() {
  const rows = await db.event.findMany({
    select: {
      location: true,
      format: true,
      requiredSkills: true,
    },
  });

  const locations = dedup(rows.map((r: any) => r.location));
  const formats = dedup(rows.map((r: any) => r.format));
  const skills = dedup(rows.flatMap((r: any) => r.requiredSkills as string[]));

  return { locations, formats, skills };
}
