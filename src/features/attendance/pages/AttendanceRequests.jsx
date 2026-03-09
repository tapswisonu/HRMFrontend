import React from "react";
import { Typography, Card, CardBody } from "@material-tailwind/react";

export function AttendanceRequests() {
    return (
        <div className="mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardBody className="p-4">
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                        Attendance Corrections & Requests
                    </Typography>
                    <Typography className="font-normal text-blue-gray-500">
                        View and approve employee attendance correction requests here.
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
}

export default AttendanceRequests;
