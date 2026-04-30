"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { getIncidents, createIncident, updateIncident, deleteIncident } from "@/lib/api";
import { Incident, Severity, Status } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot, Activity, CheckCircle2, Wand2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editedDesc, setEditedDesc] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const totalPages = Math.ceil(totalCount / 8) || 1;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service: "",
    severity: "medium" as Severity,
  });

  useEffect(() => {
    fetchIncidents(page);
  }, [page]);

  useEffect(() => {
    socket.connect();

    socket.on("incidentCreated", (incident: Incident) => {
      setTotalCount((prevCount) => prevCount + 1);
      setIncidents((prev) => {
        const newItems = [incident, ...prev];
        return newItems.slice(0, 8);
      });
      toast.success("New incident reported!");
    });

    socket.on("incidentUpdated", (updated: Incident) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === updated.id ? updated : inc))
      );
      toast.info("An incident status was updated.");
    });

    socket.on("incidentDeleted", ({ id }) => {
      setTotalCount((prevCount) => Math.max(0, prevCount - 1));
      setIncidents((prev) => prev.filter((inc) => inc.id !== id));
      toast.error("Incident record deleted.");
    });

    return () => {
      socket.off("incidentCreated");
      socket.off("incidentUpdated");
      socket.off("incidentDeleted");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Eğer mevcut sayfa, toplam sayfa sayısından büyükse ve en az 1 sayfa varsa
    // Kullanıcıyı mevcut olan en son sayfaya otomatik olarak geri gönder
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  useEffect(() => {
    const expectedItems = Math.min(8, totalCount - (page - 1) * 8);
    
    if (incidents.length < expectedItems && expectedItems > 0) {
      getIncidents(page, 8)
        .then((response) => {
          setIncidents(response.data.slice(0, 8));
          setTotalCount(response.meta.total);
        })
        .catch((error) => console.error("Silent refill error:", error));
    }
  }, [incidents.length, totalCount, page]);

  const fetchIncidents = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await getIncidents(currentPage, 8);
      setIncidents(response.data.slice(0, 8));
      setTotalCount(response.meta.total);
    } catch (error) {
      toast.error("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoClassify = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Please enter Title and Description for AI to analyze.");
      return;
    }
    
    try {
      setIsAiLoading(true);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "classify",
          title: formData.title,
          description: formData.description,
        }),
      });
      
      if (!res.ok) throw new Error("API response error");
      const data = await res.json();
      
      setFormData((prev) => ({
        ...prev,
        service: data.service || prev.service,
        severity: data.severity || prev.severity,
      }));
      toast.success("AI classified the incident!");
    } catch (error) {
      toast.error("AI classification failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!editedDesc) return;
    try {
      setIsSummarizing(true);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "summarize",
          description: editedDesc,
        }),
      });
      
      if (!res.ok) throw new Error("API response error");
      const data = await res.json();
      
      setEditedDesc(data.summary);
      toast.success("AI summarized the text. Click Save Changes to apply.");
    } catch (error) {
      toast.error("AI summarization failed.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIncident(formData);
      setFormData({ title: "", description: "", service: "", severity: "medium" });
    } catch (error) {
      toast.error("Failed to create incident. Check your inputs.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updateIncident(id, { status: newStatus });
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleSeverityChange = async (id: string, newSeverity: Severity) => {
    try {
      await updateIncident(id, { severity: newSeverity });
    } catch (error) {
      toast.error("Failed to update severity.");
    }
  };

  const handleDescriptionUpdate = async (id: string) => {
    if (!selectedIncident) return;
    try {
      await updateIncident(id, { description: editedDesc });
      setSelectedIncident({ ...selectedIncident, description: editedDesc });
      toast.success("Description updated successfully.");
    } catch (error) {
      toast.error("Failed to update description.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncident(id);
    } catch (error) {
      toast.error("Failed to delete incident.");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-600 hover:bg-red-700";
      case "high": return "bg-orange-500 hover:bg-orange-600";
      case "medium": return "bg-yellow-500 hover:bg-yellow-600";
      case "low": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <CircleDot className="w-4 h-4 text-blue-500" />;
      case "investigating": return <Activity className="w-4 h-4 text-amber-500" />;
      case "resolved": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-semibold text-lg text-slate-600">Loading...</div>;
  }

  return (
    <div className="container max-w-screen-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Real-Time Incident Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Card */}
        <Card className="md:col-span-1 h-fit shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Report New Incident</CardTitle>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={handleAutoClassify}
              disabled={isAiLoading}
              className="h-7 px-2 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
            >
              {isAiLoading ? (
                <Sparkles className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3 mr-1" />
              )}
              AI Auto-Fill
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., API Timeout" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Service Name</label>
                <Input required value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} placeholder="e.g., Payment Gateway" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={formData.severity} onValueChange={(val) => val && setFormData({...formData, severity: val as Severity})}>
                  <SelectTrigger className="lowercase">
                    <SelectValue placeholder="select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="lowercase data-[state=checked]:bg-slate-100 data-[state=checked]:font-medium">low</SelectItem>
                    <SelectItem value="medium" className="lowercase data-[state=checked]:bg-slate-100 data-[state=checked]:font-medium">medium</SelectItem>
                    <SelectItem value="high" className="lowercase data-[state=checked]:bg-slate-100 data-[state=checked]:font-medium">high</SelectItem>
                    <SelectItem value="critical" className="lowercase data-[state=checked]:bg-slate-100 data-[state=checked]:font-medium">critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Enter details here..." />
              </div>
              <Button type="submit" className="w-full transition-transform active:scale-[0.98]">Create</Button>
            </form>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 && page === 1 ? (
              <div className="text-center py-10 text-slate-500">No incidents found.</div>
            ) : incidents.length === 0 && page > 1 ? (
              <div className="text-center py-10 text-slate-500">Redirecting to previous page...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Incident</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {incidents.map((incident) => (
                      <motion.tr
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{incident.title}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{incident.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>{incident.service}</TableCell>
                        <TableCell>
                          <Select 
                            value={incident.severity} 
                            onValueChange={(val) => val && handleSeverityChange(incident.id, val as Severity)}
                          >
                            <SelectTrigger className={`h-8 w-[100px] text-white border-none lowercase focus:ring-0 [&>svg]:text-white transition-colors duration-500 ${getSeverityColor(incident.severity)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low" className="lowercase font-medium text-blue-600">low</SelectItem>
                              <SelectItem value="medium" className="lowercase font-medium text-amber-600">medium</SelectItem>
                              <SelectItem value="high" className="lowercase font-medium text-orange-600">high</SelectItem>
                              <SelectItem value="critical" className="lowercase font-medium text-red-600">critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={incident.status} 
                            onValueChange={(val) => val && handleStatusChange(incident.id, val as Status)}
                          >
                            <SelectTrigger className="h-8 w-[150px] lowercase">
                              <motion.div
                                key={incident.status}
                                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                className="flex items-center gap-2"
                              >
                                {getStatusIcon(incident.status)}
                                <SelectValue />
                              </motion.div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open" className="lowercase">
                                <div className="flex items-center gap-2">
                                  <CircleDot className="w-4 h-4 text-blue-500" />
                                  <span>open</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="investigating" className="lowercase">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-amber-500" />
                                  <span>investigating</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="resolved" className="lowercase">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span>resolved</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {format(new Date(incident.createdAt), "dd MMM HH:mm")}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="transition-all active:scale-95 hover:bg-slate-100"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setEditedDesc(incident.description);
                            }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="transition-transform active:scale-95"
                            onClick={() => handleDelete(incident.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {incidents.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Incident Details</span>
                <Badge className={getSeverityColor(selectedIncident.severity)}>
                  {selectedIncident.severity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Title</h4>
                <p className="text-lg font-medium">{selectedIncident.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Service</h4>
                <p>{selectedIncident.service}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase">Status</h4>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedIncident.status)}
                  <span className="capitalize font-medium text-slate-900">{selectedIncident.status}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase">Description</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSummarize} 
                      disabled={isSummarizing || editedDesc.length < 20}
                      className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all"
                    >
                      {isSummarizing ? "Thinking..." : <><Wand2 className="w-3 h-3 mr-1"/> AI Summarize</>}
                    </Button>
                  </div>
                  {editedDesc !== selectedIncident.description && (
                    <Button size="sm" onClick={() => handleDescriptionUpdate(selectedIncident.id)}>
                      Save Changes
                    </Button>
                  )}
                </div>
                <Textarea 
                  value={editedDesc} 
                  onChange={(e) => setEditedDesc(e.target.value)}
                  className="min-h-[100px] text-slate-700 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Reported At</h4>
                  <p className="text-sm font-medium text-slate-700">
                    {format(new Date(selectedIncident.createdAt), "dd MMM HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Last Update</h4>
                  <p className="text-sm font-medium text-slate-700">
                    {format(new Date(selectedIncident.updatedAt), "dd MMM HH:mm:ss")}
                  </p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setSelectedIncident(null)}>Close</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}