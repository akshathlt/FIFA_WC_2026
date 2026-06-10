import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://esgitlslczwqykiamznt.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZ2l0bHNsY3p3cXlraWFtem50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTI0NDYsImV4cCI6MjA5NjY2ODQ0Nn0.zrrkELZ0AAWY4oELa6clY9FIHJ05omWeKxNJni2O2Cw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
