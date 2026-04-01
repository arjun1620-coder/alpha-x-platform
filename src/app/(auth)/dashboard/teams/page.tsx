"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Network, Shield, Plus, ChevronRight, CheckCircle2, Circle, Loader2, Trash2, X, Target, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function TeamsDashboard() {
  const [teams, setTeams] = useState<any[]>([]);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedNewMember, setSelectedNewMember] = useState("");
  
  // Forms
  const [newTeamName, setNewTeamName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const storedMember = localStorage.getItem('memberData');
    if (storedMember) {
      try { setMemberData(JSON.parse(storedMember)); } catch(e) {}
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch Teams with their nested tasks and members
    const { data: dbTeams } = await supabase
      .from('teams')
      .select(`
        *,
        tasks (*),
        members:applications (*)
      `)
      .order('created_at', { ascending: false });

    // Fetch all approved applications
    const { data: dbApproved } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'approved');

    if (dbTeams) setTeams(dbTeams);
    if (dbApproved) setAvailableMembers(dbApproved);
    
    setIsLoading(false);
  };

  // For members: auto-select their team
  useEffect(() => {
    if (userRole === 'member' && memberData?.team_id) {
      setSelectedTeamId(memberData.team_id);
    } else if (userRole === 'admin' && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [userRole, memberData, teams, selectedTeamId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    setIsCreatingTeam(true);
    
    const { data } = await supabase
      .from('teams')
      .insert({ name: newTeamName })
      .select();

    if (data && data.length > 0) {
      setNewTeamName("");
      setSelectedTeamId(data[0].id);
      await fetchData();
    }
    setIsCreatingTeam(false);
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to disband this team?")) return;
    await supabase.from('teams').delete().eq('id', id);
    if (selectedTeamId === id) setSelectedTeamId(null);
    fetchData();
  };

  const handleAssignMember = async (memberId: string) => {
    if (!selectedTeamId) return;
    await supabase
      .from('applications')
      .update({ team_id: selectedTeamId })
      .eq('id', memberId);
    
    setSelectedNewMember("");
    fetchData();
  };

  const handleAddMemberFromDropdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewMember || !selectedTeamId) return;
    await handleAssignMember(selectedNewMember);
  };

  const handleRemoveMember = async (memberId: string) => {
    await supabase
      .from('applications')
      .update({ team_id: null })
      .eq('id', memberId);
    fetchData();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !selectedTeamId) return;

    await supabase
      .from('tasks')
      .insert({ team_id: selectedTeamId, title: newTaskTitle });
    
    setNewTaskTitle("");
    fetchData();
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
    fetchData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchData();
  };

  // For members: only show their own team
  const visibleTeams = userRole === 'member'
    ? teams.filter(t => t.id === memberData?.team_id)
    : teams;

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  // Member with no team assigned
  const memberHasNoTeam = userRole === 'member' && !memberData?.team_id;

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#080d1a] p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center">
              <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {userRole === 'admin' ? 'ADMIN' : 'MEMBER'}
            </span>
          </div>

          <nav className="space-y-2 flex-1">
            {userRole === 'admin' && (
              <>
                <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Users className="w-5 h-5" /> Applications
                </Link>
              </>
            )}
            <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Network className="w-5 h-5" /> Teams
            </Link>
            <Link href="/dashboard/events" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Calendar className="w-5 h-5" /> Announcements
            </Link>
            {userRole === 'admin' && (
              <>
                <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Activity className="w-5 h-5" /> Post Management
                </Link>
                <Link href="/dashboard/components" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Shield className="w-5 h-5" /> Components
                </Link>
                <Link href="/dashboard/payments" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Activity className="w-5 h-5" /> Payments
                </Link>
              </>
            )}
            {userRole === 'member' && (
              <>
                <Link href="/dashboard/components" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Shield className="w-5 h-5" /> Components
                </Link>
                <Link href="/dashboard/payments" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Activity className="w-5 h-5" /> Payments
                </Link>
              </>
            )}
          </nav>

          <button 
            onClick={async () => {
              if (userRole === 'admin') await supabase.auth.signOut();
              localStorage.removeItem('userRole');
              localStorage.removeItem('memberData');
              window.location.href='/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all text-left"
          >
            <ArrowLeft className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto relative z-10 w-full p-8 lg:p-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Network className="w-8 h-8 text-indigo-500" />
              {userRole === 'member' ? 'My Team' : 'Team Assembly Matrix'}
            </h1>
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
              {userRole === 'member'
                ? 'View your team details and manage your assigned task directives.'
                : 'Group approved engineers into specialized teams, monitor their technical rosters, and assign dynamic tasks.'}
            </p>
          </div>

          {/* Member with no team */}
          {memberHasNoTeam && (
            <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
              <Network className="w-16 h-16 text-gray-700 mb-6" />
              <h2 className="text-2xl font-bold text-gray-400">Not Assigned to a Team</h2>
              <p className="text-gray-500 max-w-sm mt-3">You haven&apos;t been assigned to a team yet. Please wait for an admin to assign you.</p>
            </div>
          )}

          {!memberHasNoTeam && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[70vh]">
            
            {/* Left Column: Team Directory List (Admin only) */}
            {userRole === 'admin' && (
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm shadow-xl flex flex-col h-full">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex justify-between items-center">
                  Active Teams
                </h2>

                <form onSubmit={handleCreateTeam} className="flex gap-2 mb-6">
                  <input
                    type="text"
                    required
                    placeholder="New Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="flex-1 bg-[#030712] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                  <button type="submit" disabled={isCreatingTeam} className="bg-indigo-500 text-black px-3 rounded-xl hover:bg-indigo-400 transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                </form>

                {isLoading ? (
                  <div className="flex-1 flex justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {visibleTeams.map((team) => (
                      <div 
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`bg-[#030712] border ${selectedTeamId === team.id ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-indigo-500/5' : 'border-white/5 hover:border-white/20'} rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all`}
                      >
                        <div>
                          <h3 className="font-bold text-white text-sm mb-1">{team.name}</h3>
                          <div className="flex items-center gap-3 text-xs font-semibold tracking-wider uppercase">
                            <span className="text-slate-400">{team.members?.length || 0} Members</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-indigo-500 opacity-60">{team.tasks?.filter((t:any)=>t.status==='completed').length || 0}/{team.tasks?.length || 0} Tasks</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${selectedTeamId === team.id ? 'text-indigo-500' : 'text-gray-600'} group-hover:translate-x-1 transition-transform`} />
                      </div>
                    ))}
                    {visibleTeams.length === 0 && (
                      <p className="text-center text-gray-500 text-sm mt-10">No active teams.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Right Column: Selected Team Deep Dive */}
            <div className={`${userRole === 'admin' ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-6`}>
              
              {!selectedTeam && !isLoading ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center h-full backdrop-blur-sm">
                   <Network className="w-16 h-16 text-gray-700 mb-6" />
                   <h2 className="text-2xl font-bold text-gray-400">No Team Selected</h2>
                   <p className="text-gray-500 max-w-sm mt-3">Select a team from the registry or create a new team to manage sub-systems and tasks.</p>
                </div>
              ) : selectedTeam && (
                <>
                  {/* Top Bar */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedTeam.name}</h2>
                      <p className="text-sm text-gray-400 font-medium font-mono">ID: {selectedTeam.id}</p>
                    </div>
                    {userRole === 'admin' && (
                    <button onClick={() => handleDeleteTeam(selectedTeam.id)} className="px-4 py-2 border border-red-500/20 text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold tracking-wider uppercase">
                      Disband Team
                    </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                    
                    {/* Left Pane: Roster & Members */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Team Roster ({selectedTeam.members?.length || 0})
                      </h3>

                      {userRole === 'admin' && (
                        <form onSubmit={handleAddMemberFromDropdown} className="flex gap-2 mb-6 bg-[#030712] p-2 rounded-xl border border-white/10 shadow-inner">
                          <select 
                            aria-label="Select Operative to Add"
                            value={selectedNewMember}
                            onChange={(e) => setSelectedNewMember(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-white focus:outline-none px-2 appearance-none"
                          >
                            <option value="" disabled>+ Select Operative to Add...</option>
                            {availableMembers.filter((m: any) => m.team_id !== selectedTeam.id).map((member: any) => (
                              <option key={member.id} value={member.id}>
                                {member.full_name} {member.team_id ? '(Move from another team)' : '(Unassigned)'}
                              </option>
                            ))}
                          </select>
                          <button 
                            type="submit" 
                            disabled={!selectedNewMember} 
                            className="bg-indigo-500 text-black px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50 hover:bg-indigo-400"
                          >
                            Add
                          </button>
                        </form>
                      )}
                      
                      <div className="space-y-3 mb-8 overflow-y-auto max-h-80 flex-1">
                        {selectedTeam.members?.map((member: any) => (
                          <div key={member.id} className="bg-[#030712] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs shadow-inner uppercase">
                                {member.full_name?.substring(0,2) || "??"}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-white">{member.full_name || "Operative"}</h4>
                                <p className="text-xs text-slate-400">{(member.skills || []).slice(0,2).join(", ")}</p>
                              </div>
                            </div>
                            {userRole === 'admin' && (
                            <button onClick={() => handleRemoveMember(member.id)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2">
                              <X className="w-4 h-4" />
                            </button>
                            )}
                          </div>
                        ))}
                        {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                          <div className="bg-[#030712] border border-dashed border-white/10 rounded-xl p-8 text-center text-gray-500 text-sm">
                            No members assigned yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Pane: Tasks */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Task Directives
                      </h3>

                      {userRole === 'admin' && (
                      <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                        <input
                          type="text"
                          required
                          placeholder="Assign new task..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="flex-1 bg-[#030712] border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                        />
                        <button type="submit" disabled={!newTaskTitle} className="bg-white/5 text-white border border-white/10 px-4 rounded-xl hover:bg-indigo-500 hover:text-black font-bold uppercase tracking-wider text-xs transition-all disabled:opacity-50">
                          Add
                        </button>
                      </form>
                      )}

                      <div className="space-y-2 overflow-y-auto flex-1 h-full pr-2">
                        {selectedTeam.tasks?.length === 0 && (
                          <div className="bg-[#030712] border border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                            <CheckCircle2 className="w-8 h-8 text-gray-700 mb-3" />
                            <p className="text-gray-500 text-sm">No tasks assigned yet.</p>
                          </div>
                        )}

                        {selectedTeam.tasks?.map((task: any) => (
                           <div key={task.id} className="bg-[#030712] border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                               {/* Members can also toggle task completion */}
                               <button 
                                 onClick={() => handleToggleTaskStatus(task.id, task.status)} 
                                 className="p-1 hover:bg-white/5 cursor-pointer rounded-full transition-colors flex-shrink-0"
                                 title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                               >
                                 {task.status === 'completed' ? (
                                   <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                                 ) : (
                                   <Circle className="w-5 h-5 text-gray-600" />
                                 )}
                               </button>
                               <span className={`text-sm ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                 {task.title}
                               </span>
                             </div>
                             {userRole === 'admin' && (
                             <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 p-2 transition-all">
                               <Trash2 className="w-4 h-4" />
                             </button>
                             )}
                           </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
