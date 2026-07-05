"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Sends a message from a user to another (or admin) and spawns an unread notification.
 */
export async function sendSupportMessageAction(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const senderId = formData.get("senderId") as string;
  const receiverId = (formData.get("receiverId") as string) || "user-admin"; // defaults to admin
  const content = formData.get("content") as string;

  if (!senderId || !content.trim()) {
    return { error: "Sender and content are required." };
  }

  try {
    // 1. Create the message
    await db.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      }
    });

    // 2. Fetch sender name to make the notification look nice
    const sender = await db.user.findUnique({ where: { id: senderId } });
    const senderName = sender?.name || sender?.email || "Someone";

    // 3. Create the notification for the receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        title: "New Support Message",
        message: `${senderName} sent you a message: "${content.substring(0, 45)}${content.length > 45 ? "..." : ""}"`,
        read: false
      }
    });

    revalidatePath("/dashboard/employer");
    revalidatePath("/dashboard/candidate");
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error sending support message:", err);
    return { error: err.message };
  }
}

/**
 * Gets messages between two users.
 */
export async function getMessagesAction(userId: string, contactId: string = "user-admin") {
  try {
    const sent = await db.message.findMany({
      where: {
        senderId: userId,
        receiverId: contactId
      }
    });

    const received = await db.message.findMany({
      where: {
        senderId: contactId,
        receiverId: userId
      }
    });

    // Combine and sort chronologically
    const allMessages = [...sent, ...received].sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return allMessages;
  } catch (err) {
    console.error("Error loading messages:", err);
    return [];
  }
}

/**
 * Lists unique users who sent messages to admin, along with their last message info.
 */
export async function getAdminConversationsAction() {
  try {
    const messages = await db.message.findMany({
      where: {
        receiverId: "user-admin"
      }
    });

    // Get unique sender IDs
    const senderIds = Array.from(new Set(messages.map((m: any) => m.senderId)));
    
    const conversations = [];
    for (const senderId of senderIds) {
      if (senderId === "user-admin") continue;
      
      const user = await db.user.findUnique({ where: { id: senderId } });
      const userMsgs = messages.filter((m: any) => m.senderId === senderId);
      const lastMsg = userMsgs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      conversations.push({
        user,
        lastMessage: lastMsg,
        count: userMsgs.length
      });
    }

    return conversations;
  } catch (err) {
    console.error("Error loading admin conversations:", err);
    return [];
  }
}

/**
 * Loads notifications for a specific user.
 */
export async function getNotificationsAction(userId: string) {
  try {
    const list = await db.notification.findMany({
      where: { userId }
    });
    // Sort descending by creation date
    return list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error("Error loading notifications:", err);
    return [];
  }
}

/**
 * Marks all notifications as read.
 */
export async function markNotificationsReadAction(userId: string, skipRevalidate = false) {
  try {
    const unread = await db.notification.findMany({
      where: { userId, read: false }
    });

    for (const notif of unread) {
      await db.notification.update({
        where: { id: notif.id },
        data: { read: true }
      });
    }

    if (!skipRevalidate) {
      revalidatePath("/dashboard/employer");
      revalidatePath("/dashboard/candidate");
      revalidatePath("/dashboard/admin");
    }
    return { success: true };
  } catch (err) {
    console.error("Error marking notifications read:", err);
    return { success: false };
  }
}
