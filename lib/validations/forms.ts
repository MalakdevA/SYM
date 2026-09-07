import { z } from 'zod';

// Test Ride Booking Form Schema
export const testRideBookingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTime: z.string().optional(),
  productId: z.string().min(1, 'Please select a product'),
  dealerId: z.string().optional(),
  notes: z.string().optional(),
});

export type TestRideBookingFormData = z.infer<typeof testRideBookingSchema>;

// Quote Request Form Schema
export const quoteRequestSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  productId: z.string().uuid('Please select a product'),
  message: z.string().optional(),
});

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Newsletter Subscription Schema
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// Job Application Schema
export const jobApplicationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  resume: z.any(), // File validation
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
