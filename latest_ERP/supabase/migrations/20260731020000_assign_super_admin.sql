-- Assign Super Admin role to praveengoudru25@gmail.com
-- This migration ensures the specified email has full Super Admin access

DO $$
DECLARE
  v_user_id uuid;
  v_role_exists boolean;
BEGIN
  -- Get the user ID for the specified email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'praveengoudru25@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email praveengoudru25@gmail.com not found in auth.users';
    RETURN;
  END IF;
  
  -- Check if user already has a role
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = v_user_id
  ) INTO v_role_exists;
  
  -- If no role exists, assign Super Admin
  IF NOT v_role_exists THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    RAISE NOTICE 'Assigned Super Admin role to praveengoudru25@gmail.com';
  ELSE
    -- Update existing role to Super Admin
    UPDATE public.user_roles 
    SET role = 'super_admin'
    WHERE user_id = v_user_id;
    RAISE NOTICE 'Updated role to Super Admin for praveengoudru25@gmail.com';
  END IF;
  
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, is_active)
  VALUES (v_user_id, 'praveengoudru25@gmail.com', TRUE)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_active = TRUE,
    updated_at = now();
    
END $$;
