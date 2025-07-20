import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://swsnpijbgvzdbkzrqwro.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3c25waWpiZ3Z6ZGJrenJxd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzg3NTgsImV4cCI6MjA2NjM1NDc1OH0.m5XiXG764QWif8i4r-bHPJ34i0ZQFeCTGPDAcfgvmu0' // This allows anonymous access


// mohamedelkashif1983@gmail.com

export const supabase = createClient(supabaseUrl, supabaseKey)