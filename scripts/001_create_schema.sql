-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create binders table
CREATE TABLE IF NOT EXISTS binders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binder_id UUID NOT NULL REFERENCES binders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE binders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for binders
CREATE POLICY "Users can view their own binders" ON binders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create binders" ON binders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own binders" ON binders
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own binders" ON binders
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for notebooks
CREATE POLICY "Users can view notebooks in their binders" ON notebooks
  FOR SELECT USING (
    binder_id IN (SELECT id FROM binders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create notebooks in their binders" ON notebooks
  FOR INSERT WITH CHECK (
    binder_id IN (SELECT id FROM binders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update notebooks in their binders" ON notebooks
  FOR UPDATE USING (
    binder_id IN (SELECT id FROM binders WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete notebooks in their binders" ON notebooks
  FOR DELETE USING (
    binder_id IN (SELECT id FROM binders WHERE user_id = auth.uid())
  );

-- Create RLS policies for notes
CREATE POLICY "Users can view notes in their notebooks" ON notes
  FOR SELECT USING (
    notebook_id IN (
      SELECT n.id FROM notebooks n
      JOIN binders b ON n.binder_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notes in their notebooks" ON notes
  FOR INSERT WITH CHECK (
    notebook_id IN (
      SELECT n.id FROM notebooks n
      JOIN binders b ON n.binder_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in their notebooks" ON notes
  FOR UPDATE USING (
    notebook_id IN (
      SELECT n.id FROM notebooks n
      JOIN binders b ON n.binder_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in their notebooks" ON notes
  FOR DELETE USING (
    notebook_id IN (
      SELECT n.id FROM notebooks n
      JOIN binders b ON n.binder_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

-- Create trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to create sample binder for new users
CREATE OR REPLACE FUNCTION public.create_sample_binder()
RETURNS TRIGGER AS $$
DECLARE
  binder_id UUID;
  notebook_id UUID;
BEGIN
  -- Create sample binder
  INSERT INTO public.binders (user_id, title, description, color)
  VALUES (new.id, 'Getting Started with Tome', 'Learn how to use Tome for layered learning', '#3B82F6')
  RETURNING id INTO binder_id;

  -- Create sample notebook
  INSERT INTO public.notebooks (binder_id, title)
  VALUES (binder_id, 'Welcome')
  RETURNING id INTO notebook_id;

  -- Create sample note
  INSERT INTO public.notes (notebook_id, title, content)
  VALUES (
    notebook_id,
    'How to Use Tome',
    '[{"id":"1","level":1,"text":"Paste-to-Create Workflow","children":[{"id":"2","level":2,"text":"Structured Input","children":[{"id":"3","level":3,"text":"Use markdown with layer tags to create hierarchical notes","children":[]},{"id":"4","level":4,"text":"Example: # [L1] Main Concept","children":[]}]},{"id":"5","level":2,"text":"Active Recall","children":[{"id":"6","level":3,"text":"Notes start collapsed to test your memory","children":[]},{"id":"7","level":4,"text":"Click to expand and verify your answers","children":[]}]}]}'::jsonb
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_sample_binder();
