"use client"

import React, { useState, useEffect } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Select } from "@/ui/components/Select";
import { FeatherMap } from "@subframe/core";
import { FeatherCar } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherCalendar } from "@subframe/core";
import { Calendar } from "@/ui/components/Calendar";
import { Tabs } from "@/ui/components/Tabs";
import { Checkbox } from "@/ui/components/Checkbox";
import { Button } from "@/ui/components/Button";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherCheckCircle2 } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherPlus } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { Accordion } from "@/ui/components/Accordion";
import { DateButton } from "@/ui/components/DateButton";
import * as SubframeCore from "@subframe/core";
import { format } from "date-fns"; 

interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: Date;
  timeSlot: string;
  car: string;
  location: string;
  status: "pending" | "completed";
}

export default function TestDriveBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00 AM");
  const [car, setCar] = useState("");
  const [location, setLocation] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Filter bookings when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const filtered = bookings.filter(booking => 
        booking.date.toDateString() === selectedDate.toDateString()
      );
      setFilteredBookings(filtered);
    }
  }, [selectedDate, bookings]);

  const fetchBookings = async (date?: Date) => {
    try {
      const dateParam = date ? format(date, 'yyyy-MM-dd') : '';
      const response = await fetch(`${API_URL}/api/bookings?date=${dateParam}`);
      const data = await response.json();
      
      // Transform the data to match our Booking type
      const formattedBookings: Booking[] = data.map((booking: any) => ({
        id: booking.id.toString(),
        customerName: booking.customer_name,
        phoneNumber: booking.phone_number,
        date: new Date(booking.booking_date),
        timeSlot: booking.time_slot,
        car: booking.car,
        location: booking.location,
        status: booking.status as "pending" | "completed"
      }));
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    fetchBookings(selectedDate);
  }, [selectedDate]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!customerName || !phoneNumber || !selectedDate || !car) {
      alert("Please fill in all required fields");
      return;
    }
  
    const bookingData = {
      customerName,
      phoneNumber,
      date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
      timeSlot,
      car,
      location
    };
  
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      // Refresh bookings
      fetchBookings(selectedDate);
      
      // Reset form
      setCustomerName("");
      setPhoneNumber("");
      setCar("");
      setLocation("");
      
      alert("Booking submitted successfully!");
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Failed to submit booking. Please try again.");
    }
  };
  
  // Update the checkbox onChange handler
  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: checked ? 'completed' : 'pending' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }
      
      // Refresh bookings
      fetchBookings(selectedDate);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };
  
  const CustomDateButton = ({ selected, onSelect }: { selected?: Date, onSelect: (date: Date | undefined) => void }) => {
    const formattedDate = selected ? selected.toLocaleDateString() : "Select a date";
    
    return (
      <SubframeCore.Popover.Root>
        <SubframeCore.Popover.Trigger asChild={true}>
          <Button variant="neutral-primary">
            {formattedDate}
          </Button>
        </SubframeCore.Popover.Trigger>
        <SubframeCore.Popover.Portal>
          <SubframeCore.Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            asChild={true}
          >
            <div className="flex flex-col items-start gap-1 rounded-md border border-solid border-neutral-border bg-default-background px-3 py-3 shadow-lg">
              <Calendar 
                mode="single"
                selected={selected}
                onSelect={onSelect}
              />
            </div>
          </SubframeCore.Popover.Content>
        </SubframeCore.Popover.Portal>
      </SubframeCore.Popover.Root>
    );
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start gap-6 bg-default-background py-12 overflow-auto">
        <div className="flex w-full items-start gap-6">
          <span className="grow shrink-0 basis-0 text-heading-1 font-heading-1 text-default-font">
            Hello Sam!
          </span>
        </div>
        <div className="flex w-full items-center gap-4">
          <span className="text-body-bold font-body-bold text-default-font">
            Filter by
          </span>
          <div className="flex grow shrink-0 basis-0 items-center gap-2">
            <Select
              label=""
              placeholder="All branches"
              helpText=""
              icon={<FeatherMap />}
              value={undefined}
              onValueChange={(value: string) => {}}
            >
              <Select.Item value="Sheikh Zayed Road">Sheikh Zayed Road</Select.Item>
              <Select.Item value="Airport Road">Airport Road</Select.Item>
              <Select.Item value="Dubai Festival City">Dubai Festival City</Select.Item>
            </Select>
            <Select
              label=""
              placeholder="Cars"
              helpText=""
              icon={<FeatherCar />}
              value={undefined}
              onValueChange={(value: string) => {}}
            >
              <Select.Item value="Engineering">Han</Select.Item>
              <Select.Item value="Design">Sealion</Select.Item>
              <Select.Item value="Product">Seal</Select.Item>
              <Select.Item value="Marketing">Atto 3</Select.Item>
              <Select.Item value="Marketing">Song Plus</Select.Item>
              <Select.Item value="Marketing">Qin Plus</Select.Item>
            </Select>
            <Select
              label=""
              placeholder="All sales executives"
              helpText=""
              icon={<FeatherUser />}
              value={undefined}
              onValueChange={(value: string) => {}}
            >
              <Select.Item value="Sales executive 1">Sales executive 1</Select.Item>
              <Select.Item value="Sales executive 2">Sales executive 2</Select.Item>
            </Select>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-start gap-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
            <div className="flex w-full items-center gap-4">
              <IconWithBackground
                variant="neutral"
                size="medium"
                icon={<FeatherCalendar />}
                square={true}
              />
              <span className="text-heading-3 font-heading-3 text-default-font">
                Test Drive Booking calendar
              </span>
            </div>
            <div className="flex w-full items-center gap-4 rounded-md bg-neutral-50 px-4 py-4">
              <Calendar
                className="h-auto grow shrink-0 basis-0 self-stretch"
                mode={"single"}
                selected={selectedDate}
                onSelect={(date: Date | undefined) => setSelectedDate(date)}
              />
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
          <div className="flex w-full items-center gap-4">
              <IconWithBackground
                variant="neutral"
                size="medium"
                icon={<FeatherCalendar />}
                square={true}
              />
              <span className="text-heading-3 font-heading-3 text-default-font">
                Bookings for {selectedDate ? format(selectedDate, "EEE, MMMM d") : "today"}
              </span>
              <span className="text-caption-bold font-caption-bold text-subtext-color">
                {filteredBookings.length} bookings
              </span>
            </div>
            <div className="flex w-full flex-col items-start">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="flex w-full items-start gap-4 border-b border-solid border-neutral-border px-4 py-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-body-bold font-body-bold text-default-font">
                        {booking.timeSlot}
                      </span>
                      <span className="text-caption font-caption text-subtext-color">
                        {/* Calculate end time based on start time */}
                        {booking.timeSlot.replace("00 AM", "15 AM").replace("30 AM", "45 AM")}
                      </span>
                    </div>
                    <div className="flex w-1 flex-none flex-col items-center gap-2 self-stretch overflow-hidden rounded-md bg-brand-600" />
                    <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                      <span className="w-full text-body font-body text-default-font">
                        {booking.customerName}, {booking.phoneNumber}
                      </span>
                      <span className="w-full text-caption font-caption text-subtext-color">
                        {booking.car}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-body font-body text-subtext-color">
                        Status
                      </span>
                      <Checkbox
                        label=""
                        disabled={false}
                        checked={booking.status === "completed"}
                        onCheckedChange={(checked: boolean) => handleStatusChange(booking.id, checked)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex w-full items-center justify-center p-4 text-subtext-color">
                  No bookings for this date
                </div>
              )}
            </div>
            <div className="flex w-full items-center justify-center gap-2">
              <Button
                variant="neutral-secondary"
                icon={<FeatherChevronLeft />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Prev
              </Button>
              <Button
                variant="neutral-secondary"
                iconRight={<FeatherChevronRight />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-start gap-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
            <div className="flex w-full items-center gap-2">
              <div className="flex grow shrink-0 basis-0 items-center gap-4">
                <IconWithBackground
                  variant="neutral"
                  size="medium"
                  icon={<FeatherCheckCircle2 />}
                  square={true}
                />
                <span className="text-heading-3 font-heading-3 text-default-font">
                  List of available cars today
                </span>
              </div>
              <IconButton
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex w-full flex-col items-start gap-2">
            <div className="flex w-full items-center justify-between gap-4 rounded-md bg-neutral-50 px-4 py-4">
            <div className="flex flex-col items-start gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                BYD Haan
              </span>
              <span className="text-caption font-caption text-subtext-color">
                White
              </span>
            </div>
            <Select
              label=""
              placeholder="09:00 AM"
              helpText=""
              value={undefined}
              onValueChange={(value: string) => {}}
            >
              <Select.Item value="09:00 AM">09:00 AM</Select.Item>
              <Select.Item value="09:30 AM">09:30 AM</Select.Item>
              <Select.Item value="10:00 AM">10:00 AM</Select.Item>
            </Select>
          </div>
            </div>
            <div className="flex w-full items-center justify-center gap-2">
              <Button
                variant="neutral-secondary"
                icon={<FeatherChevronLeft />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Prev
              </Button>
              <Button
                variant="neutral-secondary"
                iconRight={<FeatherChevronRight />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-sm">
            <div className="flex w-full items-center gap-4">
              <IconWithBackground
                variant="neutral"
                size="medium"
                icon={<FeatherPlus />}
                square={true}
              />
              <span className="text-heading-3 font-heading-3 text-default-font">
                Submit a request for a new booking
              </span>
            </div>
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
                <Accordion
                  trigger={
                    <div className="flex w-full items-center gap-2 px-4 py-3">
                      <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                        Full name
                      </span>
                      <Accordion.Chevron />
                    </div>
                  }
                  defaultOpen={true}
                >
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                    <TextField
                      className="h-auto w-full flex-none"
                      variant="filled"
                      label=""
                      helpText=""
                    >
                      <TextField.Input
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                          setCustomerName(event.target.value)
                        }
                      />
                    </TextField>
                  </div>
                </Accordion>
              </div>
              <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
                <Accordion
                  trigger={
                    <div className="flex w-full items-center gap-2 px-4 py-3">
                      <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                        Phone number
                      </span>
                      <Accordion.Chevron />
                    </div>
                  }
                  defaultOpen={true}
                >
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                    <TextField
                      className="h-auto w-full flex-none"
                      variant="filled"
                      label=""
                      helpText=""
                    >
                      <TextField.Input
                        placeholder="Enter customer's phone number"
                        value={phoneNumber}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                          setPhoneNumber(event.target.value)
                        }
                      />
                    </TextField>
                  </div>
                </Accordion>
              </div>
              <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
                <Accordion
                  trigger={
                    <div className="flex w-full items-center gap-2 px-4 py-3">
                      <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                        Date
                      </span>
                      <Accordion.Chevron />
                    </div>
                  }
                  defaultOpen={true}
                >
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                    <CustomDateButton 
                      selected={selectedDate} 
                      onSelect={setSelectedDate} 
                    />
                  </div>
                </Accordion>
              </div>
              <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
                <Accordion
                  trigger={
                    <div className="flex w-full items-center gap-2 px-4 py-3">
                      <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                        Time slot
                      </span>
                      <Accordion.Chevron />
                    </div>
                  }
                  defaultOpen={true}
                >
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                    <div className="flex items-center justify-end">
                    <Select
                      label=""
                      placeholder="09:00 AM"
                      helpText=""
                      value={timeSlot}
                      onValueChange={(value: string) => setTimeSlot(value)}
                    >
                      <Select.Item value="09:00 AM">09:00 AM</Select.Item>
                      <Select.Item value="09:30 AM">09:30 AM</Select.Item>
                      <Select.Item value="10:00 AM">10:00 AM</Select.Item>
                    </Select>
                    </div>
                  </div>
                </Accordion>
              </div>
              <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
                <Accordion
                  trigger={
                    <div className="flex w-full items-center gap-2 px-4 py-3">
                      <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                        Car
                      </span>
                      <Accordion.Chevron />
                    </div>
                  }
                  defaultOpen={true}
                >
                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                    <TextField
                      className="h-auto w-full flex-none"
                      variant="filled"
                      label=""
                      helpText=""
                    >
                      <TextField.Input
                        placeholder="Enter car model and trim"
                        value={car}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                          setCar(event.target.value)
                        }
                      />
                    </TextField>
                  </div>
                </Accordion>
              </div>
            </div>
            <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
              <Accordion
                trigger={
                  <div className="flex w-full items-center gap-2 px-4 py-3">
                    <span className="grow shrink-0 basis-0 text-caption-bold font-caption-bold text-default-font">
                      Location
                    </span>
                    <Accordion.Chevron />
                  </div>
                }
                defaultOpen={true}
              >
                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
                <Select
                  className="h-auto w-full flex-none"
                  variant="filled"
                  label=""
                  placeholder="Select location"
                  helpText=""
                  value={location}
                  onValueChange={(value: string) => setLocation(value)}
                >
                  <Select.Item value="Sheikh Zayed Road">Sheikh Zayed Road</Select.Item>
                  <Select.Item value="Airport Road">Airport Road</Select.Item>
                  <Select.Item value="Dubai Festival City">Dubai Festival City</Select.Item>
                </Select>
                </div>
              </Accordion>
            </div>
            <div className="flex w-full items-center justify-between">
            <Button
              disabled={false}
              variant="brand-primary"
              size="medium"
              onClick={handleSubmit}
            >
              Submit a request
            </Button>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>  
  );
}