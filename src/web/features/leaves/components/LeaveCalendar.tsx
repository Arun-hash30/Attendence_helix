import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Button } from "@voilajsx/uikit/button";
import { Badge } from "@voilajsx/uikit/badge";
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react";
import { leaveApi } from "../services/leave.api";
import { LeaveCalendarEvent } from "../types/leave";
import { useAuth } from "../../auth";

interface Props {
  year: number;
  month: number;
  userId?: number;
}

export const LeaveCalendar: React.FC<Props> = ({ year, month, userId }) => {
  const { token } = useAuth();
  const [events, setEvents] = useState<LeaveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));

  useEffect(() => {
    loadCalendar();
  }, [year, month, userId, token]);

  const loadCalendar = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await leaveApi.getLeaveCalendar(token, year, month, userId);
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error("Failed to load calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getEventsForDay = (day: number) => {
    const date = new Date(year, month - 1, day);
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Removed unused function: getTypeBadge

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Calendar - {monthNames[month - 1]} {year}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Casual Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm">Annual Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Rejected</span>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center font-medium bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] p-2 border bg-gray-50"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = 
                day === new Date().getDate() && 
                month === new Date().getMonth() + 1 && 
                year === new Date().getFullYear();

              return (
                <div 
                  key={day} 
                  className={`min-h-[120px] p-2 border ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className="p-1 rounded text-xs truncate"
                        style={{ backgroundColor: event.color, color: 'white' }}
                        title={`${event.userName} - ${event.type} (${event.status})`}
                      >
                        <div className="font-medium truncate">{event.userName}</div>
                        <div className="truncate">{event.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leave Events This Month
            </h3>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium">{event.userName}</div>
                    <div className="text-sm text-gray-500">
                      {event.type} • {new Date(event.start).toLocaleDateString()} - {new Date(event.end).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className={getStatusBadge(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaves Scheduled</h3>
            <p className="text-gray-500">No leave events found for {monthNames[month - 1]} {year}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};