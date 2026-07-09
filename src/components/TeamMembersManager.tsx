"use client";

import { useState } from "react";
import { Users, Plus, X, GripVertical, Trash2, Edit2, CheckCircle2, User, Mail, Briefcase, Info, Phone, Globe, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { 
  addTeamMemberAction, 
  updateTeamMemberAction, 
  deleteTeamMemberAction,
  reorderTeamMembersAction
} from "@/app/actions/employer";

export default function TeamMembersManager({
  organizationId,
  teamMembers
}: {
  organizationId: string;
  teamMembers: any[];
}) {
  const [members, setMembers] = useState(teamMembers || []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newMembers = [...members];
    const draggedMember = newMembers[draggedIdx];
    newMembers.splice(draggedIdx, 1);
    newMembers.splice(idx, 0, draggedMember);

    setDraggedIdx(idx);
    setMembers(newMembers);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIdx(null);
    
    // Save new order to backend
    const orderedIds = members.map(m => m.id);
    await reorderTeamMembersAction(orderedIds);
    toast.success("Team order saved.");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("orgId", organizationId);
    
    if (editingMember) {
      formData.append("memberId", editingMember.id);
      const res = await updateTeamMemberAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Team member updated.");
        setIsAddOpen(false);
        setEditingMember(null);
        window.location.reload();
      }
    } else {
      formData.append("displayOrder", members.length.toString());
      const res = await addTeamMemberAction(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Team member added.");
        setIsAddOpen(false);
        window.location.reload();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    const formData = new FormData();
    formData.append("memberId", id);
    const res = await deleteTeamMemberAction(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Team member removed.");
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-foreground">Meet Our Team</h2>
          <p className="text-[11px] text-muted">Showcase your organization's recruitment or program team on your public profile.</p>
        </div>
        <button 
          onClick={() => {
            setEditingMember(null);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member</span>
        </button>
      </div>

      {(isAddOpen || editingMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-lg border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-foreground">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button 
                onClick={() => { setIsAddOpen(false); setEditingMember(null); }}
                className="text-muted hover:text-foreground p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted">Full Name *</label>
                  <input type="text" name="fullName" required defaultValue={editingMember?.fullName} placeholder="Jane Doe" className="form-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted">Designation *</label>
                  <input type="text" name="designation" required defaultValue={editingMember?.designation} placeholder="Recruitment Lead" className="form-input w-full" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted">Profile Photo URL</label>
                <input type="url" name="profilePhoto" defaultValue={editingMember?.profilePhoto} placeholder="https://..." className="form-input w-full" />
                <p className="text-[10px] text-muted">Optional. Must be a valid image URL.</p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted">Short Bio</label>
                <textarea name="bio" rows={3} defaultValue={editingMember?.bio} placeholder="Brief description (250-500 characters)..." className="form-input w-full resize-none" maxLength={500} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                  <input type="email" name="email" defaultValue={editingMember?.email} placeholder="jane@org.org" className="form-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                  <input type="tel" name="phone" defaultValue={editingMember?.phone} placeholder="+91..." className="form-input w-full" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted flex items-center gap-1"><Globe className="w-3 h-3" /> LinkedIn</label>
                  <input type="url" name="linkedinUrl" defaultValue={editingMember?.linkedinUrl} placeholder="https://linkedin.com/in/..." className="form-input w-full" />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 mt-4 pb-2">
                <button type="button" onClick={() => { setIsAddOpen(false); setEditingMember(null); }} className="px-4 py-2 font-bold text-muted hover:text-foreground bg-neutral-100 dark:bg-zinc-800 rounded-lg cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer">
                  {isSubmitting ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-card-border text-center text-muted py-12 italic">
            You haven't added any team members yet.
          </div>
        ) : (
          members.map((member, idx) => (
            <div 
              key={member.id} 
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={handleDrop}
              onDragEnd={() => setDraggedIdx(null)}
              className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all bg-white/20 dark:bg-zinc-950/20 cursor-grab active:cursor-grabbing ${
                draggedIdx === idx ? "opacity-40 border-primary border-dashed" : "border-card-border"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <GripVertical className="w-5 h-5 text-muted hover:text-foreground cursor-grab active:cursor-grabbing" />
                
                {member.profilePhoto ? (
                  <img src={member.profilePhoto} alt={member.fullName} className="w-10 h-10 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                    {member.fullName.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="font-bold text-foreground text-sm leading-none">{member.fullName}</p>
                  <p className="text-xs text-primary font-medium mt-1">{member.designation}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingMember(member)}
                  className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors cursor-pointer" 
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(member.id)}
                  className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer" 
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <p className="text-[10px] text-muted italic mt-4 text-center">Drag and drop rows to reorder how they appear on your public profile.</p>
    </div>
  );
}
