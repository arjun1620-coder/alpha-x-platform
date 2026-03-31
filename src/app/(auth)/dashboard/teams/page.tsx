"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Network, Shield, Plus, ChevronRight, Cpu, Target, CheckCircle2, Circle } from "lucide-react";

const MOCK_TEAMS = [
  {
    id: "team-1",
    name: "Avionics & Telemetry",
    lead: "Alex Rivera",
    members: ["Jamie Chen", "Sarah Jenkins", "Michael Chang"],
    project: "ESP32 Custom Boards",
    tasks: [
      { id: "t1", title: "Finalize PCB schematic", status: "completed" },
      { id: "t2", title: "Order components from Digikey", status: "pending" },
      { id: "t3", title: "Participate in National Hackathon Edge AI", status: "pending" }
    ]
  },
  {
    id: "team-2",
    name: "Mechanical & CAD",
    lead: "Marcus Johnson",
    members: ["Elena Rodriguez", "David Kim"],
    project: "Micro-drone Chassis",
    tasks: [
      { id: "t4", title: "3D Print prototype iteration 4", status: "pending" }
    ]
  },
  {
    id: "team-3",
    name: "AI & Autonomous Systems",
    lead: "Dr. Aris Vance",
    members: ["Sophie Turner"],
    project: "Lidar Mapping Algorithms",
    tasks: []
  }
];

export default function TeamsDashboard() {
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !selectedTeamId) return;

    setTeams(prevTeams => prevTeams.map(team => {
      if (team.id === selectedTeamId) {
        return {
          ...team,
          tasks: [...team.tasks, { id: `task-${Date.now()}`, title: newTaskTitle, status: "pending" }]
        };
      }
      return team;
    }));
    setNewTaskTitle("");
  };

  const toggleTaskStatus = (teamId: string, taskId: string) => {
    setTeams(prevTeams => prevTeams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          tasks: team.tasks.map(t => 
            t.id === taskId 
              ? { ...t, status: t.status === "completed" ? "pending" : "completed" } 
              : t
          )
        };
      }
      return team;
    }));
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Simplified Admin Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#080d1a] p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              ADMIN
            </span>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Users className="w-5 h-5" />
              Applications
            </Link>
            <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Activity className="w-5 h-5" />
              Post Management
            </Link>
            <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Network className="w-5 h-5" />
              Teams
            </Link>
          </nav>

          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
            <ArrowLeft className="w-5 h-5" />
            Sign Out
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8 lg:p-12 relative z-10 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Network className="w-8 h-8 text-emerald-500" />
                Team Management
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Manage your teams. Create new teams or view existing team members and tasks.
              </p>
            </div>
            
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            <div className="xl:col-span-1 space-y-4">
              <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 border-b border-white/5 pb-2">Active Teams</h2>
              
              {teams.map(team => (
                <button 
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                    selectedTeamId === team.id 
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold tracking-tight ${selectedTeamId === team.id ? 'text-emerald-400' : 'text-white'}`}>
                      {team.name}
                    </h3>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedTeamId === team.id ? 'text-emerald-400 rotate-90' : 'text-gray-600 group-hover:text-emerald-400'}`} />
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between items-center mt-3">
                    <span className="bg-black/40 px-2 py-1 rounded inline-flex items-center gap-1.5 border border-white/5">
                      <Users className="w-3 h-3" /> {team.members.length + 1} Members
                    </span>
                    <span className="font-medium text-gray-600">Lead: {team.lead.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Team Details Panel */}
            <div className="xl:col-span-2">
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl h-full min-h-[500px] flex flex-col relative overflow-hidden">
                
                {/* Background Accent */}
                {selectedTeamId && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                )}

                {selectedTeam ? (
                  <div className="relative z-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-start justify-between border-b border-white/10 pb-6 mb-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 text-emerald-400">
                          Active Team
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">{selectedTeam.name}</h2>
                        <div className="flex items-center gap-2 text-gray-400 mt-2 text-sm">
                          <Cpu className="w-4 h-4 text-gray-500" />
                          Current Project: <span className="text-gray-300 font-medium">{selectedTeam.project}</span>
                        </div>
                      </div>
                      
                      <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-inner hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        <Plus className="w-3 h-3" /> Add Member
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Team Lead */}
                      <div>
                        <h3 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" /> Team Lead
                        </h3>
                        <div className="bg-[#030712] border border-white/5 rounded-xl p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-900 flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden border border-white/10">
                              {selectedTeam.lead.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{selectedTeam.lead}</div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Admin</div>
                            </div>
                          </div>
                          <button className="text-xs text-gray-500 hover:text-white px-3 py-1 rounded border border-transparent hover:border-white/10 bg-transparent hover:bg-white/5 transition-all">
                            Manage
                          </button>
                        </div>
                      </div>

                      {/* Members */}
                      <div>
                        <h3 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" /> Team Members ({selectedTeam.members.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedTeam.members.map((member, idx) => (
                            <div key={idx} className="bg-[#030712] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs border border-white/10 text-gray-300">
                                  {member.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-300 group-hover:text-white transition-colors text-sm">{member}</div>
                                  <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">Engineering Staff</div>
                                </div>
                              </div>
                              <button className="text-xs text-red-500/50 hover:text-red-400 px-3 py-1 rounded border border-transparent hover:border-red-500/20 bg-transparent hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active Directives / Tasks */}
                      <div>
                        <h3 className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3 flex items-center gap-2 mt-8">
                          <Target className="w-4 h-4 text-purple-400" /> Tasks & Events
                        </h3>
                        
                        <div className="bg-[#030712] border border-white/5 rounded-xl p-5 mb-4 shadow-inner">
                          <form onSubmit={handleAddTask} className="flex gap-3">
                            <input 
                              type="text" 
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              placeholder="Assign a task or event..." 
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button 
                              type="submit"
                              disabled={!newTaskTitle}
                              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-black font-bold rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
                            >
                              Assign Task
                            </button>
                          </form>
                        </div>

                        <div className="space-y-2">
                          {selectedTeam.tasks.length === 0 ? (
                            <p className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-white/5 rounded-xl">No active tasks assigned to this team.</p>
                          ) : (
                            selectedTeam.tasks.map(task => (
                              <div key={task.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4 group hover:border-white/10 transition-colors">
                                <button onClick={() => toggleTaskStatus(selectedTeam.id, task.id)} className="transition-transform active:scale-95">
                                  {task.status === "completed" ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-600 group-hover:text-emerald-500/50" />
                                  )}
                                </button>
                                <span className={`text-sm font-medium ${task.status === "completed" ? "text-gray-500 line-through" : "text-gray-200"}`}>
                                  {task.title}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
                    <Network className="w-16 h-16 text-gray-600 mb-6" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No Team Selected</h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      Select a team from the list on the left to view members and tasks.
                    </p>
                  </div>
                )}
                
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
