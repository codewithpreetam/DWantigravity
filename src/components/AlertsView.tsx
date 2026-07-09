"use client";

import React, { useEffect } from "react";
import { Bell, CheckCircle, Info } from "lucide-react";

interface AlertsViewProps {
  notifications: any[];
  onMarkRead: () => void;
}

export default function AlertsView({ notifications, onMarkRead }: AlertsViewProps) {
  useEffect(() => {
    // Automatically mark read when they open the tab
    if (notifications.some(n => !n.read)) {
      onMarkRead();
    }
  }, [notifications, onMarkRead]);

  return (
    <div className="space-y-6 text-xs text-left">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Alerts & Notifications
        </h2>
        <p className="text-xs text-muted">A timeline of system messages, support replies, and application updates.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-card-border">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted flex flex-col items-center">
            <Bell className="w-8 h-8 opacity-20 mb-2" />
            <p className="italic font-medium">No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl border ${notif.read ? 'border-border bg-background/50' : 'border-primary/30 bg-primary/5'} flex gap-4 transition-colors`}
              >
                <div className={`mt-0.5 shrink-0 ${notif.read ? 'text-muted' : 'text-primary'}`}>
                  {notif.read ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`font-bold text-sm ${notif.read ? 'text-foreground' : 'text-primary'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-muted whitespace-nowrap font-medium">
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
