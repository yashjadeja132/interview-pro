import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/Api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Plus,
  Building2,
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  AlertTriangle,
} from "lucide-react";

export default function PositionManagement() {
  const [positions, setPositions] = useState([]);
  [];
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newExperience, setNewExperience] = useState("");
  const [noofvacancy, setNoofvacancy] = useState("");
  const [newShift, setNewShift] = useState("");
  const [editing, setEditing] = useState({ _id: null, name: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  // Filter positions based on search term
  const filteredPositions = positions.filter((position) =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Fetch positions
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/position");
      console.log(res);

      setPositions(res.data.data);
    } catch (err) {
      console.error("Error fetching positions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // POST request to add new position
  const addPosition = async () => {
    if (
      !newPosition.trim() ||
      !newSalary.trim() ||
      !newJobType.trim() ||
      !newExperience.trim() ||
      !noofvacancy.trim() ||
      !newShift.trim()
    )
      return;
    try {
      const res = await axiosInstance.post("/position", {
        name: newPosition,
        salary: Number(newSalary),
        jobType: newJobType,
        experience: newExperience,
        vacancies: Number(noofvacancy),
        shift: newShift,
      });
      if (res.status === 201) {
        toast.success("Position added successfully");
        fetchPositions();
        // Reset form
        setNewPosition("");
        setNewSalary("");
        setNewExperience("");
        setNoofvacancy("");
        setNewShift("");
        setNewJobType("");
      } else {
        toast.error("Something went wrong, please try again");
      }
      // setPositions([...positions, res.data.data]);
    } catch (err) {
      console.error("Error adding position", err);
      toast.error("Failed to add position");
    }
  };

  // PUT request to update position
  const updatePosition = async () => {
    if (!editing._id) return;
    try {
      await axiosInstance.put(`/position/${editing._id}`, {
        name: editing.name,
        salary: Number(editing.salary),
        jobType: editing.jobType,
        experience: editing.experience,
        vacancies: Number(editing.vacancies),
        shift: editing.shift,
      });
      setPositions(
        positions.map((pos) =>
          pos._id === editing._id ? { ...pos, name: editing.name } : pos,
        ),
      );
      setEditing({ _id: null, name: "" });
    } catch (err) {
      console.error("Error updating position", err);
    }
  };

  // DELETE request to delete position
  const deletePosition = async (id) => {
    try {
      const res = await axiosInstance.delete(`/position/${id}`);
      if (res.status === 200) {
        toast.success("Position deleted successfully");
      }
      setPositions(positions.filter((pos) => pos._id !== id));
      setDeleteConfirm({ open: false, id: null });
    } catch (err) {
      console.error("Error deleting position", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <Toaster richColors position="top-right" closeButton />

      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Job Post Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage job positions and roles in your organization
              </p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
  <Plus className="w-4 h-4 mr-2" />
  Add Position
</Button>

            </DialogTrigger>
            <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold dark:text-white">
                  Add New Position
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Position Name
                  </label>
                  <Input
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Salary
                  </label>
                  <Input
                    placeholder="e.g., 50000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Experience
                  </label>
                  <Input
                    placeholder="e.g., 1 year"
                    value={newExperience}
                    onChange={(e) => setNewExperience(e.target.value)}
                    className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    No of Vacancy
                  </label>
                  <Input
                    placeholder="e.g., 1"
                    value={noofvacancy}
                    onChange={(e) => setNoofvacancy(e.target.value)}
                    className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Shift
                  </label>
                  <div className="flex gap-4 h-11 items-center">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="dayShift"
                        name="shift"
                        value="Day Shift"
                        checked={newShift === "Day Shift"}
                        onChange={(e) => setNewShift(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:border-gray-600"
                      />
                      <label
                        htmlFor="dayShift"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Day Shift
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="nightShift"
                        name="shift"
                        value="Night Shift"
                        checked={newShift === "Night Shift"}
                        onChange={(e) => setNewShift(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="nightShift"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Night Shift
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Job type
                  </label>
                  <Select
                    value={newJobType}
                    onValueChange={(value) => setNewJobType(value)}
                  >
                    <SelectTrigger className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem
                        value="Full-time"
                        className="dark:text-white dark:focus:bg-slate-700"
                      >
                        Full-time
                      </SelectItem>
                      <SelectItem
                        value="Part-time"
                        className="dark:text-white dark:focus:bg-slate-700"
                      >
                        Part-time
                      </SelectItem>
                      <SelectItem
                        value="Freelancer"
                        className="dark:text-white dark:focus:bg-slate-700"
                      >
                        Freelancer
                      </SelectItem>
                      <SelectItem
                        value="Contract"
                        className="dark:text-white dark:focus:bg-slate-700"
                      >
                        Contract
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setNewPosition("")}
                    className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addPosition}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Add Position
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Positions</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{positions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

          {/* <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Positions</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300">{positions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card> */}

          {/* <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">This Month</p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">+{positions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-sm mb-6 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <Button
                  variant="outline"
                  className="h-10 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredPositions.length} of {positions.length}{" "}
                positions
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions Table */}
        <Card className="border-0 shadow-sm dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold dark:text-white">
              All Positions
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Manage and organize job positions in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Loading positions...
                  </span>
                </div>
              </div>
            ) : filteredPositions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">
                  No positions found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
                  {searchTerm
                    ? "No positions match your search criteria."
                    : "Get started by adding your first position."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Position Name
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Salary
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Experience
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Vacancies
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Shift
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Job Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Created
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPositions.map((pos, index) => (
                      <TableRow
                        key={pos._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800"
                      >
                        <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {pos.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{pos.salary || 0}</span>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <span className="font-medium">
                            {pos.experience || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <span className="font-medium">
                            {pos.vacancies || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <span className="font-medium">{pos.shift || 0}</span>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          <span className="font-medium">
                            {pos.jobType || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400">
                          {pos.createdAt
                            ? new Date(pos.createdAt).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit Dialog */}
                            <Dialog
                              open={editing._id === pos._id}
                              onOpenChange={(open) =>
                                !open && setEditing({ _id: null, name: "" })
                              }
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setEditing({ _id: pos._id, name: pos.name })
                                  }
                                  className="h-8 w-8 p-0 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md dark:bg-slate-900 dark:border-slate-800">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-semibold dark:text-white">
                                    Edit Position
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                                      Position Name
                                    </label>
                                    <Input
                                      value={editing.name}
                                      onChange={(e) =>
                                        setEditing({
                                          ...editing,
                                          name: e.target.value,
                                        })
                                      }
                                      className="h-11 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-3">
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setEditing({ _id: null, name: "" })
                                      }
                                      className="dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={updatePosition}
                                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Button */}
                            <Button
                              Add
                              position
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDeleteConfirm({ open: true, id: pos._id })
                              }
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:bg-slate-800 dark:border-red-900/50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ open: false, id: null })
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-semibold">
                Confirm Delete
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-slate-600">
              Are you sure you want to delete this position? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm({ open: false, id: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletePosition(deleteConfirm.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Position
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
