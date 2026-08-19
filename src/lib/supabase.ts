import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://smfpnrzsidewgaudsibu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZnBucnpzaWRld2dhdWRzaWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMzEwNzcsImV4cCI6MjA5NTcwNzA3N30.Js9eCA8FU2hGrSdhIpuDqbsHSDo2n37L9eCdRIABiuk'
)
