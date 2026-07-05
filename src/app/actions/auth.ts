"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { UserRole, OrgStatus } from "@prisma/client";
import { AuthError } from "next-auth";

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // NextJS redirect uses throw error, so we must rethrow to let NextJS redirect
    throw error;
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) as UserRole;
  const orgName = formData.get("orgName") as string;
  const callbackUrl = "/auth/signin?signup=success";

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    // Check if user exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Email already registered." };
    }

    const hashedPassword = hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // If role is EMPLOYER, link or create the Organization
    const orgId = formData.get("orgId") as string;
    if (role === UserRole.EMPLOYER) {
      if (orgId && orgId !== "new") {
        // Link to existing organization
        const org = await db.organization.findUnique({
          where: { id: orgId }
        });
        if (!org) {
          return { error: "Selected organization does not exist." };
        }
        
        await db.user.update({
          where: { id: user.id },
          data: { 
            organizationId: org.id,
            roleInOrg: "Recruiter"
          },
        });
      } else {
        if (!orgName) {
          return { error: "Organization name is required for Employer registration." };
        }

        // Prevent duplicate organization profiles
        const existingOrg = await db.organization.findFirst({
          where: { name: { equals: orgName, mode: "insensitive" } }
        });
        if (existingOrg) {
          return { error: `Organization "${orgName}" already exists. Please search and select it from the suggestions.` };
        }
        
        const org = await db.organization.create({
          data: {
            name: orgName,
            status: OrgStatus.PENDING,
            ownerId: user.id,
          },
        });

        // Update user with organizationId
        await db.user.update({
          where: { id: user.id },
          data: { 
            organizationId: org.id, 
            roleInOrg: "Owner" 
          },
        });
      }
    }

    return { success: true, redirect: callbackUrl };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: `Registration failed: ${error.message}` };
  }
}
