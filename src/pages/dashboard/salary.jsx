import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
    Chip,
    Tooltip,
    Progress,
    Button,
    Input,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, getDaysInMonth, isSameDay } from "date-fns";

export function Salary() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state) => state.auth);

    // For editing salary
    const [editingId, setEditingId] = useState(null);
    const [newSalary, setNewSalary] = useState("");

    // Attendance Modal
    const [openCalendar, setOpenCalendar] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Salary Calculation
    const [calculatedSalary, setCalculatedSalary] = useState(0);
    const [workingDays, setWorkingDays] = useState(30);
    const [presentDays, setPresentDays] = useState(0);

    const fetchEmployees = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            // Get all employees
            const { data } = await axios.get(
                "http://localhost:8000/api/admin/users/employee",
                config
            );
            setEmployees(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch employees");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [token]);

    const handleEditClick = (emp) => {
        setEditingId(emp._id);
        // If salary is undefined, default to 0 in input
        setNewSalary(emp.salary || 0);
    };

    const handleSaveSalary = async (id, salaryToSave = newSalary) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.put(`http://localhost:8000/api/admin/user/${id}`, { salary: salaryToSave }, config);

            toast.success("Salary updated successfully");
            setEditingId(null);
            setOpenCalendar(false); // Close modal if open
            fetchEmployees(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to update salary");
        }
    };

    const handleViewAttendance = async (emp) => {
        setSelectedEmp(emp);
        setOpenCalendar(true);
        // Reset month to now
        const now = new Date();
        setCurrentMonth(now);
        await fetchMonthlyAttendance(emp._id, now.getMonth(), now.getFullYear(), emp.salary);
    };

    const fetchMonthlyAttendance = async (empId, month, year, baseSalary) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { month, year } // month is 0-indexed for backend now
            };
            const { data } = await axios.get(`http://localhost:8000/api/admin/attendance/${empId}`, config);
            setAttendanceData(data); // Array of attendance records

            // Calculate Logic
            const presentCount = data.length; // Simple count of records
            setPresentDays(presentCount);

            // Simple Calc: (Base Salary / Total Days in Month) * Present Days
            // OR (Base Salary / 30) * Present Days as per standard
            // Let's use days in month for accuracy
            const daysInMonth = getDaysInMonth(new Date(year, month));
            setWorkingDays(daysInMonth);

            // Use the baseSalary passed to the function, or selectedEmp's salary if available
            const currentBaseSalary = baseSalary || selectedEmp?.salary || 0;
            // Avoid division by zero
            const calc = currentBaseSalary > 0 && daysInMonth > 0 ? (currentBaseSalary / daysInMonth) * presentCount : 0;
            setCalculatedSalary(calc.toFixed(2));

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch attendance data.");
        }
    };

    // When calendar month changes
    const onActiveStartDateChange = ({ activeStartDate }) => {
        setCurrentMonth(activeStartDate);
        if (selectedEmp) {
            fetchMonthlyAttendance(selectedEmp._id, activeStartDate.getMonth(), activeStartDate.getFullYear(), selectedEmp.salary);
        }
    };

    // Recalculate if salary depends on selectedEmp which might be set async
    // But logic above handles it.

    // Calendar tile class
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const isPresent = attendanceData.find(att => isSameDay(new Date(att.date), date));
            if (isPresent) {
                return 'bg-green-100 text-green-700 font-bold rounded-full';
            }
        }
        return null; // Return null for no custom class
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
                    <Typography variant="h6" color="white">
                        Employee Salary Table
                    </Typography>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                    <table className="w-full min-w-[640px] table-auto">
                        <thead>
                            <tr>
                                {["Employee", "Salary", "Action"].map((el) => (
                                    <th
                                        key={el}
                                        className="border-b border-blue-gray-50 py-3 px-5 text-left"
                                    >
                                        <Typography
                                            variant="small"
                                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                                        >
                                            {el}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(
                                (emp, key) => {
                                    const { _id, name, email, role, department, salary, workProfile } = emp;
                                    const className = `py-3 px-5 ${key === employees.length - 1
                                        ? ""
                                        : "border-b border-blue-gray-50"
                                        }`;

                                    return (
                                        <tr key={_id}>
                                            <td className={className}>
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="font-semibold"
                                                        >
                                                            {name}
                                                        </Typography>
                                                        <Typography className="text-xs font-normal text-blue-gray-500">
                                                            {email}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className={className}>
                                                {editingId === _id ? (
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            value={newSalary}
                                                            onChange={(e) => setNewSalary(e.target.value)}
                                                            label="Salary"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography className="text-xs font-semibold text-blue-gray-600">
                                                        ${salary || 0}
                                                    </Typography>
                                                )}

                                            </td>
                                            <td className={className}>
                                                <div className="flex gap-2">
                                                    {editingId === _id ? (
                                                        <>
                                                            <Button size="sm" color="green" onClick={() => handleSaveSalary(_id)}>
                                                                Save
                                                            </Button>
                                                            <Button size="sm" color="red" variant="text" onClick={() => setEditingId(null)}>
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography
                                                                as="a"
                                                                href="#"
                                                                className="text-xs font-semibold text-blue-gray-600 hover:text-blue-500"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleEditClick(emp);
                                                                }}
                                                            >
                                                                Edit
                                                            </Typography>
                                                            <Button size="sm" variant="outlined" className="py-1 px-2 text-[10px]" onClick={() => handleViewAttendance(emp)}>
                                                                Attendance
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            <Dialog open={openCalendar} handler={() => setOpenCalendar(!openCalendar)} size="md">
                <DialogHeader>Attendance Details: {selectedEmp?.name}</DialogHeader>
                <DialogBody divider className="flex flex-col items-center gap-4">
                    <Calendar
                        onChange={setCurrentMonth}
                        value={currentMonth}
                        onActiveStartDateChange={onActiveStartDateChange}
                        tileClassName={tileClassName}
                        className="w-full border-none shadow-sm rounded-lg"
                    />
                    <div className="w-full text-center">
                        <Typography variant="small" color="gray" className="mb-1">
                            Month: {format(currentMonth, 'MMMM yyyy')} | Working Days: {workingDays}
                        </Typography>
                        <div className="flex justify-center gap-4 mb-2">
                            <Chip color="green" value={`Present: ${presentDays}`} />
                            <Chip color="blue" value={`Salary: $${calculatedSalary}`} />
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenCalendar(false)} className="mr-1">
                        Close
                    </Button>
                    <Button variant="gradient" color="blue" onClick={() => handleSaveSalary(selectedEmp._id, calculatedSalary)}>
                        Apply Adjusted Salary
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default Salary;
