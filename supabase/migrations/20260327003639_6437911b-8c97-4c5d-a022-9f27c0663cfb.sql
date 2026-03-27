
CREATE POLICY "Learners can mark slots as booked"
  ON public.availability_slots FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (is_booked = true);
