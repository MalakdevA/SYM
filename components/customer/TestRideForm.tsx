'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { testRideBookingSchema, type TestRideBookingFormData } from '@/lib/validations/forms';
import { submitTestRideApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface TestRideFormProps {
  productId?: string;
  productName?: string;
  onSuccess?: () => void;
}

export default function TestRideForm({ productId, productName, onSuccess }: TestRideFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TestRideBookingFormData>({
    resolver: zodResolver(testRideBookingSchema),
    defaultValues: {
      productId: productId || '',
    },
  });

  const onSubmit = async (data: TestRideBookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitTestRideApi({
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        email: data.email,
        scooter_model: productName || data.productId,
        preferred_date: data.preferredDate,
      });

      if (!res.success) {
        throw new Error(res.error || res.message || 'Failed to submit booking');
      }

      setSubmitSuccess(true);
      reset();

      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Test ride booking error:', error);
      setSubmitError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {productName && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-2xl">
          <p className="text-sm text-gray-600 mb-1">Test ride for:</p>
          <p className="text-lg sm:text-xl font-bold text-black">{productName}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-6 p-4 sm:p-6 bg-green-50 border-2 border-green-200 rounded-2xl" role="alert">
          <h3 className="text-base sm:text-lg font-bold text-green-800 mb-2">Booking Confirmed!</h3>
          <p className="text-sm sm:text-base text-green-700">
            Thank you for your interest. We&apos;ll contact you shortly to confirm your test ride appointment.
          </p>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 sm:p-6 bg-red-50 border-2 border-red-200 rounded-2xl" role="alert">
          <p className="text-sm sm:text-base text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="text-sm sm:text-base">
              First Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={`mt-2 ${errors.firstName ? 'border-red-500' : ''}`}
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="text-sm sm:text-base">
              Last Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={`mt-2 ${errors.lastName ? 'border-red-500' : ''}`}
              aria-invalid={errors.lastName ? 'true' : 'false'}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm sm:text-base">
              Email <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone" className="text-sm sm:text-base">
              Phone <span className="text-red-600">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`mt-2 ${errors.phone ? 'border-red-500' : ''}`}
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Preferred Date */}
          <div>
            <Label htmlFor="preferredDate" className="text-sm sm:text-base">
              Preferred Date <span className="text-red-600">*</span>
            </Label>
            <Input
              id="preferredDate"
              type="date"
              {...register('preferredDate')}
              min={new Date().toISOString().split('T')[0]}
              className={`mt-2 ${errors.preferredDate ? 'border-red-500' : ''}`}
              aria-invalid={errors.preferredDate ? 'true' : 'false'}
              aria-describedby={errors.preferredDate ? 'preferredDate-error' : undefined}
            />
            {errors.preferredDate && (
              <p id="preferredDate-error" className="mt-2 text-sm text-red-600" role="alert">
                {errors.preferredDate.message}
              </p>
            )}
          </div>

          {/* Preferred Time */}
          <div>
            <Label htmlFor="preferredTime" className="text-sm sm:text-base">
              Preferred Time
            </Label>
            <Input
              id="preferredTime"
              type="time"
              {...register('preferredTime')}
              className="mt-2"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm sm:text-base">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            {...register('notes')}
            rows={4}
            className="mt-2"
            placeholder="Any special requirements or questions..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 sm:h-14 text-base sm:text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              'Book Test Ride'
            )}
          </Button>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 text-center">
          By submitting this form, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
