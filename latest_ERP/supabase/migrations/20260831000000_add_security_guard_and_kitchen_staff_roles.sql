-- Add security_guard and kitchen_staff to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'security_guard';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'kitchen_staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'inventory_manager';

-- Update is_staff function to include new roles
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id
    AND role IN ('super_admin','trust_admin','branch_admin','warden','teacher','accountant','security_guard','inventory_manager','kitchen_staff'));
$$;

-- Add permissions for security_guard
INSERT INTO public.role_permissions (role, module, action, scope) VALUES
('security_guard','security','view','branch'),
('security_guard','security','create','branch'),
('security_guard','security','edit','branch'),
('security_guard','visitors','view','branch'),
('security_guard','visitors','create','branch'),
('security_guard','visitors','edit','branch'),
('security_guard','gatepass','view','branch'),
('security_guard','gatepass','create','branch'),
('security_guard','gatepass','edit','branch'),
('security_guard','reports','view','branch'),
('security_guard','notifications','view','branch')
ON CONFLICT (role, module, action) DO NOTHING;

-- Add permissions for kitchen_staff
INSERT INTO public.role_permissions (role, module, action, scope) VALUES
('kitchen_staff','dashboard','view','branch'),
('kitchen_staff','mess','view','branch'),
('kitchen_staff','mess','create','branch'),
('kitchen_staff','mess','edit','branch'),
('kitchen_staff','inventory','view','branch'),
('kitchen_staff','inventory','create','branch'),
('kitchen_staff','inventory','edit','branch'),
('kitchen_staff','leave','view','branch'),
('kitchen_staff','issues','view','branch'),
('kitchen_staff','complaints','view','branch'),
('kitchen_staff','maintenance','view','branch'),
('kitchen_staff','visitors','view','branch'),
('kitchen_staff','gatepass','view','branch'),
('kitchen_staff','security','view','branch'),
('kitchen_staff','medical','view','branch'),
('kitchen_staff','assets','view','branch'),
('kitchen_staff','notifications','view','branch')
ON CONFLICT (role, module, action) DO NOTHING;

-- Add permissions for inventory_manager
INSERT INTO public.role_permissions (role, module, action, scope) VALUES
('inventory_manager','dashboard','view','branch'),
('inventory_manager','inventory','view','branch'),
('inventory_manager','inventory','create','branch'),
('inventory_manager','inventory','edit','branch'),
('inventory_manager','inventory','delete','branch'),
('inventory_manager','inventory','manage','branch'),
('inventory_manager','assets','view','branch'),
('inventory_manager','assets','create','branch'),
('inventory_manager','assets','edit','branch'),
('inventory_manager','notifications','view','branch')
ON CONFLICT (role, module, action) DO NOTHING;
