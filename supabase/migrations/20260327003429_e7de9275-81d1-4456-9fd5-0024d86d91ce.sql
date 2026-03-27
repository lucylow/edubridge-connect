
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, start_time)
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability slots"
  ON public.availability_slots FOR SELECT
  TO public USING (true);

CREATE POLICY "Tutors can insert their own slots"
  ON public.availability_slots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own slots"
  ON public.availability_slots FOR UPDATE
  TO authenticated USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete their own unbooked slots"
  ON public.availability_slots FOR DELETE
  TO authenticated USING (auth.uid() = tutor_id AND is_booked = false);
